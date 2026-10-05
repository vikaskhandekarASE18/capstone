import { describe, it, expect } from 'vitest';
import { processPayment, getPaymentMethodLabel } from '@/services/paymentService';

describe('processPayment', () => {
  it('returns a transactionId on success', async () => {
    // Run multiple times to account for randomness
    let successCount = 0;
    for (let i = 0; i < 10; i++) {
      const result = await processPayment('card', 500);
      if (result.status === 'success') {
        expect(result.transactionId).toBeTruthy();
        expect(result.transactionId).toMatch(/^TXN/);
        successCount++;
      }
    }
    // Should succeed most of the time (>= 5 out of 10)
    expect(successCount).toBeGreaterThanOrEqual(5);
  }, 30000);

  it('returns correct method in result', async () => {
    const result = await processPayment('upi', 300);
    expect(result.method).toBe('upi');
  });

  it('returns correct amount in result', async () => {
    const result = await processPayment('cod', 450);
    expect(result.amount).toBe(450);
  });

  it('returns empty transactionId on failure', async () => {
    // Test multiple times to catch failures
    let failResult = null;
    for (let i = 0; i < 20; i++) {
      const result = await processPayment('card', 100);
      if (result.status === 'failed') {
        failResult = result;
        break;
      }
    }
    if (failResult) {
      expect(failResult.transactionId).toBe('');
      expect(failResult.message).toContain('declined');
    }
  }, 60000);
});

describe('getPaymentMethodLabel', () => {
  it('returns correct label for card', () => {
    expect(getPaymentMethodLabel('card')).toBe('Credit / Debit Card');
  });

  it('returns correct label for upi', () => {
    expect(getPaymentMethodLabel('upi')).toBe('UPI');
  });

  it('returns correct label for net_banking', () => {
    expect(getPaymentMethodLabel('net_banking')).toBe('Net Banking');
  });

  it('returns correct label for cod', () => {
    expect(getPaymentMethodLabel('cod')).toBe('Cash on Delivery');
  });
});

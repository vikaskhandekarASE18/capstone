import { sleep } from '@/lib/utils';
import type { PaymentMethod, PaymentStatus } from '@/types';

export interface MockPaymentResult {
  transactionId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  message: string;
}

function randomTransactionId() {
  return 'TXN' + Date.now() + Math.random().toString(36).slice(2, 7).toUpperCase();
}

/**
 * Simulates a payment processing flow.
 * Returns success 85% of the time, failed 15%.
 */
export async function processPayment(
  method: PaymentMethod,
  amount: number,
  _details?: Record<string, string>
): Promise<MockPaymentResult> {
  // Simulate network delay
  await sleep(1500 + Math.random() * 1000);

  // Simulate occasional failure
  const shouldFail = Math.random() < 0.15;

  if (shouldFail) {
    return {
      transactionId: '',
      status: 'failed',
      method,
      amount,
      message: 'Payment declined. Please check your details and try again.',
    };
  }

  return {
    transactionId: randomTransactionId(),
    status: 'success',
    method,
    amount,
    message: 'Payment successful!',
  };
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    card: 'Credit / Debit Card',
    upi: 'UPI',
    net_banking: 'Net Banking',
    cod: 'Cash on Delivery',
  };
  return labels[method];
}

import { describe, it, expect } from 'vitest';
import { canCancelOrder, formatPrice, getDiscountPercent, truncate, calculateGiftPointsValue } from '@/lib/utils';

describe('canCancelOrder', () => {
  it('returns true if order was placed less than 48 hours ago', () => {
    const recent = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(); // 20 hours ago
    expect(canCancelOrder(recent)).toBe(true);
  });

  it('returns false if order was placed more than 48 hours ago', () => {
    const old = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(); // 50 hours ago
    expect(canCancelOrder(old)).toBe(false);
  });

  it('returns true at exactly 48 hours boundary', () => {
    const boundary = new Date(Date.now() - 48 * 60 * 60 * 1000 + 1000).toISOString(); // just under
    expect(canCancelOrder(boundary)).toBe(true);
  });

  it('returns false just over 48 hours', () => {
    const over = new Date(Date.now() - 48 * 60 * 60 * 1000 - 1000).toISOString();
    expect(canCancelOrder(over)).toBe(false);
  });
});

describe('formatPrice', () => {
  it('formats a number as Indian Rupees', () => {
    const result = formatPrice(299);
    expect(result).toContain('299');
    expect(result).toContain('₹');
  });

  it('handles zero price', () => {
    expect(formatPrice(0)).toContain('0');
  });
});

describe('getDiscountPercent', () => {
  it('calculates discount percentage correctly', () => {
    expect(getDiscountPercent(500, 250)).toBe(50);
    expect(getDiscountPercent(1000, 750)).toBe(25);
  });

  it('returns 0 when no original price', () => {
    expect(getDiscountPercent(0, 299)).toBe(0);
  });

  it('returns 0 when current price equals original', () => {
    expect(getDiscountPercent(299, 299)).toBe(0);
  });

  it('returns 0 when current price is higher', () => {
    expect(getDiscountPercent(200, 300)).toBe(0);
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    const result = truncate('This is a very long string', 10);
    // slice(0, 10) = 'This is a ' (with trailing space), then '…' appended
    expect(result).toBe('This is a …');
    // 10 chars + 1 ellipsis char = 11
    expect(result.length).toBe(11);
  });

  it('does not truncate short strings', () => {
    expect(truncate('Short', 10)).toBe('Short');
  });
});

describe('calculateGiftPointsValue', () => {
  it('returns 1 rupee per point', () => {
    expect(calculateGiftPointsValue(100)).toBe(100);
    expect(calculateGiftPointsValue(250)).toBe(250);
  });
});

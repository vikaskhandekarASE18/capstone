import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore, selectCartTotals } from '@/store/cartStore';
import type { Book } from '@/types';

const mockBook: Book = {
  id: 'book-1',
  title: 'Test Book',
  author: 'Test Author',
  isbn: '978-0000000001',
  price: 299,
  originalPrice: 499,
  description: 'A test book',
  imageUrl: 'https://example.com/book.jpg',
  categoryId: 'cat-1',
  stock: 10,
  rating: 4.5,
  reviewCount: 100,
};

const mockBook2: Book = {
  ...mockBook,
  id: 'book-2',
  title: 'Another Book',
  price: 399,
};

describe('cartStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.clearCart());
  });

  it('adds a book to cart', () => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.addItem(mockBook));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].bookId).toBe('book-1');
    expect(result.current.items[0].quantity).toBe(1);
  });

  it('increments quantity when same book added again', () => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.addItem(mockBook));
    act(() => result.current.addItem(mockBook));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('does not exceed stock limit', () => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.addItem(mockBook, 10));
    act(() => result.current.addItem(mockBook, 5)); // should cap at 10
    expect(result.current.items[0].quantity).toBe(10);
  });

  it('removes a book from cart', () => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.addItem(mockBook));
    act(() => result.current.removeItem('book-1'));
    expect(result.current.items).toHaveLength(0);
  });

  it('updates quantity correctly', () => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.addItem(mockBook));
    act(() => result.current.updateQuantity('book-1', 3));
    expect(result.current.items[0].quantity).toBe(3);
  });

  it('removes item when quantity set to 0', () => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.addItem(mockBook));
    act(() => result.current.updateQuantity('book-1', 0));
    expect(result.current.items).toHaveLength(0);
  });

  it('clears cart', () => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.addItem(mockBook));
    act(() => result.current.addItem(mockBook2));
    act(() => result.current.clearCart());
    expect(result.current.items).toHaveLength(0);
  });

  it('applies coupon correctly', () => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.applyCoupon('SAVE50', 50));
    expect(result.current.couponCode).toBe('SAVE50');
    expect(result.current.couponDiscount).toBe(50);
  });

  it('removes coupon', () => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.applyCoupon('SAVE50', 50));
    act(() => result.current.removeCoupon());
    expect(result.current.couponCode).toBeNull();
    expect(result.current.couponDiscount).toBe(0);
  });

  it('applies gift points', () => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.applyGiftPoints(100));
    expect(result.current.giftPointsApplied).toBe(100);
  });
});

describe('selectCartTotals', () => {
  it('calculates correct subtotal', () => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.clearCart());
    act(() => result.current.addItem(mockBook, 2)); // 299 * 2 = 598
    act(() => result.current.addItem(mockBook2, 1)); // + 399

    const totals = selectCartTotals(result.current);
    // 299 * 2 + 399 * 1 = 997
    expect(totals.subtotal).toBe(997);
  });

  it('applies free shipping above 500', () => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.clearCart());
    act(() => result.current.addItem(mockBook, 2)); // 598
    const totals = selectCartTotals(result.current);
    expect(totals.shipping).toBe(0);
  });

  it('charges shipping below 500', () => {
    const { result } = renderHook(() => useCartStore());
    act(() => result.current.clearCart());
    act(() => result.current.addItem(mockBook, 1)); // 299
    const totals = selectCartTotals(result.current);
    expect(totals.shipping).toBe(49);
  });
});

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Book } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  giftPointsApplied: number;
  applyGiftPoints: (points: number) => void;
  removeGiftPoints: () => void;
  couponCode: string | null;
  couponDiscount: number;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
}

function generateId() {
  return Math.random().toString(36).slice(2);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      giftPointsApplied: 0,
      couponCode: null,
      couponDiscount: 0,

      addItem: (book, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.bookId === book.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.bookId === book.id
                ? { ...i, quantity: Math.min(i.quantity + quantity, book.stock) }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              { id: generateId(), bookId: book.id, book, quantity },
            ],
          });
        }
      },

      removeItem: (bookId) => {
        set({ items: get().items.filter((i) => i.bookId !== bookId) });
      },

      updateQuantity: (bookId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.bookId !== bookId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.bookId === bookId ? { ...i, quantity } : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [], giftPointsApplied: 0, couponCode: null, couponDiscount: 0 }),

      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      applyGiftPoints: (points) => set({ giftPointsApplied: points }),
      removeGiftPoints: () => set({ giftPointsApplied: 0 }),

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Selector helpers
export function selectCartTotals(state: CartState) {
  const subtotal = state.items.reduce((sum, i) => sum + i.book.price * i.quantity, 0);
  const discount = state.couponDiscount;
  const giftPointsValue = state.giftPointsApplied;
  const shipping = subtotal > 500 ? 0 : 49;
  const total = Math.max(0, subtotal - discount - giftPointsValue + shipping);
  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  return { subtotal, discount, giftPointsValue, shipping, total, totalItems };
}

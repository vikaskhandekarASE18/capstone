import React from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, selectCartTotals } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/ErrorMessage';

export function CartDrawer() {
  const cartStore = useCartStore();
  const { items, isOpen, closeCart, removeItem, updateQuantity } = cartStore;
  const { subtotal, discount, giftPointsValue, shipping, total, totalItems } = selectCartTotals(cartStore);
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-lg text-gray-800">Cart ({totalItems})</h2>
          </div>
          <button onClick={closeCart} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="h-16 w-16" />}
              title="Your cart is empty"
              description="Add books to your cart to see them here."
            />
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <img
                  src={item.book.imageUrl}
                  alt={item.book.title}
                  className="h-20 w-14 object-cover rounded-lg border border-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/books/${item.bookId}`}
                    onClick={closeCart}
                    className="text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-2"
                  >
                    {item.book.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">{item.book.author}</p>
                  <p className="text-sm font-semibold text-blue-600 mt-1">{formatPrice(item.book.price)}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-gray-50 transition"
                      >
                        <Minus className="h-3 w-3 text-gray-600" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium text-gray-700 border-x border-gray-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                        disabled={item.quantity >= item.book.stock}
                        className="px-2 py-1 hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.bookId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-gray-50">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              {giftPointsValue > 0 && (
                <div className="flex justify-between text-purple-600">
                  <span>Gift Points</span>
                  <span>-{formatPrice(giftPointsValue)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800 text-base pt-1 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              fullWidth
              onClick={() => { closeCart(); navigate('/checkout'); }}
            >
              Proceed to Checkout
            </Button>
            <button
              onClick={closeCart}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-1"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

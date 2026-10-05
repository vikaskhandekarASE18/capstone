import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, Gift } from 'lucide-react';
import { useCartStore, selectCartTotals } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { BookCard } from '@/components/books/BookCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/ErrorMessage';
import { formatPrice } from '@/lib/utils';
import { mockBooks } from '@/data/mockData';

const VALID_COUPONS: Record<string, number> = {
  'SAVE50': 50,
  'BOOK100': 100,
  'WELCOME10': 10,
};

export function CartPage() {
  const cartStore = useCartStore();
  const { items, removeItem, updateQuantity, applyCoupon, removeCoupon, applyGiftPoints, removeGiftPoints, couponCode, giftPointsApplied } = cartStore;
  const { subtotal, discount, giftPointsValue, shipping, total, totalItems } = selectCartTotals(cartStore);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = React.useState('');
  const [couponError, setCouponError] = React.useState('');
  const [giftPointInput, setGiftPointInput] = React.useState('');

  const recommendations = mockBooks.filter((b) => !items.some((i) => i.bookId === b.id)).slice(0, 4);

  const handleApplyCoupon = () => {
    const discount = VALID_COUPONS[couponInput.toUpperCase()];
    if (discount) {
      applyCoupon(couponInput.toUpperCase(), discount);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handleApplyGiftPoints = () => {
    const pts = parseInt(giftPointInput);
    if (!isAuthenticated) { alert('Please sign in to use gift points'); return; }
    if (isNaN(pts) || pts <= 0) { return; }
    const available = user?.giftPoints ?? 0;
    applyGiftPoints(Math.min(pts, available, subtotal));
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="h-20 w-20" />}
          title="Your cart is empty"
          description="Looks like you haven't added any books yet. Explore our catalogue!"
          action={
            <Link to="/catalogue" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition inline-block">
              Browse Books
            </Link>
          }
        />
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">You might like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendations.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart <span className="text-gray-400 text-lg font-normal">({totalItems} items)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4">
              <Link to={`/books/${item.bookId}`}>
                <img
                  src={item.book.imageUrl}
                  alt={item.book.title}
                  className="h-28 w-20 object-cover rounded-lg border border-gray-100 shrink-0"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/books/${item.bookId}`} className="font-semibold text-gray-800 hover:text-blue-600 line-clamp-2">
                  {item.book.title}
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">{item.book.author}</p>
                {item.book.category && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {item.book.category.name}
                  </span>
                )}

                <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item.bookId, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-gray-50">
                      <Minus className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium text-gray-700 border-x border-gray-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                      disabled={item.quantity >= item.book.stock}
                      className="px-2.5 py-1.5 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{formatPrice(item.book.price * item.quantity)}</span>
                    <button onClick={() => removeItem(item.bookId)} className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium text-gray-800 text-sm">Coupon Code</h3>
            </div>
            {couponCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <span className="text-sm text-green-700 font-medium">{couponCode} (-{formatPrice(discount)})</span>
                <button onClick={removeCoupon} className="text-green-600 hover:text-green-800">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code (e.g. SAVE50)"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
          </div>

          {/* Gift Points */}
          {isAuthenticated && (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="h-4 w-4 text-purple-500" />
                <h3 className="font-medium text-gray-800 text-sm">Gift Points</h3>
                <span className="ml-auto text-xs text-gray-500">Available: {user?.giftPoints}</span>
              </div>
              {giftPointsApplied > 0 ? (
                <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                  <span className="text-sm text-purple-700 font-medium">{giftPointsApplied} pts (-{formatPrice(giftPointsValue)})</span>
                  <button onClick={removeGiftPoints} className="text-purple-600 hover:text-purple-800">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={giftPointInput}
                    onChange={(e) => setGiftPointInput(e.target.value)}
                    placeholder={`Max ${user?.giftPoints}`}
                    min="1"
                    max={user?.giftPoints}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleApplyGiftPoints}
                    className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
                  >
                    Redeem
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
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
                  <span>Gift Points ({giftPointsApplied} pts)</span>
                  <span>-{formatPrice(giftPointsValue)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Add {formatPrice(500 - subtotal)} more for free shipping</p>
              )}
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              className="mt-4"
              onClick={() => navigate(isAuthenticated ? '/checkout' : '/login')}
            >
              {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendations.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </div>
      )}
    </div>
  );
}

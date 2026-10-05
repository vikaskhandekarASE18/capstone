import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, CreditCard, Gift, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useCartStore, selectCartTotals } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatPrice } from '@/lib/utils';
import { processPayment } from '@/services/paymentService';
import type { PaymentMethod, Address } from '@/types';

type CheckoutStep = 'address' | 'payment' | 'review' | 'confirmation';

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  street: z.string().min(5, 'Street address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  postalCode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  country: z.string().min(1).default('India'),
});

type AddressFormData = {
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    userId: 'user-1',
    label: 'Home',
    street: '42, MG Road, Koregaon Park',
    city: 'Pune',
    state: 'Maharashtra',
    postalCode: '411001',
    country: 'India',
    isDefault: true,
  },
];

export function CheckoutPage() {
  const cartStore = useCartStore();
  const { items, clearCart, giftPointsApplied, applyGiftPoints, removeGiftPoints } = cartStore;
  const { subtotal, discount, giftPointsValue, shipping, total } = selectCartTotals(cartStore);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<CheckoutStep>('address');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(MOCK_ADDRESSES[0]);
  const [addingAddress, setAddingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>({});
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [orderResult, setOrderResult] = useState<{ orderId: string; transactionId: string } | null>(null);
  const [giftPtsInput, setGiftPtsInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<AddressFormData>({ resolver: zodResolver(addressSchema) as any });

  if (items.length === 0 && step !== 'confirmation') {
    navigate('/cart');
    return null;
  }

  const handleSaveAddress = (data: AddressFormData) => {
    const newAddr: Address = {
      id: 'addr-' + Date.now(),
      userId: user?.id ?? '',
      ...data,
      isDefault: false,
    };
    setSelectedAddress(newAddr);
    setAddingAddress(false);
    reset();
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;
    setProcessingPayment(true);
    setPaymentError('');
    try {
      const result = await processPayment(paymentMethod, total, paymentDetails);
      if (result.status === 'failed') {
        setPaymentError(result.message);
        return;
      }
      const orderId = 'ORD-' + Date.now().toString().slice(-8).toUpperCase();
      setOrderResult({ orderId, transactionId: result.transactionId });
      clearCart();
      setStep('confirmation');
    } finally {
      setProcessingPayment(false);
    }
  };

  const STEPS: CheckoutStep[] = ['address', 'payment', 'review', 'confirmation'];
  const stepIndex = STEPS.indexOf(step);

  // ─────────── CONFIRMATION SCREEN ───────────
  if (step === 'confirmation') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-1">
          Your order <span className="font-semibold text-gray-800">#{orderResult?.orderId}</span> has been confirmed.
        </p>
        {orderResult?.transactionId && (
          <p className="text-sm text-gray-400 mb-6">Transaction ID: {orderResult.transactionId}</p>
        )}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700 mb-8">
          🎁 You've earned <strong>{Math.floor(total / 10)} gift points</strong> for this order!
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate('/orders')} variant="outline">View My Orders</Button>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {['Address', 'Payment', 'Review'].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${i <= stepIndex ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < stepIndex ? 'bg-blue-600 border-blue-600 text-white' : i === stepIndex ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span className="text-sm font-medium whitespace-nowrap">{s}</span>
            </div>
            {i < 2 && <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">

          {/* STEP 1: Address */}
          {step === 'address' && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" /> Delivery Address
              </h2>

              {/* Saved addresses */}
              <div className="space-y-3 mb-4">
                {MOCK_ADDRESSES.map((addr) => (
                  <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${selectedAddress?.id === addr.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === addr.id}
                      onChange={() => setSelectedAddress(addr)}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{addr.label}</p>
                      <p className="text-sm text-gray-600">{addr.street}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.postalCode}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Add new address form */}
              {addingAddress ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <form onSubmit={handleSubmit(handleSaveAddress as any)} className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <h3 className="font-medium text-gray-700 text-sm">New Address</h3>
                  <Input label="Label (e.g. Home, Office)" placeholder="Home" error={errors.label?.message} {...register('label')} />
                  <Input label="Street Address" placeholder="42, MG Road" error={errors.street?.message} {...register('street')} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="City" placeholder="Pune" error={errors.city?.message} {...register('city')} />
                    <Input label="State" placeholder="Maharashtra" error={errors.state?.message} {...register('state')} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="PIN Code" placeholder="411001" error={errors.postalCode?.message} {...register('postalCode')} />
                    <Input label="Country" placeholder="India" {...register('country')} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">Save Address</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setAddingAddress(false)}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAddingAddress(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2"
                >
                  + Add New Address
                </button>
              )}

              <Button
                fullWidth
                size="lg"
                className="mt-6"
                disabled={!selectedAddress}
                onClick={() => setStep('payment')}
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 'payment' && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" /> Payment Method
              </h2>

              {/* Gift Points */}
              {user && user.giftPoints > 0 && (
                <div className="mb-4 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      You have {user.giftPoints} gift points (worth {formatPrice(user.giftPoints)})
                    </span>
                  </div>
                  {giftPointsApplied > 0 ? (
                    <div className="flex items-center justify-between text-sm text-purple-700">
                      <span>Applied: {giftPointsApplied} pts (-{formatPrice(giftPointsValue)})</span>
                      <button onClick={removeGiftPoints} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="number"
                        value={giftPtsInput}
                        onChange={(e) => setGiftPtsInput(e.target.value)}
                        placeholder={`Max ${Math.min(user.giftPoints, subtotal)}`}
                        className="flex-1 border border-purple-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <button
                        onClick={() => {
                          const pts = parseInt(giftPtsInput);
                          if (!isNaN(pts)) applyGiftPoints(Math.min(pts, user.giftPoints, subtotal));
                        }}
                        className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {([
                  { value: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                  { value: 'upi', label: 'UPI', desc: 'PhonePe, GPay, Paytm' },
                  { value: 'net_banking', label: 'Net Banking', desc: 'All major banks supported' },
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when delivered' },
                ] as const).map((m) => (
                  <label
                    key={m.value}
                    className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === m.value ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === m.value}
                      onChange={() => { setPaymentMethod(m.value); setPaymentDetails({}); }}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Card details */}
              {paymentMethod === 'card' && (
                <div className="mt-4 space-y-3">
                  <Input
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    value={paymentDetails.cardNumber ?? ''}
                    onChange={(e) => setPaymentDetails((d) => ({ ...d, cardNumber: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Expiry (MM/YY)"
                      placeholder="12/26"
                      value={paymentDetails.expiry ?? ''}
                      onChange={(e) => setPaymentDetails((d) => ({ ...d, expiry: e.target.value }))}
                    />
                    <Input
                      label="CVV"
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={paymentDetails.cvv ?? ''}
                      onChange={(e) => setPaymentDetails((d) => ({ ...d, cvv: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* UPI */}
              {paymentMethod === 'upi' && (
                <div className="mt-4">
                  <Input
                    label="UPI ID"
                    placeholder="yourname@upi"
                    value={paymentDetails.upiId ?? ''}
                    onChange={(e) => setPaymentDetails((d) => ({ ...d, upiId: e.target.value }))}
                  />
                </div>
              )}

              {/* Net Banking */}
              {paymentMethod === 'net_banking' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank</label>
                  <select
                    value={paymentDetails.bank ?? ''}
                    onChange={(e) => setPaymentDetails((d) => ({ ...d, bank: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose your bank</option>
                    {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak'].map((b) => (
                      <option key={b} value={b}>{b} Bank</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep('address')}>Back</Button>
                <Button fullWidth onClick={() => setStep('review')}>Review Order</Button>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Delivery To</h2>
                {selectedAddress && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-800">{selectedAddress.label}</p>
                    <p>{selectedAddress.street}</p>
                    <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postalCode}</p>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Payment Method</h2>
                <p className="text-sm text-gray-700 capitalize">{paymentMethod.replace('_', ' ')}</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Items ({items.length})</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img src={item.book.imageUrl} alt={item.book.title} className="h-14 w-10 object-cover rounded-lg border border-gray-100" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.book.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{formatPrice(item.book.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {paymentError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-4 text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm">{paymentError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
                <Button
                  fullWidth
                  loading={processingPayment}
                  onClick={handlePlaceOrder}
                  size="lg"
                >
                  {processingPayment ? 'Processing Payment…' : `Place Order · ${formatPrice(total)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 h-fit">
          <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-{formatPrice(discount)}</span></div>}
            {giftPointsValue > 0 && <div className="flex justify-between text-purple-600"><span>Gift Points</span><span>-{formatPrice(giftPointsValue)}</span></div>}
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-gray-900 text-base">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, RotateCcw, X, ShoppingCart } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/ErrorMessage';
import { formatPrice, formatDate, canCancelOrder } from '@/lib/utils';
import { mockBooks } from '@/data/mockData';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

// Generate realistic mock orders
const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-98765432',
    userId: 'user-1',
    items: [
      { id: 'oi-1', bookId: 'book-1', book: mockBooks[0], quantity: 1, unitPrice: 299, totalPrice: 299 },
      { id: 'oi-2', bookId: 'book-5', book: mockBooks[4], quantity: 2, unitPrice: 399, totalPrice: 798 },
    ],
    status: 'delivered',
    totalAmount: 1097,
    giftPointsUsed: 0,
    giftPointsEarned: 109,
    shippingAddressId: 'addr-1',
    shippingAddress: {
      id: 'addr-1', userId: 'user-1', label: 'Home',
      street: '42, MG Road', city: 'Pune', state: 'Maharashtra',
      postalCode: '411001', country: 'India', isDefault: true,
    },
    payment: {
      id: 'pay-1', orderId: 'ORD-98765432', method: 'card',
      status: 'success', amount: 1097, transactionId: 'TXN12345',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    canCancel: false,
  },
  {
    id: 'ORD-76543210',
    userId: 'user-1',
    items: [
      { id: 'oi-3', bookId: 'book-3', book: mockBooks[2], quantity: 1, unitPrice: 499, totalPrice: 499 },
    ],
    status: 'processing',
    totalAmount: 499,
    giftPointsUsed: 50,
    giftPointsEarned: 49,
    shippingAddressId: 'addr-1',
    shippingAddress: {
      id: 'addr-1', userId: 'user-1', label: 'Home',
      street: '42, MG Road', city: 'Pune', state: 'Maharashtra',
      postalCode: '411001', country: 'India', isDefault: true,
    },
    payment: {
      id: 'pay-2', orderId: 'ORD-76543210', method: 'upi',
      status: 'success', amount: 499, transactionId: 'TXN67890',
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
    canCancel: true,
  },
];

const STATUS_BADGE_VARIANT: Record<OrderStatus, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

export function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const { addItem, openCart } = useCartStore();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Please <Link to="/login" className="text-blue-600 hover:underline">sign in</Link> to view your orders.</p>
      </div>
    );
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!canCancelOrder(orders.find((o) => o.id === orderId)?.createdAt ?? '')) {
      alert('This order cannot be cancelled (48-hour window has passed).');
      return;
    }
    setCancelling(orderId);
    await new Promise((r) => setTimeout(r, 800));
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'cancelled', canCancel: false } : o));
    setCancelling(null);
  };

  const handleBuyAgain = (order: Order) => {
    order.items.forEach((item) => addItem(item.book, item.quantity));
    openCart();
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Package className="h-20 w-20" />}
          title="No orders yet"
          description="You haven't placed any orders yet. Start exploring our catalogue!"
          action={
            <Link to="/catalogue" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition">
              Browse Books
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            {/* Order Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Order #{order.id}</p>
                <p className="text-xs text-gray-500 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={STATUS_BADGE_VARIANT[order.status]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <span className="font-semibold text-gray-800">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Items preview */}
            <div className="px-5 py-4">
              <div className="flex gap-3 flex-wrap">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-2 items-center">
                    <img
                      src={item.book.imageUrl}
                      alt={item.book.title}
                      className="h-12 w-9 object-cover rounded border border-gray-100"
                    />
                    <div>
                      <p className="text-xs font-medium text-gray-700 line-clamp-1 max-w-[120px]">{item.book.title}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-4 flex items-center gap-3 flex-wrap">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                className="text-gray-600"
              >
                {expandedOrderId === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBuyAgain(order)}
              >
                <RotateCcw className="h-4 w-4" />
                Buy Again
              </Button>

              {order.canCancel && order.status !== 'cancelled' && canCancelOrder(order.createdAt) && (
                <Button
                  size="sm"
                  variant="danger"
                  loading={cancelling === order.id}
                  onClick={() => handleCancelOrder(order.id)}
                >
                  <X className="h-4 w-4" />
                  Cancel Order
                </Button>
              )}
            </div>

            {/* Expanded Details */}
            {expandedOrderId === order.id && (
              <div className="border-t border-gray-50 px-5 py-4 bg-gray-50 space-y-4 text-sm">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Delivery Address</h4>
                    {order.shippingAddress && (
                      <div className="text-gray-600 text-xs space-y-0.5">
                        <p className="font-medium">{order.shippingAddress.label}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Payment Info</h4>
                    {order.payment && (
                      <div className="text-gray-600 text-xs space-y-0.5">
                        <p>Method: <span className="font-medium capitalize">{order.payment.method.replace('_', ' ')}</span></p>
                        <p>Status: <span className={`font-medium ${order.payment.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{order.payment.status}</span></p>
                        {order.payment.transactionId && <p>TXN: {order.payment.transactionId}</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Full item list */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-700">{item.book.title}</span>
                          <span className="text-gray-400">×{item.quantity}</span>
                        </div>
                        <span className="font-medium text-gray-800">{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                    {order.giftPointsUsed > 0 && (
                      <div className="flex items-center justify-between text-purple-600 text-xs pt-1 border-t border-gray-100">
                        <span>Gift points used</span>
                        <span>-{formatPrice(order.giftPointsUsed)}</span>
                      </div>
                    )}
                    {order.giftPointsEarned > 0 && (
                      <div className="flex items-center justify-between text-green-600 text-xs">
                        <span>Gift points earned</span>
                        <span>+{order.giftPointsEarned} pts</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

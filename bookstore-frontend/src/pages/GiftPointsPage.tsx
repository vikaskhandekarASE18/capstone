import React from 'react';
import { Gift, Star, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';

const MOCK_GIFT_HISTORY = [
  { id: '1', points: 50, reason: 'Welcome bonus', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', points: 109, reason: 'Order #ORD-98765432', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', points: -50, reason: 'Redeemed on Order #ORD-76543210', createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() },
  { id: '4', points: 49, reason: 'Order #ORD-76543210', createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() },
];

export function GiftPointsPage() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">
          Please <Link to="/login" className="text-blue-600 hover:underline">sign in</Link> to view your gift points.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gift Points</h1>

      {/* Balance card */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="h-8 w-8" />
          <h2 className="text-lg font-semibold">Your Gift Points Balance</h2>
        </div>
        <p className="text-5xl font-bold mb-1">{user?.giftPoints ?? 0}</p>
        <p className="text-purple-100 text-sm">Worth ₹{user?.giftPoints ?? 0} · Use during checkout</p>
      </div>

      {/* How it works */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: <Star className="h-5 w-5 text-yellow-500" />, title: 'Earn Points', desc: 'Get 1 point for every ₹10 spent' },
          { icon: <Gift className="h-5 w-5 text-purple-500" />, title: 'Redeem Points', desc: '1 point = ₹1 discount' },
          { icon: <TrendingUp className="h-5 w-5 text-green-500" />, title: 'No Expiry', desc: 'Points never expire' },
        ].map((item) => (
          <div key={item.title} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="p-2 bg-gray-50 rounded-lg w-fit mb-3">{item.icon}</div>
            <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="bg-white border border-gray-100 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Transaction History</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {MOCK_GIFT_HISTORY.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{txn.reason}</p>
                <p className="text-xs text-gray-400">{formatDate(txn.createdAt)}</p>
              </div>
              <span className={`font-semibold text-sm ${txn.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {txn.points > 0 ? '+' : ''}{txn.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

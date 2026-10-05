import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, BookOpen, User, Menu, X, Gift, Package } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore, selectCartTotals } from '@/store/cartStore';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartStore = useCartStore();
  const { totalItems } = selectCartTotals(cartStore);
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <BookOpen className="h-7 w-7 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">BookStore</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books, authors, categories…"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </form>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => cartStore.openCart()}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    {user?.firstName?.[0]}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">{user?.firstName}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                    <Link to="/gift-points" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Gift className="h-4 w-4" /> Gift Points <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-1.5 rounded-full">{user?.giftPoints}</span>
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50">
                  Sign in
                </Link>
                <Link to="/register" className="hidden sm:block bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              className="sm:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books…"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </form>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav className="sm:hidden border-t border-gray-100 py-3 space-y-1">
            <Link to="/catalogue" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Catalogue</Link>
            {isAuthenticated ? (
              <>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">My Orders</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Sign in</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg">Register</Link>
              </>
            )}
          </nav>
        )}
      </div>

      {/* Category nav */}
      <div className="hidden md:block bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-6 overflow-x-auto py-2 text-sm text-gray-600 no-scrollbar">
            <Link to="/catalogue" className="hover:text-blue-600 whitespace-nowrap">All Books</Link>
            <Link to="/catalogue?category=fiction" className="hover:text-blue-600 whitespace-nowrap">Fiction</Link>
            <Link to="/catalogue?category=non-fiction" className="hover:text-blue-600 whitespace-nowrap">Non-Fiction</Link>
            <Link to="/catalogue?category=science-tech" className="hover:text-blue-600 whitespace-nowrap">Science & Tech</Link>
            <Link to="/catalogue?category=self-help" className="hover:text-blue-600 whitespace-nowrap">Self Help</Link>
            <Link to="/catalogue?category=history" className="hover:text-blue-600 whitespace-nowrap">History</Link>
            <Link to="/catalogue?category=children" className="hover:text-blue-600 whitespace-nowrap">Children</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight, Truck, Shield, RotateCcw, Star } from 'lucide-react';
import { mockBooks, mockCategories } from '@/data/mockData';
import { BookCard } from '@/components/books/BookCard';

export function HomePage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const featuredBooks = mockBooks.filter((b) => b.isFeatured).slice(0, 8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-blue-500/30 text-blue-100 text-sm font-medium px-3 py-1 rounded-full mb-4">
                📚 10,000+ Books Available
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Discover Your Next<br />
                <span className="text-yellow-400">Favourite Book</span>
              </h1>
              <p className="text-blue-100 text-lg mb-8 max-w-lg">
                Explore thousands of books across genres. From timeless classics to modern bestsellers — find your perfect read today.
              </p>
              <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search books, authors, ISBN…"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-yellow-300 transition"
                >
                  Search
                </button>
              </form>
              <div className="flex flex-wrap gap-2 mt-4">
                {['Fiction', 'Non-Fiction', 'Science & Tech', 'Self Help'].map((t) => (
                  <Link
                    key={t}
                    to={`/catalogue?search=${t}`}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {featuredBooks.slice(0, 4).map((book) => (
                <Link key={book.id} to={`/books/${book.id}`} className="group">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition">
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-full aspect-[3/4] object-cover rounded-lg mb-2"
                    />
                    <p className="text-sm font-medium text-white line-clamp-1">{book.title}</p>
                    <p className="text-xs text-blue-200">{book.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Truck className="h-5 w-5 text-blue-600" />, label: 'Free Delivery', sub: 'On orders above ₹500' },
              { icon: <Shield className="h-5 w-5 text-green-600" />, label: 'Secure Payment', sub: 'PCI DSS compliant' },
              { icon: <RotateCcw className="h-5 w-5 text-purple-600" />, label: 'Easy Returns', sub: 'Cancel within 48 hrs' },
              { icon: <Star className="h-5 w-5 text-yellow-500" />, label: 'Gift Points', sub: 'Earn on every purchase' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">{item.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
            <Link to="/catalogue" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogue?category=${cat.slug}`}
                className="group flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-gray-100 group-hover:border-blue-300 transition">
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Books</h2>
              <p className="text-gray-500 text-sm mt-1">Handpicked selections for you</p>
            </div>
            <Link to="/catalogue" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* All Books */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">All Books</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Browse Full Catalogue <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-3">Earn Gift Points on Every Purchase</h2>
          <p className="text-purple-100 mb-6 max-w-xl mx-auto">
            Get 1 point for every ₹10 spent. Redeem your points for discounts on your next order.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-purple-700 font-semibold px-8 py-3 rounded-xl hover:bg-purple-50 transition"
          >
            Join Now — It's Free
          </Link>
        </div>
      </section>
    </div>
  );
}

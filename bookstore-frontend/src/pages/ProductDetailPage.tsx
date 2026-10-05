import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart, Zap, Star, Truck, RotateCcw, Package,
  ChevronRight, Minus, Plus, BookOpen,
} from 'lucide-react';
import { mockBooks } from '@/data/mockData';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { BookCard } from '@/components/books/BookCard';
import { RatingStars, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice, getDiscountPercent } from '@/lib/utils';

const MOCK_REVIEWS = [
  { id: '1', userId: 'u1', bookId: '', user: { firstName: 'Priya', lastName: 'S.' }, rating: 5, comment: 'Absolutely loved this book. A must-read for everyone!', createdAt: '2024-03-10T00:00:00Z' },
  { id: '2', userId: 'u2', bookId: '', user: { firstName: 'Rahul', lastName: 'M.' }, rating: 4, comment: 'Great content but slightly slow in the middle chapters.', createdAt: '2024-02-22T00:00:00Z' },
  { id: '3', userId: 'u3', bookId: '', user: { firstName: 'Ananya', lastName: 'K.' }, rating: 5, comment: 'Changed my perspective completely. Highly recommended.', createdAt: '2024-01-15T00:00:00Z' },
];

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, openCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  const book = mockBooks.find((b) => b.id === id);

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <BookOpen className="h-16 w-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Book not found</h2>
        <Link to="/catalogue" className="mt-4 inline-block text-blue-600 hover:underline">
          Browse Catalogue
        </Link>
      </div>
    );
  }

  const discount = getDiscountPercent(book.originalPrice ?? 0, book.price);
  const relatedBooks = mockBooks.filter((b) => b.categoryId === book.categoryId && b.id !== book.id).slice(0, 4);

  const handleAddToCart = () => {
    addItem(book, quantity);
    openCart();
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addItem(book, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/catalogue" className="hover:text-blue-600">Catalogue</Link>
        <ChevronRight className="h-4 w-4" />
        {book.category && (
          <>
            <Link to={`/catalogue?category=${book.category.slug}`} className="hover:text-blue-600">
              {book.category.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-gray-800 font-medium truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Image */}
        <div>
          <div className="relative aspect-[3/4] max-w-sm mx-auto lg:mx-0 rounded-2xl overflow-hidden border border-gray-100 shadow-md">
            <img
              src={book.imageUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          {book.category && (
            <Link to={`/catalogue?category=${book.category.slug}`}>
              <Badge variant="info">{book.category.name}</Badge>
            </Link>
          )}
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-3 mb-2">{book.title}</h1>
          <p className="text-gray-500 mb-4">by <span className="font-medium text-gray-700">{book.author}</span></p>

          <div className="flex items-center gap-3 mb-4">
            <RatingStars rating={book.rating} count={book.reviewCount} />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(book.price)}</span>
            {book.originalPrice && book.originalPrice > book.price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(book.originalPrice)}</span>
                <span className="text-green-600 font-semibold text-sm">Save {formatPrice(book.originalPrice - book.price)}</span>
              </>
            )}
          </div>

          {/* Delivery info */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Truck className="h-4 w-4 shrink-0" />
              <span>Free delivery on orders above ₹500</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <RotateCcw className="h-4 w-4 shrink-0" />
              <span>Easy returns within 48 hours</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Package className="h-4 w-4 shrink-0" />
              <span>Usually shipped in 2–4 business days</span>
            </div>
          </div>

          {/* Stock */}
          <p className={`text-sm font-medium mb-4 ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {book.stock > 0 ? `In Stock (${book.stock} available)` : 'Out of Stock'}
          </p>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-50 transition"
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-800 border-x border-gray-200 min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(book.stock, q + 1))}
                disabled={quantity >= book.stock}
                className="px-3 py-2 hover:bg-gray-50 transition disabled:opacity-50"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              size="lg"
              disabled={book.stock === 0}
              className="flex-1"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              size="lg"
              disabled={book.stock === 0}
              className="flex-1"
            >
              <Zap className="h-5 w-5" />
              Buy Now
            </Button>
          </div>

          {/* Book Details */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Book Details</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {book.isbn && (
                <>
                  <dt className="text-gray-500">ISBN</dt>
                  <dd className="text-gray-800 font-medium">{book.isbn}</dd>
                </>
              )}
              {book.publisher && (
                <>
                  <dt className="text-gray-500">Publisher</dt>
                  <dd className="text-gray-800 font-medium">{book.publisher.name}</dd>
                </>
              )}
              {book.pages && (
                <>
                  <dt className="text-gray-500">Pages</dt>
                  <dd className="text-gray-800 font-medium">{book.pages}</dd>
                </>
              )}
              {book.language && (
                <>
                  <dt className="text-gray-500">Language</dt>
                  <dd className="text-gray-800 font-medium">{book.language}</dd>
                </>
              )}
              {book.publishedYear && (
                <>
                  <dt className="text-gray-500">Year</dt>
                  <dd className="text-gray-800 font-medium">{book.publishedYear}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Tabs: Description & Reviews */}
      <div className="mt-12 border-t border-gray-100 pt-8">
        <div className="flex gap-6 border-b border-gray-100 mb-6">
          {(['description', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab} {tab === 'reviews' && `(${MOCK_REVIEWS.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="max-w-3xl">
            <p className="text-gray-600 leading-relaxed text-base">{book.description}</p>
            {book.tags && book.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {book.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4 max-w-3xl">
            {MOCK_REVIEWS.map((review) => (
              <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {review.user?.firstName} {review.user?.lastName}
                    </p>
                    <RatingStars rating={review.rating} />
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Related Books</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

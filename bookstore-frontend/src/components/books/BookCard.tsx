import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import type { Book } from '@/types';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: Book;
  className?: string;
}

export function BookCard({ book, className }: BookCardProps) {
  const { addItem, openCart } = useCartStore();
  const discount = getDiscountPercent(book.originalPrice ?? 0, book.price);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(book);
    openCart();
  };

  return (
    <Link
      to={`/books/${book.id}`}
      className={cn(
        'group block bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 overflow-hidden',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <img
          src={book.imageUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {book.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-600">Out of Stock</span>
          </div>
        )}
        {/* Quick add */}
        <button
          onClick={handleAddToCart}
          disabled={book.stock === 0}
          className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-0.5 group-hover:text-blue-600 transition">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2 truncate">{book.author}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-gray-700">{book.rating}</span>
          <span className="text-xs text-gray-400">({book.reviewCount.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-gray-900">{formatPrice(book.price)}</span>
          {book.originalPrice && book.originalPrice > book.price && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(book.originalPrice)}</span>
          )}
        </div>

        {book.category && (
          <span className="mt-2 inline-block text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {book.category.name}
          </span>
        )}
      </div>
    </Link>
  );
}

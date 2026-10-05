import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { mockBooks, mockCategories, mockBrands } from '@/data/mockData';
import { BookCard } from '@/components/books/BookCard';
import { EmptyState } from '@/components/ui/ErrorMessage';
import type { BookFilters } from '@/types';
import { formatPrice } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState<Record<string, boolean>>({
    category: true,
    brand: true,
    price: true,
  });

  const filters: BookFilters = {
    search: searchParams.get('search') || undefined,
    categoryId: searchParams.get('category') || undefined,
    brandId: searchParams.get('brand') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sortBy: (searchParams.get('sort') as BookFilters['sortBy']) || 'popular',
  };

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  const filteredBooks = useMemo(() => {
    let books = [...mockBooks];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      books = books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.includes(q) ||
          b.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.categoryId) {
      const cat = mockCategories.find((c) => c.slug === filters.categoryId);
      if (cat) books = books.filter((b) => b.categoryId === cat.id);
    }

    if (filters.brandId) {
      books = books.filter((b) => b.brandId === filters.brandId);
    }

    if (filters.minPrice !== undefined) {
      books = books.filter((b) => b.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      books = books.filter((b) => b.price <= filters.maxPrice!);
    }

    switch (filters.sortBy) {
      case 'price_asc': books.sort((a, b) => a.price - b.price); break;
      case 'price_desc': books.sort((a, b) => b.price - a.price); break;
      case 'rating': books.sort((a, b) => b.rating - a.rating); break;
      case 'newest': books.sort((a, b) => (b.publishedYear ?? 0) - (a.publishedYear ?? 0)); break;
      case 'popular': books.sort((a, b) => b.reviewCount - a.reviewCount); break;
    }

    return books;
  }, [filters.search, filters.categoryId, filters.brandId, filters.minPrice, filters.maxPrice, filters.sortBy]);

  const activeFilterCount = [filters.search, filters.categoryId, filters.brandId, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  const toggleSection = (key: string) =>
    setFiltersExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const Sidebar = () => (
    <aside className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
            <X className="h-3 w-3" /> Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Category */}
      <div className="border border-gray-100 rounded-xl p-4">
        <button
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
          onClick={() => toggleSection('category')}
        >
          Category
          {filtersExpanded.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {filtersExpanded.category && (
          <div className="space-y-2">
            {mockCategories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={filters.categoryId === cat.slug}
                  onChange={() => updateFilter('category', cat.slug)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-600 group-hover:text-blue-600">{cat.name}</span>
              </label>
            ))}
            {filters.categoryId && (
              <button onClick={() => updateFilter('category', undefined)} className="text-xs text-blue-600 mt-1">
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="border border-gray-100 rounded-xl p-4">
        <button
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
          onClick={() => toggleSection('brand')}
        >
          Brand / Publisher
          {filtersExpanded.brand ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {filtersExpanded.brand && (
          <div className="space-y-2">
            {mockBrands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="brand"
                  checked={filters.brandId === brand.id}
                  onChange={() => updateFilter('brand', brand.id)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-600 group-hover:text-blue-600">{brand.name}</span>
              </label>
            ))}
            {filters.brandId && (
              <button onClick={() => updateFilter('brand', undefined)} className="text-xs text-blue-600 mt-1">
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border border-gray-100 rounded-xl p-4">
        <button
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
          onClick={() => toggleSection('price')}
        >
          Price Range
          {filtersExpanded.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {filtersExpanded.price && (
          <div className="space-y-2">
            {[
              { label: 'Under ₹300', min: undefined, max: 300 },
              { label: '₹300 – ₹500', min: 300, max: 500 },
              { label: '₹500 – ₹700', min: 500, max: 700 },
              { label: 'Above ₹700', min: 700, max: undefined },
            ].map((range) => (
              <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                  onChange={() => {
                    updateFilter('minPrice', range.min?.toString());
                    updateFilter('maxPrice', range.max?.toString());
                  }}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-600 group-hover:text-blue-600">{range.label}</span>
              </label>
            ))}
            {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
              <button
                onClick={() => { updateFilter('minPrice', undefined); updateFilter('maxPrice', undefined); }}
                className="text-xs text-blue-600 mt-1"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {filters.search ? `Results for "${filters.search}"` : filters.categoryId ? mockCategories.find((c) => c.slug === filters.categoryId)?.name ?? 'Catalogue' : 'All Books'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{filteredBooks.length} books found</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile filter button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {activeFilterCount > 0 && <span className="bg-blue-600 text-white text-xs px-1.5 rounded-full">{activeFilterCount}</span>}
          </button>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-72 bg-white z-50 shadow-2xl overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Filters</h2>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <Sidebar />
              <button
                onClick={() => setSidebarOpen(false)}
                className="mt-6 w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Apply Filters
              </button>
            </div>
          </>
        )}

        {/* Book Grid */}
        <div className="flex-1">
          {filteredBooks.length === 0 ? (
            <EmptyState
              title="No books found"
              description="Try adjusting your filters or search query."
              action={
                <button onClick={clearFilters} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                  Clear Filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

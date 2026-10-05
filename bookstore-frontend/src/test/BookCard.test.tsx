import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { BookCard } from '@/components/books/BookCard';
import type { Book } from '@/types';

const mockBook: Book = {
  id: 'book-1',
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  isbn: '978-0743273565',
  price: 299,
  originalPrice: 499,
  description: 'Classic novel',
  imageUrl: 'https://example.com/book.jpg',
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Fiction', slug: 'fiction' },
  stock: 50,
  rating: 4.5,
  reviewCount: 1247,
};

const outOfStockBook: Book = { ...mockBook, id: 'book-oos', stock: 0 };

function renderBookCard(book: Book) {
  return render(
    <MemoryRouter>
      <BookCard book={book} />
    </MemoryRouter>
  );
}

describe('BookCard', () => {
  it('renders book title', () => {
    renderBookCard(mockBook);
    expect(screen.getByText('The Great Gatsby')).toBeDefined();
  });

  it('renders author name', () => {
    renderBookCard(mockBook);
    expect(screen.getByText('F. Scott Fitzgerald')).toBeDefined();
  });

  it('renders book price', () => {
    renderBookCard(mockBook);
    expect(screen.getByText(/299/)).toBeDefined();
  });

  it('shows discount badge for discounted books', () => {
    renderBookCard(mockBook);
    expect(screen.getByText(/-40%/)).toBeDefined();
  });

  it('shows category badge', () => {
    renderBookCard(mockBook);
    expect(screen.getByText('Fiction')).toBeDefined();
  });

  it('shows Out of Stock overlay for books with stock 0', () => {
    renderBookCard(outOfStockBook);
    expect(screen.getByText('Out of Stock')).toBeDefined();
  });

  it('links to correct product page', () => {
    renderBookCard(mockBook);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/books/book-1');
  });

  it('renders rating', () => {
    renderBookCard(mockBook);
    expect(screen.getByText('4.5')).toBeDefined();
  });
});

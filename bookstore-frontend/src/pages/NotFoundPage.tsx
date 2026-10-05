import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <BookOpen className="h-24 w-24 text-gray-100 mb-6" />
      <h1 className="text-6xl font-bold text-gray-800 mb-3">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Oops! The page you're looking for doesn't exist. It may have been moved or deleted.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
      >
        <Home className="h-4 w-4" />
        Go Home
      </Link>
    </div>
  );
}

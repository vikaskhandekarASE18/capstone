import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600',
        sizes[size],
        className
      )}
    />
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  );
}

interface LoadingCardProps {
  count?: number;
}

export function LoadingCards({ count = 4 }: LoadingCardProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg aspect-[3/4] mb-3" />
          <div className="bg-gray-200 rounded h-4 mb-2" />
          <div className="bg-gray-200 rounded h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

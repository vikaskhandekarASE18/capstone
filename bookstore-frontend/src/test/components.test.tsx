import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge, RatingStars } from '@/components/ui/Badge';
import { ErrorMessage, EmptyState } from '@/components/ui/ErrorMessage';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('shows spinner when loading', () => {
    const { container } = render(<Button loading>Submit</Button>);
    expect(container.querySelector('.animate-spin')).toBeDefined();
  });

  it('is disabled when loading', () => {
    render(<Button loading>Submit</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveProperty('disabled', true);
  });

  it('is disabled when disabled prop passed', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toHaveProperty('disabled', true);
  });
});

describe('Badge', () => {
  it('renders badge text', () => {
    render(<Badge>Success</Badge>);
    expect(screen.getByText('Success')).toBeDefined();
  });

  it('applies success variant classes', () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    const el = container.firstChild as HTMLElement;
    expect(el?.className).toContain('bg-green-100');
  });
});

describe('RatingStars', () => {
  it('renders 5 stars', () => {
    const { container } = render(<RatingStars rating={4.5} />);
    const stars = container.querySelectorAll('svg');
    expect(stars).toHaveLength(5);
  });

  it('shows count when provided', () => {
    render(<RatingStars rating={4.5} count={1247} />);
    expect(screen.getByText('(1,247)')).toBeDefined();
  });
});

describe('ErrorMessage', () => {
  it('shows default message', () => {
    render(<ErrorMessage />);
    expect(screen.getByText('Something went wrong.')).toBeDefined();
  });

  it('shows custom message', () => {
    render(<ErrorMessage message="Custom error" />);
    expect(screen.getByText('Custom error')).toBeDefined();
  });

  it('shows retry button when onRetry provided', () => {
    render(<ErrorMessage onRetry={() => {}} />);
    expect(screen.getByText('Try Again')).toBeDefined();
  });
});

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeDefined();
  });

  it('renders description', () => {
    render(<EmptyState description="No items found" />);
    expect(screen.getByText('No items found')).toBeDefined();
  });
});

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getDiscountPercent(original: number, current: number): number {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}

export function canCancelOrder(createdAt: string): boolean {
  const orderDate = new Date(createdAt).getTime();
  const now = Date.now();
  const fortyEightHours = 48 * 60 * 60 * 1000;
  return now - orderDate <= fortyEightHours;
}

export function calculateGiftPointsValue(points: number): number {
  // 1 point = ₹1
  return points;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Core entity types

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  giftPoints: number;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Publisher {
  id: string;
  name: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  price: number;
  originalPrice?: number;
  description: string;
  imageUrl: string;
  images?: string[];
  categoryId: string;
  category?: Category;
  publisherId?: string;
  publisher?: Publisher;
  brandId?: string;
  brand?: Brand;
  stock: number;
  rating: number;
  reviewCount: number;
  tags?: string[];
  isFeatured?: boolean;
  language?: string;
  pages?: number;
  publishedYear?: number;
}

export interface CartItem {
  id: string;
  bookId: string;
  book: Book;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  giftPointsApplied: number;
  total: number;
}

export interface OrderItem {
  id: string;
  bookId: string;
  book: Book;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export type PaymentMethod = 'card' | 'upi' | 'net_banking' | 'cod';

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  giftPointsUsed: number;
  giftPointsEarned: number;
  shippingAddressId: string;
  shippingAddress?: Address;
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
  canCancel: boolean;
}

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  user?: Pick<User, 'firstName' | 'lastName'>;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface GiftPoint {
  id: string;
  userId: string;
  points: number;
  reason: string;
  createdAt: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter / query types
export interface BookFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

export interface CheckoutForm {
  addressId: string;
  paymentMethod: PaymentMethod;
  giftPointsToRedeem: number;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  upiId?: string;
}

export interface AuthLoginForm {
  email: string;
  password: string;
}

export interface AuthRegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

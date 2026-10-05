import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { CataloguePage } from '@/pages/CataloguePage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { GiftPointsPage } from '@/pages/GiftPointsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages (no Layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Main pages (with Layout) */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/books/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Protected routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gift-points"
            element={
              <ProtectedRoute>
                <GiftPointsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

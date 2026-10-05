import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { booksRouter } from './routes/books';
import { categoriesRouter } from './routes/categories';
import { brandsRouter } from './routes/brands';
import { cartRouter } from './routes/cart';
import { ordersRouter } from './routes/orders';
import { addressesRouter } from './routes/addresses';
import { paymentsRouter } from './routes/payments';
import { giftPointsRouter } from './routes/giftPoints';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/gift-points', giftPointsRouter);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => {
  console.log(`🚀 BookStore API running on http://localhost:${PORT}`);
});

export default app;

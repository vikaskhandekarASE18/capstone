import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';

export const ordersRouter = Router();
ordersRouter.use(authenticate);

const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(['card', 'upi', 'net_banking', 'cod']),
  giftPointsToRedeem: z.number().int().min(0).default(0),
});

// GET /api/orders
ordersRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const orders = await pool.query(
      `SELECT o.*, json_agg(
        json_build_object(
          'id', oi.id,
          'bookId', oi.book_id,
          'quantity', oi.quantity,
          'unitPrice', oi.unit_price,
          'totalPrice', oi.total_price,
          'bookTitle', b.title,
          'bookImageUrl', b.image_url
        )
      ) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN books b ON oi.book_id = b.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user!.id]
    );
    res.json({ success: true, data: orders.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
ordersRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const order = await pool.query(
      `SELECT o.*, json_agg(
        json_build_object(
          'id', oi.id,
          'bookId', oi.book_id,
          'quantity', oi.quantity,
          'unitPrice', oi.unit_price,
          'totalPrice', oi.total_price,
          'bookTitle', b.title,
          'bookImageUrl', b.image_url,
          'bookAuthor', b.author
        )
      ) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN books b ON oi.book_id = b.id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [req.params.id, req.user!.id]
    );
    if (order.rows.length === 0) return next(createError('Order not found', 404));
    res.json({ success: true, data: order.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders
ordersRouter.post('/', validate(createOrderSchema), async (req: AuthRequest, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userId = req.user!.id;
    const { addressId, paymentMethod, giftPointsToRedeem } = req.body;

    // Get cart items
    const cartItems = await client.query(
      `SELECT ci.book_id, ci.quantity, b.price, b.stock, b.title
       FROM carts c
       JOIN cart_items ci ON ci.cart_id = c.id
       JOIN books b ON ci.book_id = b.id
       WHERE c.user_id = $1`,
      [userId]
    );

    if (cartItems.rows.length === 0) return next(createError('Cart is empty', 400));

    // Check stock
    for (const item of cartItems.rows) {
      if (item.stock < item.quantity) {
        return next(createError(`Insufficient stock for "${item.title}"`, 400));
      }
    }

    // Calculate totals
    const subtotal = cartItems.rows.reduce((sum: number, i: { price: string; quantity: number }) => sum + parseFloat(i.price) * i.quantity, 0);
    const user = await client.query('SELECT gift_points FROM users WHERE id = $1', [userId]);
    const availablePoints = user.rows[0].gift_points;
    const pointsToUse = Math.min(giftPointsToRedeem, availablePoints, subtotal);
    const totalAmount = Math.max(0, subtotal - pointsToUse);

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, shipping_address_id, status, total_amount, gift_points_used, gift_points_earned)
       VALUES ($1, $2, 'confirmed', $3, $4, $5)
       RETURNING id`,
      [userId, addressId, totalAmount, pointsToUse, Math.floor(totalAmount / 10)]
    );
    const orderId = orderResult.rows[0].id;

    // Insert order items & update stock
    for (const item of cartItems.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, book_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.book_id, item.quantity, parseFloat(item.price), parseFloat(item.price) * item.quantity]
      );
      await client.query('UPDATE books SET stock = stock - $1 WHERE id = $2', [item.quantity, item.book_id]);
    }

    // Update user gift points
    await client.query(
      'UPDATE users SET gift_points = gift_points - $1 + $2 WHERE id = $3',
      [pointsToUse, Math.floor(totalAmount / 10), userId]
    );

    // Clear cart
    await client.query(
      `DELETE FROM cart_items ci USING carts c WHERE ci.cart_id = c.id AND c.user_id = $1`,
      [userId]
    );

    // Record gift point transactions
    if (pointsToUse > 0) {
      await client.query(
        `INSERT INTO gift_points (user_id, points, reason) VALUES ($1, $2, $3)`,
        [userId, -pointsToUse, `Redeemed on order ${orderId}`]
      );
    }
    await client.query(
      `INSERT INTO gift_points (user_id, points, reason) VALUES ($1, $2, $3)`,
      [userId, Math.floor(totalAmount / 10), `Earned from order ${orderId}`]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: { orderId, totalAmount } });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// POST /api/orders/:id/cancel
ordersRouter.post('/:id/cancel', async (req: AuthRequest, res, next) => {
  try {
    const order = await pool.query(
      'SELECT id, status, created_at FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.id]
    );
    if (order.rows.length === 0) return next(createError('Order not found', 404));

    const { status, created_at } = order.rows[0];
    if (['delivered', 'cancelled', 'shipped'].includes(status)) {
      return next(createError('This order cannot be cancelled', 400));
    }

    const hoursDiff = (Date.now() - new Date(created_at).getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 48) {
      return next(createError('Cancellation window (48 hours) has passed', 400));
    }

    await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
      ['cancelled', req.params.id]
    );

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) {
    next(err);
  }
});

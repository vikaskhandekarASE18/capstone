import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';

export const cartRouter = Router();
cartRouter.use(authenticate);

// GET /api/cart
cartRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      `SELECT ci.id, ci.quantity, ci.book_id,
              b.title, b.author, b.price, b.image_url, b.stock
       FROM carts c
       JOIN cart_items ci ON ci.cart_id = c.id
       JOIN books b ON ci.book_id = b.id
       WHERE c.user_id = $1`,
      [req.user!.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

const addItemSchema = z.object({
  bookId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});

// POST /api/cart/items
cartRouter.post('/items', validate(addItemSchema), async (req: AuthRequest, res, next) => {
  try {
    const { bookId, quantity } = req.body;
    const userId = req.user!.id;

    // Ensure cart exists
    let cartResult = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartResult.rows.length === 0) {
      cartResult = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
    }
    const cartId = cartResult.rows[0].id;

    // Check stock
    const book = await pool.query('SELECT stock FROM books WHERE id = $1', [bookId]);
    if (book.rows.length === 0) return next(createError('Book not found', 404));
    if (book.rows[0].stock < quantity) return next(createError('Insufficient stock', 400));

    // Upsert cart item
    await pool.query(
      `INSERT INTO cart_items (cart_id, book_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, book_id)
       DO UPDATE SET quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, $4)`,
      [cartId, bookId, quantity, book.rows[0].stock]
    );

    res.status(201).json({ success: true, message: 'Added to cart' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart/items/:bookId
cartRouter.put('/items/:bookId', async (req: AuthRequest, res, next) => {
  try {
    const { quantity } = req.body;
    const userId = req.user!.id;

    if (quantity <= 0) {
      await pool.query(
        `DELETE FROM cart_items ci USING carts c
         WHERE ci.cart_id = c.id AND c.user_id = $1 AND ci.book_id = $2`,
        [userId, req.params.bookId]
      );
    } else {
      await pool.query(
        `UPDATE cart_items ci SET quantity = $1
         FROM carts c WHERE ci.cart_id = c.id AND c.user_id = $2 AND ci.book_id = $3`,
        [quantity, userId, req.params.bookId]
      );
    }

    res.json({ success: true, message: 'Cart updated' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/items/:bookId
cartRouter.delete('/items/:bookId', async (req: AuthRequest, res, next) => {
  try {
    await pool.query(
      `DELETE FROM cart_items ci USING carts c
       WHERE ci.cart_id = c.id AND c.user_id = $1 AND ci.book_id = $2`,
      [req.user!.id, req.params.bookId]
    );
    res.json({ success: true, message: 'Item removed' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart (clear cart)
cartRouter.delete('/', async (req: AuthRequest, res, next) => {
  try {
    await pool.query(
      `DELETE FROM cart_items ci USING carts c WHERE ci.cart_id = c.id AND c.user_id = $1`,
      [req.user!.id]
    );
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
});

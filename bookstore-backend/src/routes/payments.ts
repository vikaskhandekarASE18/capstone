import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

export const paymentsRouter = Router();
paymentsRouter.use(authenticate);

const processSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['card', 'upi', 'net_banking', 'cod']),
  amount: z.number().positive(),
  details: z.record(z.string()).optional(),
});

// POST /api/payments/process
paymentsRouter.post('/process', validate(processSchema), async (req: AuthRequest, res, next) => {
  try {
    const { orderId, method, amount } = req.body;

    // Simulate payment processing (15% failure rate)
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500));
    const failed = Math.random() < 0.15;

    const transactionId = failed ? null : 'TXN' + Date.now() + Math.random().toString(36).slice(2, 7).toUpperCase();
    const status = failed ? 'failed' : 'success';

    await pool.query(
      `INSERT INTO payments (order_id, method, status, amount, transaction_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, method, status, amount, transactionId]
    );

    if (!failed) {
      await pool.query("UPDATE orders SET status = 'confirmed' WHERE id = $1", [orderId]);
    }

    res.json({
      success: !failed,
      data: { transactionId, status, method, amount },
      message: failed ? 'Payment declined. Please try again.' : 'Payment successful!',
    });
  } catch (err) {
    next(err);
  }
});

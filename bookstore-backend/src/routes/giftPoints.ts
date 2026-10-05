import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/authenticate';

export const giftPointsRouter = Router();
giftPointsRouter.use(authenticate);

// GET /api/gift-points
giftPointsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const [balanceResult, historyResult] = await Promise.all([
      pool.query('SELECT gift_points FROM users WHERE id = $1', [req.user!.id]),
      pool.query(
        'SELECT * FROM gift_points WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
        [req.user!.id]
      ),
    ]);

    res.json({
      success: true,
      data: {
        balance: balanceResult.rows[0]?.gift_points ?? 0,
        history: historyResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

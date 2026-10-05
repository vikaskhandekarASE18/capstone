import { Router } from 'express';
import { pool } from '../config/database';

export const brandsRouter = Router();

// GET /api/brands
brandsRouter.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM brands ORDER BY name');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

import { Router } from 'express';
import { pool } from '../config/database';

export const categoriesRouter = Router();

// GET /api/categories
categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:slug
categoriesRouter.get('/:slug', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE slug = $1', [req.params.slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

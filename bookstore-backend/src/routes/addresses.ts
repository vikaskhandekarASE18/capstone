import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';

export const addressesRouter = Router();
addressesRouter.use(authenticate);

const addressSchema = z.object({
  label: z.string().min(1),
  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().regex(/^\d{6}$/),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
});

// GET /api/addresses
addressesRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC', [req.user!.id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/addresses
addressesRouter.post('/', validate(addressSchema), async (req: AuthRequest, res, next) => {
  try {
    const { label, street, city, state, postalCode, country, isDefault } = req.body;
    const userId = req.user!.id;

    if (isDefault) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    }

    const result = await pool.query(
      `INSERT INTO addresses (user_id, label, street, city, state, postal_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, label, street, city, state, postalCode, country, isDefault]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/addresses/:id
addressesRouter.put('/:id', validate(addressSchema), async (req: AuthRequest, res, next) => {
  try {
    const { label, street, city, state, postalCode, country, isDefault } = req.body;
    const userId = req.user!.id;

    if (isDefault) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    }

    const result = await pool.query(
      `UPDATE addresses SET label=$1, street=$2, city=$3, state=$4, postal_code=$5, country=$6, is_default=$7
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [label, street, city, state, postalCode, country, isDefault, req.params.id, userId]
    );
    if (result.rows.length === 0) return next(createError('Address not found', 404));
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/addresses/:id
addressesRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
});

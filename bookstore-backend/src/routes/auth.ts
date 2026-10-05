import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../config/database';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/authenticate';

export const authRouter = Router();

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
authRouter.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return next(createError('Email already registered', 409));
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS ?? '10');
    const hashedPassword = await bcrypt.hash(password, rounds);

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone, gift_points)
       VALUES ($1, $2, $3, $4, $5, 50)
       RETURNING id, first_name, last_name, email, phone, gift_points, created_at`,
      [firstName, lastName, email, hashedPassword, phone ?? null]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET ?? 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          giftPoints: user.gift_points,
          createdAt: user.created_at,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return next(createError('Invalid credentials', 401));
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return next(createError('Invalid credentials', 401));
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET ?? 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          giftPoints: user.gift_points,
          createdAt: user.created_at,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, phone, gift_points, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );
    if (result.rows.length === 0) return next(createError('User not found', 404));
    const user = result.rows[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        giftPoints: user.gift_points,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

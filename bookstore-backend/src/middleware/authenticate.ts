import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(createError('Authentication required', 401));
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'secret') as { id: string; email: string };
    req.user = decoded;
    next();
  } catch {
    next(createError('Invalid or expired token', 401));
  }
}

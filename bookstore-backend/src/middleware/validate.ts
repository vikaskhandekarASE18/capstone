import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { createError } from './errorHandler';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return next(createError(messages, 400));
    }
    req.body = result.data;
    next();
  };
}

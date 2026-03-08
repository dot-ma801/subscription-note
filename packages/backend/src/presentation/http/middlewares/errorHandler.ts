import type { ErrorHandler } from 'hono';
import { ZodError } from 'zod';
import { EntityNotFoundError, DomainError } from '../../../domain/errors/DomainError.js';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(err);

  if (err instanceof ZodError) {
    return c.json(
      {
        errors: err.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      400,
    );
  }

  if (err instanceof EntityNotFoundError) {
    return c.json({ message: err.message }, 404);
  }

  if (err instanceof DomainError) {
    return c.json({ message: err.message }, 400);
  }

  return c.json({ message: 'Internal server error' }, 500);
};

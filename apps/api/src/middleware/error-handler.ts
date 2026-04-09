import type { ErrorHandler, NotFoundHandler } from 'hono';
import { ApiError } from '../lib/errors';

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof ApiError) {
    return c.json({ error: { code: err.code, message: err.message } }, err.status as any);
  }

  console.error('Unhandled error:', err);

  return c.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    500,
  );
};

export const notFoundHandler: NotFoundHandler = (c) => {
  return c.json(
    { error: { code: 'NOT_FOUND', message: `Route ${c.req.method} ${c.req.path} not found` } },
    404,
  );
};

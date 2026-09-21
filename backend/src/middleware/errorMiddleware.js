import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  console.error('[API ERROR]', err);

  if (err instanceof ZodError) {
    const formatted = err.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatted,
    });
  }

  const statusCode =
    err.status ||
    err.statusCode ||
    500;

  const message =
    err.message ||
    'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
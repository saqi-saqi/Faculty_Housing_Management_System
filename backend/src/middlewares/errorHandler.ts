import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('[Error Handler]', err);

  const statusCode = err.status || err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected server error occurred.';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(err.fieldErrors ? { fieldErrors: err.fieldErrors } : {})
    }
  });
}

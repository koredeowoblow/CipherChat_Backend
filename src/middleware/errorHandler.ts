import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ResponseHandler } from '../utils/responseHandler';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return ResponseHandler.error(res, err.statusCode, err.message);
  }

  // Fallback for unhandled errors
  console.error('Unhandled Error:', err);
  return ResponseHandler.error(res, 500, 'Internal Server Error');
};

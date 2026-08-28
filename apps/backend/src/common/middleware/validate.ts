import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidationConfig {
  params?: ZodSchema;
  body?: ZodSchema;
  query?: ZodSchema;
}

export const validateRequest = (config: ValidationConfig) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (config.params) {
        req.params = config.params.parse(req.params);
      }

      if (config.body) {
        req.body = config.body.parse(req.body);
      }

      if (config.query) {
        req.query = config.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };
};

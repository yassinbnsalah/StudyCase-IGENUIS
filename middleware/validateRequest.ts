import { Request, Response, NextFunction } from "express";
import Joi from "joi";

/**
 * Middleware to validate incoming request data using Joi schema.
 * @param schema - Joi schema for validation
 * @param property - Property to validate: 'body', 'params', 'query'
 */
export const validateRequest = (schema: Joi.ObjectSchema, property: keyof Request) => {
  return (req: Request, res: Response, next: NextFunction): void | Promise<void> => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      res.status(400).json({
        message: "Title is required.",
        details: error.details.map((detail) => detail.message),
      });
    } else {
      next();
    }
  };        
};

import { Request, Response, NextFunction, RequestHandler } from "express";
import Joi from "joi";

interface ValidationSchemas {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}

export const validate = (schemas: ValidationSchemas): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const locations: Array<keyof ValidationSchemas> = ["body", "params", "query"];

    for (const key of locations) {
      if (schemas[key]) {
        const { error } = schemas[key]!.validate(req[key], { abortEarly: false });
        if (error) {
          res.status(400).json({
            data: {},
            message: `Validation error in ${key}`,
            details: error.details.map((d) => d.message),
          });
          return; 
        }
      }
    }

    next(); 
  };
};


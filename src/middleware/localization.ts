import { Request, Response, NextFunction } from "express";
import { MessageKey } from "../locales/types";
declare global {
  namespace Express {
    interface Request {
      lang?: string;
      t: (key: MessageKey) => string;
    }
  }
}
export function localizationMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const lang = req.headers["language"] as string | undefined;
  req.lang = lang && ["en", "sk"].includes(lang) ? lang : "en";
  next();
}

import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { UserModel } from "../db/user";

export const authMiddleware = passport.authenticate("jwt", { session: false });

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserModel;
    if (!user) {
      return res.status(401).json({ data: {}, message: req.t("UNAUTHORIZED") });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ data: {}, message: req.t("FORBIDDEN") });
    }
    next();
  };
};

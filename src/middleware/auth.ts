import { Request, Response, NextFunction } from "express";
import passport from "passport";

export const authMiddleware = passport.authenticate("jwt", { session: false });

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: any = req.user;
    if (!user) {
      return res.status(401).json({ data: {}, message: "Unauthorized" });
    }
    if (!roles.includes(user.role)) {
      return res
        .status(403)
        .json({ data: {}, message: "Forbidden: insufficient role" });
    }
    next();
  };
};

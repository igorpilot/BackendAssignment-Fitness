import { NextFunction, Request, Response, Router } from "express";
import { models } from "../db";
import { authMiddleware, roleMiddleware } from "../middleware/auth";
import { validate } from "../validation/validate";
import { USER_ROLE } from "../utils/enums";
import { UserModel } from "../db/user";
import {
  idUserParamSchema,
  updateUserSchema,
} from "../validation/schemas/userSchema";

const router = Router();

const { User } = models;

export default () => {
  router.get(
    "/",
    [authMiddleware, roleMiddleware([USER_ROLE.ADMIN, USER_ROLE.USER])],
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const user = req.user as UserModel;
        const users = await User.findAll({
          attributes:
            user.role === USER_ROLE.ADMIN
              ? { exclude: ["password"] }
              : ["id", "nickName"],
        });
        if (!users) {
          return res
            .status(404)
            .json({ data: {}, message: req.t("USER_NOT_FOUND") });
        }
        return res.json({ data: users, message: req.t("LIST_OF_USERS") });
      } catch (err) {
        err.contextMessage = "Error fetching all users";
        next(err);
      }
    }
  );
  router.get(
    "/me",
    [authMiddleware, roleMiddleware([USER_ROLE.USER])],
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const user = req.user as UserModel;
        const profile = await User.findByPk(user.id, {
          attributes: ["name", "surname", "age", "nickName"],
        });

        if (!profile) {
          return res
            .status(404)
            .json({ data: {}, message: req.t("USER_NOT_FOUND") });
        }

        return res.json({ data: profile, message: req.t("USER_DETAIL") });
      } catch (err) {
        err.contextMessage = "Error fetching user detail";
        next(err);
      }
    }
  );
  router.get(
    "/:id",
    [
      authMiddleware,
      roleMiddleware([USER_ROLE.ADMIN]),
      validate({ params: idUserParamSchema }),
    ],
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
          attributes: { exclude: ["password"] },
        });

        if (!user) {
          return res
            .status(404)
            .json({ data: {}, message: req.t("USER_NOT_FOUND") });
        }

        return res.json({ data: user, message: "User detail" });
      } catch (err) {
        err.contextMessage = "Error fetching user detail";
        next(err);
      }
    }
  );

  router.put(
    "/:id",
    [
      authMiddleware,
      roleMiddleware([USER_ROLE.ADMIN]),
      validate({ params: idUserParamSchema, body: updateUserSchema }),
    ],
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
          return res.status(404).json({ data: {}, message: "User not found" });
        }
        const ALLOWED_FIELDS = ["name", "surname", "nickName", "age", "role"];
        Object.keys(req.body).forEach((field) => {
          if (ALLOWED_FIELDS.includes(field)) {
            (user as any)[field] = req.body[field];
          }
        });

        await user.save();
        return res.json({
          data: { id: user.id },
          message: req.t("USER_UPDATED"),
        });
      } catch (err) {
        err.contextMessage = "Error updating user";
        next(err);
      }
    }
  );
  return router;
};

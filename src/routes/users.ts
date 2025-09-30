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
import { createCompletedExerciseSchema } from "../validation/schemas/completedExerciseSchema";

const router = Router();

const { User, CompletedExercise, Exercise } = models;

export default () => {
  router.get(
    "/",
    [authMiddleware, roleMiddleware([USER_ROLE.ADMIN, USER_ROLE.USER])],
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.user as UserModel;

        const users = await User.findAll({
          attributes:
            user.role === USER_ROLE.ADMIN
              ? { exclude: ["password"] }
              : ["id", "nickName"],
        });

        if (!users) {
          res.status(404).json({ data: {}, message: req.t("USER_NOT_FOUND") });
          return;
        }

        res.json({ data: users, message: req.t("LIST_OF_USERS") });
      } catch (err) {
        err.contextMessage = "Error fetching all users";
        next(err);
      }
    }
  );
  router.get(
    "/me",
    [authMiddleware, roleMiddleware([USER_ROLE.USER])],
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = req.user as UserModel;

        const profile = await User.findByPk(user.id, {
          attributes: ["name", "surname", "age", "nickName"],
        });

        if (!profile) {
          res.status(404).json({ data: {}, message: req.t("USER_NOT_FOUND") });
          return;
        }

        res.json({ data: profile, message: req.t("USER_DETAIL") });
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
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
          attributes: { exclude: ["password"] },
        });

        if (!user) {
          res.status(404).json({ data: {}, message: req.t("USER_NOT_FOUND") });
          return;
        }

        res.json({ data: user, message: "User detail" });
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
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
          res.status(404).json({ data: {}, message: "User not found" });
          return;
        }

        const ALLOWED_FIELDS = ["name", "surname", "nickName", "age", "role"];

        Object.keys(req.body).forEach((field) => {
          if (ALLOWED_FIELDS.includes(field)) {
            (user as any)[field] = req.body[field];
          }
        });

        await user.save();

        res.json({
          data: { id: user.id },
          message: req.t("USER_UPDATED"),
        });
      } catch (err) {
        err.contextMessage = "Error updating user";
        next(err);
      }
    }
  );
  //ROUTES FOR TRACKING EXERCISES
  router.post(
    "/me/completed-exercises",
    [
      authMiddleware,
      roleMiddleware([USER_ROLE.USER]),
      validate({
        body: createCompletedExerciseSchema,
      }),
    ],
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const currentUser = req.user as UserModel;

        const { exerciseID, duration, completedAt } = req.body;

        const exercise = await Exercise.findByPk(exerciseID);

        if (!exercise) {
          res
            .status(404)
            .json({ data: {}, message: req.t("EXERCISE_NOT_FOUND") });
          return;
        }

        const completedExercise = await CompletedExercise.create({
          userID: currentUser.id,
          exerciseID: exerciseID,
          completedAt: completedAt ? new Date(completedAt) : new Date(),
          duration,
        });

        res.status(201).json({
          data: { id: completedExercise.id },
          message: req.t("EXERCISE_TRACKED"),
        });
      } catch (err) {
        err.contextMessage = "Error creating completed exercise";
        next(err);
      }
    }
  );

  router.get(
    "/me/completed-exercises",
    [authMiddleware, roleMiddleware([USER_ROLE.USER])],
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const currentUser = req.user as UserModel;

        const completedExercises = await CompletedExercise.findAll({
          where: { userID: currentUser.id },
          attributes: ["id", "exerciseID", "duration", "completedAt"],
          order: [["completedAt", "DESC"]],
        });

        res.json({
          data: completedExercises,
          message: req.t("COMPLETED_EXERCISES_LIST"),
        });
      } catch (err) {
        err.contextMessage = "Error fetching completed exercises";
        next(err);
      }
    }
  );

  router.delete(
    "/me/completed-exercises/:id",
    [
      authMiddleware,
      roleMiddleware([USER_ROLE.USER]),
      validate({ params: idUserParamSchema }),
    ],
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const currentUser = req.user as UserModel;

        const { id } = req.params;

        const item = await CompletedExercise.findOne({
          where: { id, userID: currentUser.id },
        });

        if (!item) {
          res
            .status(404)
            .json({ data: {}, message: req.t("TRACKED_ITEM_NOT_FOUND") });
          return;
        }

        await item.destroy();

        res.status(204).send();
      } catch (err) {
        err.contextMessage = "Error deleting tracked exercise";
        next(err);
      }
    }
  );

  return router;
};

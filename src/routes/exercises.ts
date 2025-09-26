import { Router, Request, Response, NextFunction } from "express";
import { models } from "../db";
import { authMiddleware, roleMiddleware } from "../middleware/auth";
import { USER_ROLE } from "../utils/enums";
import {
  createExerciseSchema,
  idParamSchema,
  updateExerciseSchema,
} from "../validation/schemas/exercisesSchema";
import { validate } from "../validation/validate";

const router = Router();

const { Exercise, Program } = models;

export default () => {
  router.get(
    "/",
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const exercises = await Exercise.findAll({
          include: [
            {
              model: Program,
            },
          ],
        });

        return res.json({
          data: exercises,
          message: req.t("LIST_OF_EXERCISE"),
        });
      } catch (err) {
        err.contextMessage = "Error during fetching exercises";
        next(err);
      }
    }
  );
  router.post(
    "/",
    [
      authMiddleware,
      roleMiddleware([USER_ROLE.ADMIN]),
      validate({ body: createExerciseSchema }),
    ],
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const { name, difficulty, programID } = req.body;
        const program = await Program.findByPk(programID);
        if (!program) {
          return res
            .status(404)
            .json({ data: {}, message: req.t("PROGRAM_NOT_FOUND") });
        }
        const exercise = await Exercise.create({ name, difficulty, programID });
        res.json({ data: { id: exercise.id }, message: req.t("EXERCISE CREATED") });
      } catch (err) {
        err.contextMessage = "Error during admin create exercise";
        next(err);
      }
    }
  );

  router.put(
    "/:id",
    [
      authMiddleware,
      roleMiddleware([USER_ROLE.ADMIN]),
      validate({ params: idParamSchema, body: updateExerciseSchema }),
    ],
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const { id } = req.params;
        const exercise = await Exercise.findOne({ where: { id } });

        if (!exercise) {
          return res
            .status(404)
            .json({ data: {}, message: req.t("EXERCISE_NOT_FOUND") });
        }
        const ALLOWED_FIELDS = ["name", "difficulty", "programID"];
        Object.keys(req.body).forEach((field) => {
          if (ALLOWED_FIELDS.includes(field)) {
            (exercise as any)[field] = req.body[field];
          }
        });

        await exercise.save();
        res.json({ data: { id: exercise.id }, message: req.t("EXERCISE_UPDATED") });
      } catch (err) {
        err.contextMessage = "Error during admin change exercise";
        next(err);
      }
    }
  );

  router.delete(
    "/:id",
    [
      authMiddleware,
      roleMiddleware([USER_ROLE.ADMIN]),
      validate({ params: idParamSchema }),
    ],
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const { id } = req.params;
        const exercise = await Exercise.findOne({ where: { id } });

        if (!exercise) {
          return res
            .status(404)
            .json({ data: {}, message: req.t("EXERCISE_NOT_FOUND") });
        }
        await Exercise.destroy({ where: { id } });
        res.status(204).json({ data: {}, message: req.t("EXERCISE_DELETED") });
      } catch (err) {
        err.contextMessage = "Error during admin delete exercise";
        next(err);
      }
    }
  );
  return router;
};

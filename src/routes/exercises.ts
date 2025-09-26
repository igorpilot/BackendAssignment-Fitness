import { Router, Request, Response, NextFunction } from "express";
import { models } from "../db";
import { authMiddleware, roleMiddleware } from "../middleware/auth";
import { USER_ROLE } from "../utils/enums";
import {
  createExerciseSchema,
  exerciseQuerySchema,
  idParamSchema,
  updateExerciseSchema,
} from "../validation/schemas/exercisesSchema";
import { validate } from "../validation/validate";
import { parseQuery } from "../utils/queryHelpers";

const router = Router();

const { Exercise, Program } = models;

export default () => {
  router.get(
    "/",
    [authMiddleware, validate({ query: exerciseQuerySchema })],
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { where, pagination } = parseQuery(req.query);
        const { rows, count } = await Exercise.findAndCountAll({
          where,
          include: [
            {
              model: Program,
            },
          ],
          ...pagination,
          order: [["createdAt", "DESC"]],
        });

        res.json({
          data: rows,
          meta: {
            total: count,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(count / pagination.limit),
          },
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
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { name, difficulty, programID } = req.body;
        const program = await Program.findByPk(programID);
        if (!program) {
          res
            .status(404)
            .json({ data: {}, message: req.t("PROGRAM_NOT_FOUND") });
          return;
        }
        const exercise = await Exercise.create({ name, difficulty, programID });
        res.json({
          data: { id: exercise.id },
          message: req.t("EXERCISE_CREATED"),
        });
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
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = req.params;
        const exercise = await Exercise.findByPk(id);

        if (!exercise) {
          res
            .status(404)
            .json({ data: {}, message: req.t("EXERCISE_NOT_FOUND") });
          return;
        }
        const ALLOWED_FIELDS = ["name", "difficulty", "programID"];
        Object.keys(req.body).forEach((field) => {
          if (ALLOWED_FIELDS.includes(field)) {
            (exercise as any)[field] = req.body[field];
          }
        });

        await exercise.save();
        res.json({
          data: { id: exercise.id },
          message: req.t("EXERCISE_UPDATED"),
        });
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
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = req.params;
        const exercise = await Exercise.findOne({ where: { id } });

        if (!exercise) {
          res
            .status(404)
            .json({ data: {}, message: req.t("EXERCISE_NOT_FOUND") });
          return;
        }
        await Exercise.destroy({ where: { id } });
        res.status(200).json({ data: {}, message: req.t("EXERCISE_DELETED") });
      } catch (err) {
        err.contextMessage = "Error during admin delete exercise";
        next(err);
      }
    }
  );
  return router;
};

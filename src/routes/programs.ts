import { Router, Request, Response, NextFunction } from "express";
import { models } from "../db";
import { validate } from "../validation/validate";
import { authMiddleware, roleMiddleware } from "../middleware/auth";
import { USER_ROLE } from "../utils/enums";
import { idProgramParamSchema } from "../validation/schemas/programsSchema";

const router = Router();

const { Program, Exercise } = models;

export default () => {
  router.get(
    "/",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const programs = await Program.findAll();

        res.json({
          data: programs,
          message: req.t("LIST_OF_PROGRAMS"),
        });
      } catch (err: any) {
        err.contextMessage = "Error fetching all programs";
        next(err);
      }
    }
  );

  router.put(
    "/:programID/exercise/:exerciseID",
    [
      authMiddleware,
      roleMiddleware([USER_ROLE.ADMIN]),
      validate({
        params: idProgramParamSchema,
      }),
    ],
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { programID, exerciseID } = req.params;

        const program = await Program.findByPk(programID);

        if (!program) {
          res
            .status(404)
            .json({ data: {}, message: req.t("PROGRAM_NOT_FOUND") });
          return;
        }

        const exercise = await Exercise.findByPk(exerciseID);

        if (!exercise) {
          res
            .status(404)
            .json({ data: {}, message: req.t("EXERCISE_NOT_FOUND") });
          return;
        }

        if (exercise.programID === Number(programID)) {
          res.status(409).json({
            data: {},
            message: req.t("EXERCISE_ALREADY_IN_PROGRAM"),
          });
          return;
        }

        exercise.programID = Number(programID); // exercise removed from previous program because can be only in one program

        await exercise.save();

        res.json({
          data: { id: exercise.id },
          message: req.t("EXERCISE_ADDED_TO_PROGRAM"),
        });
      } catch (err: any) {
        err.contextMessage = "Error during adding exercise in program";
        next(err);
      }
    }
  );

  router.delete(
    "/:programID/exercise/:exerciseID",
    [
      authMiddleware,
      roleMiddleware([USER_ROLE.ADMIN]),
      validate({
        params: idProgramParamSchema,
      }),
    ],
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { programID, exerciseID } = req.params;

        const program = await Program.findByPk(programID);

        if (!program) {
          res
            .status(404)
            .json({ data: {}, message: req.t("PROGRAM_NOT_FOUND") });
          return;
        }

        const exercise = await Exercise.findOne({
          where: { id: exerciseID, programID },
        });

        if (!exercise) {
          res
            .status(404)
            .json({ data: {}, message: req.t("EXERCISE_NOT_FOUND") });
          return;
        }

        exercise.programID = null;

        await exercise.save();

        res
          .status(200)
          .json({ data: {}, message: req.t("EXERCISE_REMOVED_FROM_PROGRAM") });
      } catch (err: any) {
        err.contextMessage = "Error during remove exercise from program";
        next(err);
      }
    }
  );
  
  return router;
};

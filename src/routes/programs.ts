import { Router, Request, Response, NextFunction } from "express";
import { models } from "../db";

const router = Router();

const { Program } = models;

export default () => {
  router.get(
    "/",
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const programs = await Program.findAll();
        return res.json({
          data: programs,
          message: req.t("LIST_OF_PROGRAMS"),
        });
      } catch (err: any) {
        err.contextMessage = "Error fetching all programs";
        next(err);
      }
    }
  );
  return router;
};

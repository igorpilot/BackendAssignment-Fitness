import Joi from "joi";
import { EXERCISE_DIFFICULTY } from "../../utils/enums";

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const createExerciseSchema = Joi.object({
  difficulty: Joi.string()
    .valid(...Object.values(EXERCISE_DIFFICULTY))
    .required(),
  name: Joi.string().min(2).max(200).required(),
  programID: Joi.number().integer().positive().required(),
});

export const updateExerciseSchema = Joi.object({
  difficulty: Joi.string()
    .valid(...Object.values(EXERCISE_DIFFICULTY))
    .optional(),
  name: Joi.string().min(2).max(200).optional(),
  programID: Joi.number().integer().positive().optional(),
}).min(1);

export const exerciseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  programID: Joi.number().integer().optional(),
  search: Joi.string().max(100).optional(),
});

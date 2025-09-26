import Joi from "joi";
import { USER_ROLE } from "../../utils/enums";

export const idUserParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  surname: Joi.string().min(2).max(100).optional(),
  nickName: Joi.string().min(2).max(100).optional(),
  age: Joi.number().integer().positive().optional(),
  role: Joi.string().valid(...Object.values(USER_ROLE)).optional(),
});

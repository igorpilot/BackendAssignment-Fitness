import Joi from "joi";
import { USER_ROLE } from "../../utils/enums";

export const registerAuthSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  surname: Joi.string().min(2).max(50).optional(),
  nickName: Joi.string().min(2).max(30).optional(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(1).optional(),
  role: Joi.string().valid(...Object.values(USER_ROLE)).required(),
  password: Joi.string().min(8).required(),
});

export const loginAuthSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

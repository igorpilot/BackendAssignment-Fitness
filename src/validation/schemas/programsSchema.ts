import Joi from "joi";

export const idProgramParamSchema = Joi.object({
  programID: Joi.number().integer().positive().required(),
  exerciseID: Joi.number().integer().positive().required(),
});
  
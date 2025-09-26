import Joi from 'joi';

export const createCompletedExerciseSchema = Joi.object({
  exerciseId: Joi.number().integer().positive().required(),
  duration: Joi.number().integer().min(1).required(), 
  completedAt: Joi.date().iso().optional(), 
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(), 
});

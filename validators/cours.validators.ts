import Joi from "joi";
import { Course } from "../models/course.interface";

export const courseSchema = Joi.object<Course>({
  id: Joi.number().integer().positive().optional(),
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).max(500).optional(),
  modules: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().positive().required(),
    })
  ).optional(),
});

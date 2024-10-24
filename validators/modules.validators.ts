import Joi from "joi";
import { Modules } from "../models/modules.interface";

export const moduleSchema = Joi.object<Modules>({
  id: Joi.number().integer().positive().optional(),
  title: Joi.string().min(3).max(100).required(),
});

export const updateModuleSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
});

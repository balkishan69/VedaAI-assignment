import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { fail } from "../utils/http.js";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return fail(res, "Validation failed", 422, parsed.error.flatten());
    }
    req.body = parsed.data;
    next();
  };
}

import type { ErrorRequestHandler } from "express";
import { logger } from "../config/logger.js";
import { fail } from "../utils/http.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  logger.error(error);
  if (res.headersSent) return;
  const status = typeof error.status === "number" ? error.status : 500;
  fail(res, status >= 500 ? "Something went wrong" : error.message, status);
};

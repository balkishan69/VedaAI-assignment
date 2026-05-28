import compression from "compression";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { assignmentRouter } from "./routes/assignmentRoutes.js";
import { jobRouter } from "./routes/jobRoutes.js";
import { ok } from "./utils/http.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(mongoSanitize());
  app.use((pinoHttp as unknown as (options: { logger: typeof logger }) => express.RequestHandler)({ logger }));
  app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));

  app.get("/api/health", (_req, res) => ok(res, { status: "healthy" }));
  app.use("/api/assignments", assignmentRouter);
  app.use("/api/jobs", jobRouter);
  app.use(errorHandler);

  return app;
}

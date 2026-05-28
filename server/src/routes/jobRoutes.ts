import { Router } from "express";
import { getJobHandler } from "../controllers/jobController.js";

export const jobRouter = Router();

jobRouter.get("/:jobId", getJobHandler);

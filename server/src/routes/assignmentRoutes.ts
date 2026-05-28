import { Router } from "express";
import {
  createAssignmentHandler,
  createPdfHandler,
  downloadPdfHandler,
  getAssignmentHandler,
  listAssignmentsHandler,
  regenerateAssignmentHandler
} from "../controllers/assignmentController.js";
import { upload } from "../middleware/upload.js";
import { validateBody } from "../middleware/validate.js";
import { createAssignmentSchema } from "../schemas/assignmentSchemas.js";

export const assignmentRouter = Router();

assignmentRouter.get("/", listAssignmentsHandler);
assignmentRouter.post("/", upload.single("file"), validateBody(createAssignmentSchema), createAssignmentHandler);
assignmentRouter.get("/:id", getAssignmentHandler);
assignmentRouter.post("/:id/regenerate", regenerateAssignmentHandler);
assignmentRouter.post("/:id/pdf", createPdfHandler);
assignmentRouter.get("/:id/pdf", downloadPdfHandler);

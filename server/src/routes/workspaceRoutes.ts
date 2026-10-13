import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getWorkspaceTasks,
  createWorkspaceTask,
  updateWorkspaceTask,
  deleteWorkspaceTask,
} from "../controllers/workspaceController";

const router = Router();

router.use(authenticate);

router.get("/tasks", getWorkspaceTasks);
router.post("/tasks", createWorkspaceTask);
router.patch("/tasks/:taskId", updateWorkspaceTask);
router.delete("/tasks/:taskId", deleteWorkspaceTask);

export default router;
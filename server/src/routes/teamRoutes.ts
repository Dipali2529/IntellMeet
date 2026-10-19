
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  addTeamMember,
  createTeam,
  getMyTeams,
} from "../controllers/teamController";

const router = Router();

router.use(authenticate);

router.post("/", createTeam);
router.get("/", getMyTeams);
router.post("/:teamId/members", addTeamMember);

export default router;

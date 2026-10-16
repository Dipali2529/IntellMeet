
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createTeam, getMyTeams } from "../controllers/teamController";

const router = Router();

router.use(authenticate);

router.post("/", createTeam);
router.get("/", getMyTeams);

export default router;

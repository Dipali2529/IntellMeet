
import { Router } from "express";
import { generateSummary } from "../controllers/meetingSummaryController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/summary", authenticate, generateSummary);

export default router;
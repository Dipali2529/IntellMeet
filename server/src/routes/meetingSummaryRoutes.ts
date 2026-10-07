import express from "express";
import { generateSummary } from "../controllers/meetingSummaryController";

const router = express.Router();

router.post("/summary", generateSummary);

export default router;
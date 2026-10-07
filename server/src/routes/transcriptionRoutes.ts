import express from "express";
import upload from "../middleware/uploadMiddleware";
import { transcribeMeetingAudio } from "../controllers/transcriptionController";

const router = express.Router();

router.post(
  "/transcribe",
  upload.single("audio"),
  transcribeMeetingAudio
);

export default router;
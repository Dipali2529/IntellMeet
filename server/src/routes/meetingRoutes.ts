import { Router } from "express";
import {
  createMeeting,
  getMeetingByCode,
} from "../controllers/meetingController";

import { authenticate } from "../middleware/auth";

const router = Router();

router.get(
  "/code/:meetingCode",
  authenticate,
  getMeetingByCode
);

router.post(
  "/",
  authenticate,
  createMeeting
);

export default router;
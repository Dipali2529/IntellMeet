
import { Router } from "express";

import {
  createMeeting,
  createPublicDemoMeeting,
  getMeetingByCode,
  getPublicDemoMeetingByCode,
  updateActionItemStatus,
  getMyMeetings,
  getPublicDemoMeetings,
} from "../controllers/meetingController";

import { authenticate } from "../middleware/auth";

const router = Router();

// Public demo routes — no login required
router.get("/public-demo", getPublicDemoMeetings);
router.post("/public-demo", createPublicDemoMeeting);
router.get(
  "/public-demo/code/:meetingCode",
  getPublicDemoMeetingByCode
);

// Authenticated routes — normal users
router.get("/code/:meetingCode", authenticate, getMeetingByCode);
router.get("/", authenticate, getMyMeetings);
router.post("/", authenticate, createMeeting);

router.patch(
  "/:meetingId/action-items/:actionItemId/status",
  authenticate,
  updateActionItemStatus
);

export default router;

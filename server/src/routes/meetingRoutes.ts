
import { Router } from "express";

import {
  createMeeting,
  getMeetingByCode,
  updateActionItemStatus,
  getMyMeetings,
} from "../controllers/meetingController";

import { authenticate } from "../middleware/auth";

const router = Router();

router.get(
  "/code/:meetingCode",
  authenticate,
  getMeetingByCode
);

router.get(
  "/",
  authenticate,
  getMyMeetings
);

router.post(
  "/",
  authenticate,
  createMeeting
);
router.get("/", authenticate, getMyMeetings);
router.post("/", authenticate, createMeeting);
router.patch(
  "/:meetingId/action-items/:actionItemId/status",
  authenticate,
  updateActionItemStatus
);

export default router;

import { Response } from "express";
import { Meeting } from "../models/Meeting";
import { AuthRequest } from "../middleware/auth";
import { generateMeetingSummary } from "../services/meetingSummaryService";

export async function generateSummary(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { transcript, meetingId } = req.body;

    if (
      typeof transcript !== "string" ||
      !transcript.trim()
    ) {
      res.status(400).json({
        message: "A valid transcript is required",
      });
      return;
    }

    if (
      typeof meetingId !== "string" ||
      !/^[a-f\d]{24}$/i.test(meetingId)
    ) {
      res.status(400).json({
        message: "A valid meetingId is required",
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      res.status(404).json({
        message: "Meeting not found",
      });
      return;
    }

    const isHost =
      meeting.host.toString() === req.user.userId;

    if (!isHost && req.user.role !== "Admin") {
      res.status(403).json({
        message: "You are not authorized to update this meeting",
      });
      return;
    }

    const result = await generateMeetingSummary(
      transcript.trim()
    );

    meeting.actionItems = result.actionItems;
    await meeting.save();

    res.status(200).json({
      message: "Meeting summary generated and action items saved successfully",
      data: {
        ...result,
        actionItems: meeting.actionItems,
      },
    });
  } catch (error) {
    console.error("Meeting summary controller error:", error);

    res.status(500).json({
      message: "Failed to generate meeting summary",
    });
  }
}
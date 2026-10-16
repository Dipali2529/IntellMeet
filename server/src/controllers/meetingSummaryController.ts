
import { Response } from "express";
import { User } from "../models/User";
import { Meeting } from "../models/Meeting";
import { AuthRequest } from "../middleware/auth";
import { notifyUser } from "../services/notificationService";
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
    // Save meeting summary and transcript for dashboard history
    meeting.summary = result.summary;
    meeting.transcript = transcript.trim();
    //meeting.keyPoints = result.keyPoints ?? [];

    meeting.actionItems = result.actionItems;
    await meeting.save();

    // Notify users assigned to meeting action items.
    for (const item of meeting.actionItems) {
      const assigneeName = item.assignee?.trim();

      if (
        !assigneeName ||
        assigneeName.toLowerCase() === "unassigned"
      ) {
        continue;
      }

      try {
        const assignedUser = await User.findOne({
          name: {
            $regex: `^${assigneeName}$`,
            $options: "i",
          },
        });

        if (!assignedUser) {
          continue;
        }

        notifyUser(assignedUser._id.toString(), {
          type: "action-item-assigned",
          title: "Meeting action item assigned",
          message: item.task,
          taskId: item._id?.toString() ?? "",
          createdAt: new Date().toISOString(),
          read: false,
        });
      } catch (notificationError) {
        console.error(
          "Failed to send action-item notification:",
          notificationError
        );
      }
    }

    res.status(200).json({
      message:
        "Meeting summary generated and action items saved successfully",
      data: {
        ...result,
        actionItems: meeting.actionItems,
      },
    });
  } catch (error) {
    console.error(
      "Meeting summary controller error:",
      error
    );

    res.status(500).json({
      message: "Failed to generate meeting summary",
    });
  }
}
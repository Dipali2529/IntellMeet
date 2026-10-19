  import { User } from "../models/User";
  import bcrypt from "bcryptjs";
  import { Response } from "express";
  import { Meeting } from "../models/Meeting";
  import { AuthRequest } from "../middleware/auth";

    const generateMeetingCode = (): string => {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

      let code = "INT-";

      for (let i = 0; i < 6; i++) {
        code += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }

      return code;
    };

    export const createMeeting = async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            message: "Unauthorized",
          });
          return;
        }

        const {
          title,
          description,
          scheduledDate,
          scheduledTime,
          duration,
          allowChat,
          allowScreenShare,
          allowRecording,
        } = req.body;

        if (!title || !title.trim()) {
          res.status(400).json({
            message: "Meeting title is required",
          });
          return;
        }

        let meetingCode = generateMeetingCode();

        let existingMeeting = await Meeting.findOne({
          meetingCode,
        });

        while (existingMeeting) {
          meetingCode = generateMeetingCode();

          existingMeeting = await Meeting.findOne({
            meetingCode,
          });
        }

        const meeting = await Meeting.create({
          title: title.trim(),
          description,
          host: req.user.userId,
          meetingCode,
          scheduledDate,
          scheduledTime,
          duration: duration || 60,
          allowChat: allowChat ?? true,
          allowScreenShare: allowScreenShare ?? true,
          allowRecording: allowRecording ?? false,
        });

        res.status(201).json({
          message: "Meeting created successfully",
          meeting,
        });
      } catch (error) {
        console.error("Create meeting error:", error);

        res.status(500).json({
          message: "Server error while creating meeting",
        });
      }
    };
    
export const createPublicDemoMeeting = async (
  req: import("express").Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      duration,
      allowChat,
      allowScreenShare,
    } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({ message: "Meeting title is required." });
      return;
    }

    if (title.trim().length > 150) {
      res.status(400).json({ message: "Meeting title must be 150 characters or fewer." });
      return;
    }

    // Find the dedicated demo account, or create it.
    const demoEmail = "demo@intellmeet.com";
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      const passwordHash = await bcrypt.hash(
        `${require("crypto").randomUUID()}-${Date.now()}`,
        12
      );

      demoUser = await User.create({
        name: "IntellMeet Demo",
        email: demoEmail,
        passwordHash,
        role: "Member",
      });
    }

    let meetingCode = generateMeetingCode();

    while (await Meeting.exists({ meetingCode })) {
      meetingCode = generateMeetingCode();
    }

    const meeting = await Meeting.create({
      title: title.trim(),
      description:
        typeof description === "string"
          ? description.trim().slice(0, 1000)
          : "",
      host: demoUser._id,
      meetingCode,
      duration:
        Number.isInteger(duration) && duration >= 5 && duration <= 180
          ? duration
          : 60,
      allowChat: allowChat !== false,
      allowScreenShare: allowScreenShare !== false,
      allowRecording: false,
      isPublicDemo: true,
    });

    res.status(201).json({
      message: "Public demo meeting created successfully.",
      meeting,
    });
  } catch (error) {
    console.error("Create public demo meeting error:", error);
    res.status(500).json({
      message: "Unable to create a public demo meeting.",
    });
  }
};


    export const getMeetingByCode = async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      try {
      const meetingCode = String(req.params.meetingCode).trim().toUpperCase();

        if (!meetingCode) {
          res.status(400).json({
            message: "Meeting code is required.",
          });
          return;
        }

        const meeting = await Meeting.findOne({
          meetingCode,
        });

        if (!meeting) {
          res.status(404).json({
            message: "Meeting not found. Please check the meeting code.",
          });
          return;
        }

        res.status(200).json({
          message: "Meeting found successfully",
          meeting,
        });
      } catch (error) {
        console.error("Get meeting by code error:", error);

        res.status(500).json({
          message: "Server error while finding meeting.",
        });
      }
    };


    export const updateActionItemStatus = async (
    req: AuthRequest,
    res: Response
    ): Promise<void> => {
    try {
    if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
    }


    const meetingId = String(req.params.meetingId ?? "");
    const actionItemId = String(req.params.actionItemId ?? "");
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Completed",
    ];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        message: "Invalid status. Use Pending, In Progress, or Completed.",
      });
      return;
    }

    if (!/^[a-f\d]{24}$/i.test(meetingId) ||
        !/^[a-f\d]{24}$/i.test(actionItemId)) {
      res.status(400).json({
        message: "Invalid meeting ID or action item ID.",
      });
      return;
    }

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      res.status(404).json({ message: "Meeting not found." });
      return;
    }

    const isHost = meeting.host.toString() === req.user.userId;

    if (!isHost && req.user.role !== "Admin") {
      res.status(403).json({
        message: "Only the meeting host or an admin can update action items.",
      });
      return;
    }

    const actionItem = meeting.actionItems.find(
      (item) => item._id?.toString() === actionItemId
    );

    if (!actionItem) {
      res.status(404).json({ message: "Action item not found." });
      return;
    }

    actionItem.status = status;
    await meeting.save();

    res.status(200).json({
      message: "Action item status updated successfully.",
      data: actionItem,
    });

    } catch (error) {
    console.error("Update action item status error:", error);
    res.status(500).json({
    message: "Failed to update action item status.",
    });
    }
    };

    export const getMyMeetings = async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            message: "Unauthorized",
          });
          return;
        }

        const meetings = await Meeting.find({
          host: req.user.userId,
        }).sort({ createdAt: -1 });

        res.status(200).json({
          message: "Previous meetings fetched successfully",
          count: meetings.length,
          meetings,
        });
      } catch (error) {
        console.error("Get previous meetings error:", error);

        res.status(500).json({
          message: "Server error while fetching previous meetings",
        });
      }
    };


    export const getPublicDemoMeetings = async (
      req: import("express").Request,
      res: Response
    ): Promise<void> => {
      try {
        const meetings = await Meeting.find({
          isPublicDemo: true,
        })
         .select("_id title description duration scheduledDate scheduledTime createdAt updatedAt meetingCode")
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();

        res.status(200).json({
          message: "Public demo meetings fetched successfully",
          count: meetings.length,
          meetings,
        });
      } catch (error) {
        console.error("Get public demo meetings error:", error);

        res.status(500).json({
          message: "Unable to fetch public demo meetings",
        });
      }
    };

export const getPublicDemoMeetingByCode = async (
  req: AuthRequest,
  res: Response
) => {
  try {
   const rawMeetingCode = req.params.meetingCode;

const meetingCode = (
  Array.isArray(rawMeetingCode)
    ? rawMeetingCode[0]
    : rawMeetingCode
)?.trim().toUpperCase();
    if (!meetingCode) {
      return res.status(400).json({
        message: "Meeting code is required.",
      });
    }

    const meeting = await Meeting.findOne({
      meetingCode,
      isPublicDemo: true,
    });

    if (!meeting) {
      return res.status(404).json({
        message: "Public demo meeting not found.",
      });
    }

    return res.status(200).json({
      message: "Public demo meeting found.",
      meeting,
    });
  } catch (error) {
    console.error("Get public demo meeting error:", error);

    return res.status(500).json({
      message: "Unable to find the public demo meeting.",
    });
  }
};


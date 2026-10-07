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
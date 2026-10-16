
import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";
import { Team } from "../models/Team";
import { User } from "../models/User";

export const createTeam = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const name =
      typeof req.body.name === "string" ? req.body.name.trim() : "";

    if (name.length < 2) {
      res.status(400).json({
        message: "Team name must be at least 2 characters.",
      });
      return;
    }

    if (name.length > 100) {
      res.status(400).json({
        message: "Team name cannot exceed 100 characters.",
      });
      return;
    }

    const userId = req.user?.userId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      res.status(401).json({ message: "Invalid authenticated user." });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(401).json({ message: "User not found." });
      return;
    }

    const team = await Team.create({
      name,
      admin: user._id,
      members: [user._id],
    });

    res.status(201).json({
      message: "Team created successfully.",
      team,
    });
  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({ message: "Failed to create team." });
  }
};

export const getMyTeams = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      res.status(401).json({ message: "Invalid authenticated user." });
      return;
    }

    const teams = await Team.find({
      members: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({ teams });
  } catch (error) {
    console.error("Get teams error:", error);
    res.status(500).json({ message: "Failed to retrieve teams." });
  }
};

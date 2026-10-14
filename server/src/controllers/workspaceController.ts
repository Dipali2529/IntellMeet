import { Request, Response } from "express";

import { User } from "../models/User";
//import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";
import { WorkspaceTask } from "../models/WorkspaceTask";
import { notifyUser } from "../services/notificationService";

const VALID_STATUSES = ["To Do", "In Progress", "Done"];
const VALID_PRIORITIES = ["Low", "Medium", "High"];

// GET /api/workspace/tasks
export const getWorkspaceTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    const tasks = await WorkspaceTask.find({
    createdBy: req.user.userId,
  })
    .populate("assignee", "name email role")
    .sort({ createdAt: -1 });


    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Get workspace tasks error:", error);
    res.status(500).json({ message: "Failed to fetch workspace tasks." });
  }
};

// POST /api/workspace/tasks
export const createWorkspaceTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

   const { title, description, priority, status, assignee } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({ message: "Task title is required." });
      return;
    }

    if (title.trim().length > 150) {
      res.status(400).json({ message: "Task title cannot exceed 150 characters." });
      return;
    }

    if (
      priority !== undefined &&
      !VALID_PRIORITIES.includes(priority)
    ) {
      res.status(400).json({ message: "Invalid task priority." });
      return;
    }

    if (
      status !== undefined &&
      !VALID_STATUSES.includes(status)
    ) {
      res.status(400).json({ message: "Invalid task status." });
      return;
    }

    
    let assigneeId: mongoose.Types.ObjectId | null = null;

    if (assignee) {
      if (
        typeof assignee !== "string" ||
        !mongoose.Types.ObjectId.isValid(assignee)
      ) {
        res.status(400).json({ message: "Invalid assignee ID." });
        return;
      }

      const userExists = await User.exists({ _id: assignee });

      if (!userExists) {
        res.status(400).json({ message: "Assignee not found." });
        return;
      }

      assigneeId = new mongoose.Types.ObjectId(assignee);
    }

    const task = await WorkspaceTask.create({
      title: title.trim(),
      description:
        typeof description === "string" ? description.trim() : "",
      priority: priority ?? "Medium",
      status: status ?? "To Do",
      createdBy: req.user.userId,
      assignee: assigneeId,
    });
    
    if (
      assigneeId &&
      assigneeId.toString() !== req.user.userId
    ) {
      notifyUser(assigneeId.toString(), {
        type: "task-assigned",
        title: "New task assigned",
        message: title.trim(),
        taskId: task._id.toString(),
        createdAt: new Date().toISOString(),
        read: false,
      });
    }
    res.status(201).json({
      message: "Workspace task created successfully.",
      task,
    });
  } catch (error) {
    console.error("Create workspace task error:", error);
    res.status(500).json({ message: "Failed to create workspace task." });
  }
};

// PATCH /api/workspace/tasks/:taskId
export const updateWorkspaceTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

   const taskId = req.params.taskId;

    if (
    typeof taskId !== "string" ||
    !mongoose.Types.ObjectId.isValid(taskId)
    ) {
    res.status(400).json({ message: "Invalid task ID." });
    return;
    }

    const existingTask = await WorkspaceTask.findOne({
      _id: taskId,
      createdBy: req.user.userId,
    }).select("assignee title");

    if (!existingTask) {
      res.status(404).json({ message: "Workspace task not found." });
      return;
    }

    const previousAssigneeId =
      existingTask.assignee?.toString() ?? null;

    const updates: Record<string, unknown> = {};
    const { title, description, status, priority, assignee } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({ message: "Task title cannot be empty." });
        return;
      }

      if (title.trim().length > 150) {
        res.status(400).json({ message: "Task title cannot exceed 150 characters." });
        return;
      }

      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || description.length > 1000) {
        res.status(400).json({ message: "Invalid task description." });
        return;
      }

      updates.description = description.trim();
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        res.status(400).json({ message: "Invalid task status." });
        return;
      }

      updates.status = status;
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        res.status(400).json({ message: "Invalid task priority." });
        return;
      }

      updates.priority = priority;
    }

    if (assignee !== undefined) {
      if (assignee === null || assignee === "") {
        updates.assignee = null;
      } else {
        if (
          typeof assignee !== "string" ||
          !mongoose.Types.ObjectId.isValid(assignee)
        ) {
          res.status(400).json({ message: "Invalid assignee ID." });
          return;
        }

        const userExists = await User.exists({ _id: assignee });

        if (!userExists) {
          res.status(400).json({ message: "Assignee not found." });
          return;
        }

        updates.assignee = new mongoose.Types.ObjectId(assignee);
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "No valid updates provided." });
      return;
    }

    
    const task = await WorkspaceTask.findOneAndUpdate(
      {
        _id: taskId,
        createdBy: req.user.userId,
      },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("assignee", "name email role");

    if (!task) {
      res.status(404).json({ message: "Workspace task not found." });
      return;
    }

    
    const newAssigneeId =
      typeof assignee === "string" ? assignee : null;

    
    if (
      assignee !== undefined &&
      newAssigneeId &&
      newAssigneeId !== previousAssigneeId &&
      newAssigneeId !== req.user.userId
    ) {
      console.log("Task assigned to user ID:", newAssigneeId);

      notifyUser(newAssigneeId, {
        type: "task-assigned",
        title: "Task assigned to you",
        message: task.title,
        taskId: task._id.toString(),
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    res.status(200).json({
      message: "Workspace task updated successfully.",
      task,
    });
  } catch (error) {
    console.error("Update workspace task error:", error);
    res.status(500).json({ message: "Failed to update workspace task." });
  }
};

// DELETE /api/workspace/tasks/:taskId
export const deleteWorkspaceTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    const taskId = req.params.taskId;

    if (
    typeof taskId !== "string" ||
    !mongoose.Types.ObjectId.isValid(taskId)
    ) {
    res.status(400).json({ message: "Invalid task ID." });
    return;
    }

    const task = await WorkspaceTask.findOneAndDelete({
      _id: taskId,
      createdBy: req.user.userId,
    });

    if (!task) {
      res.status(404).json({ message: "Workspace task not found." });
      return;
    }

    res.status(200).json({ message: "Workspace task deleted successfully." });
  } catch (error) {
    console.error("Delete workspace task error:", error);
    res.status(500).json({ message: "Failed to delete workspace task." });
  }
};

export const getWorkspaceUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find()
      .select("_id name email role")
      .sort({ name: 1 })
      .lean();

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching workspace users:", error);
    res.status(500).json({
      message: "Failed to fetch workspace users.",
    });
  }
};
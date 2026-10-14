import mongoose, { Document, Schema } from "mongoose";

export type WorkspaceTaskStatus =
  | "To Do"
  | "In Progress"
  | "Done";

export type WorkspaceTaskPriority =
  | "Low"
  | "Medium"
  | "High";

export interface IWorkspaceTask extends Document {
  title: string;
  description?: string;
  status: WorkspaceTaskStatus;
  priority: WorkspaceTaskPriority;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  assignee?: mongoose.Types.ObjectId | null;
}

const workspaceTaskSchema = new Schema<IWorkspaceTask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done"],
      default: "To Do",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const WorkspaceTask = mongoose.model<IWorkspaceTask>(
  "WorkspaceTask",
  workspaceTaskSchema
);
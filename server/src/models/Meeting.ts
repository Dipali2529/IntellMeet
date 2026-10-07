import mongoose, { Document, Schema } from "mongoose";

export interface IMeeting extends Document {
  title: string;
  description?: string;
  host: mongoose.Types.ObjectId;
  meetingCode: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  allowChat: boolean;
  allowScreenShare: boolean;
  allowRecording: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<IMeeting>(
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
    },

    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    meetingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    scheduledDate: {
      type: String,
    },

    scheduledTime: {
      type: String,
    },

    duration: {
      type: Number,
      default: 60,
    },

    allowChat: {
      type: Boolean,
      default: true,
    },

    allowScreenShare: {
      type: Boolean,
      default: true,
    },

    allowRecording: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Meeting = mongoose.model<IMeeting>(
  "Meeting",
  meetingSchema
);
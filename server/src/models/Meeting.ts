
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
  isPublicDemo: boolean;
  // AI meeting history
  summary: string;
  transcript: string;
  keyPoints: string[];

  // Persisted meeting chat
  chatMessages: {
    senderName: string;
    message: string;
    createdAt: Date;
  }[];

  // Recording metadata (not the actual audio/video file)
  recordingUrl?: string;
  recordingAvailable: boolean;

  actionItems: {
    _id?: mongoose.Types.ObjectId;
    task: string;
    assignee: string;
    dueDate: string;
    status: "Pending" | "In Progress" | "Completed";
  }[];

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

    scheduledDate: String,
    scheduledTime: String,

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
    isPublicDemo: {
          type: Boolean,
          default: false,
          index: true,
        },
    summary: {
      type: String,
      default: "",
    },

    transcript: {
      type: String,
      default: "",
    },

    keyPoints: {
      type: [String],
      default: [],
    },

    chatMessages: {
      type: [
        {
          senderName: {
            type: String,
            default: "Participant",
          },
          message: {
            type: String,
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },

    recordingUrl: {
      type: String,
      default: "",
    },

    recordingAvailable: {
      type: Boolean,
      default: false,
    },

    actionItems: {
      type: [
        {
          task: {
            type: String,
            required: true,
          },
          assignee: {
            type: String,
            default: "",
          },
          dueDate: {
            type: String,
            default: "",
          },
          status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending",
          },
        },
      ],
      default: [],
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

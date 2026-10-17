import "dotenv/config";

import express from "express";
import transcriptionRoutes from "./routes/transcriptionRoutes";
import meetingSummaryRoutes from "./routes/meetingSummaryRoutes";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
//import dotenv from "dotenv";
import { Server } from "socket.io";
import teamRoutes from "./routes/teamRoutes";
import setupSocket from "./services/socket";
import authRoutes from "./routes/authRoutes";
import meetingRoutes from "./routes/meetingRoutes";

import { connectDB } from "./config/db";
import workspaceRoutes from "./routes/workspaceRoutes";
import { setNotificationServer } from "./services/notificationService";
//dotenv.config();

const app = express();

app.use(
  cors({
   origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/transcription", transcriptionRoutes);
app.use(
  "/api/meeting-summary",
  meetingSummaryRoutes
);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/teams", teamRoutes);
app.use(cookieParser());

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "IntellMeet Server is running",
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize Socket.io events
setupSocket(io);
setNotificationServer(io);

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`IntellMeet server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start IntellMeet server:", error);
    process.exit(1);
  }
};

startServer();
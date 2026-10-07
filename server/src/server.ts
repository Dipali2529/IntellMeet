import dotenv from "dotenv";

dotenv.config();

import express from "express";
import transcriptionRoutes from "./routes/transcriptionRoutes";
import meetingSummaryRoutes from "./routes/meetingSummaryRoutes";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
//import dotenv from "dotenv";
import { Server } from "socket.io";

import setupSocket from "./services/socket";
import authRoutes from "./routes/authRoutes";
import meetingRoutes from "./routes/meetingRoutes";

import { connectDB } from "./config/db";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/transcription", transcriptionRoutes);
app.use(
  "/api/meeting-summary",
  meetingSummaryRoutes
);

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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize Socket.io events
setupSocket(io);

const PORT = 5000;

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`IntellMeet server running on port ${PORT}`);
  });
};

startServer();
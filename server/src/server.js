const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Basic test API
app.get("/", (req, res) => {
  res.json({
    message: "IntellMeet Server is running",
  });
});

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join meeting
  socket.on("join-meeting", (meetingId) => {
    socket.join(meetingId);

    console.log(
      `User ${socket.id} joined meeting ${meetingId}`
    );

    // Tell other users that a new participant joined
    socket.to(meetingId).emit("user-joined", {
      socketId: socket.id,
    });
  });

  // WebRTC offer
  socket.on("offer", ({ target, offer }) => {
    io.to(target).emit("offer", {
      sender: socket.id,
      offer,
    });
  });

  // WebRTC answer
  socket.on("answer", ({ target, answer }) => {
    io.to(target).emit("answer", {
      sender: socket.id,
      answer,
    });
  });

  // ICE candidate
  socket.on("ice-candidate", ({ target, candidate }) => {
    io.to(target).emit("ice-candidate", {
      sender: socket.id,
      candidate,
    });
  });

  // Chat message
  socket.on("send-message", ({ meetingId, message }) => {
    io.to(meetingId).emit("receive-message", {
      sender: socket.id,
      message,
    });
  });

  // User disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Server port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`IntellMeet server running on port ${PORT}`);
});
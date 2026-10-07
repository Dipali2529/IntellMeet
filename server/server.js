const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "IntellMeet Server is running",
  });
});

// Create HTTP server
const server = http.createServer(app);

// Socket.io
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

  socket.on("join-meeting", (meetingId) => {
    socket.join(meetingId);

    console.log(
      `User ${socket.id} joined meeting ${meetingId}`
    );

    socket.to(meetingId).emit("user-joined", {
      socketId: socket.id,
    });
  });

  socket.on("offer", ({ target, offer }) => {
    io.to(target).emit("offer", {
      sender: socket.id,
      offer,
    });
  });

  socket.on("answer", ({ target, answer }) => {
    io.to(target).emit("answer", {
      sender: socket.id,
      answer,
    });
  });

  socket.on("ice-candidate", ({ target, candidate }) => {
    io.to(target).emit("ice-candidate", {
      sender: socket.id,
      candidate,
    });
  });

  socket.on("send-message", ({ meetingId, message }) => {
    io.to(meetingId).emit("receive-message", {
      sender: socket.id,
      message,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`IntellMeet Server running on port ${PORT}`);
});
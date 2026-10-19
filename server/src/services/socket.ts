import { User } from "../models/User";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";

type WebRTCOffer = {
  type?: string;
  sdp?: string;
};

type WebRTCAnswer = {
  type?: string;
  sdp?: string;
};

type WebRTCIceCandidate = {
  candidate?: string | null;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
};

const setupSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {

    
   
    // Authenticate when a token is provided, but allow guest sockets.
    const token = socket.handshake.auth?.token as string | undefined;

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "super_secret_access_jwt_key_2026"
        ) as { userId: string; role: "Admin" | "Member" };

        socket.data.userId = decoded.userId;
        socket.data.role = decoded.role;

        void socket.join(`user:${decoded.userId}`);
        console.log("Notification room joined:", `user:${decoded.userId}`);
      } catch {
        // Reject an invalid token rather than silently treating it as a guest.
        socket.disconnect(true);
        return;
      }
    } else {
      socket.data.userId = null;
      socket.data.role = "Guest";
      console.log("Guest socket connected:", socket.id);
    }

    console.log("User connected:", socket.id);

    // ==========================================
    // JOIN MEETING
    // ==========================================
    socket.on("join-meeting", (meetingId: string) => {
      const existingUsers = Array.from(
        io.sockets.adapter.rooms.get(meetingId) || []
      );

      socket.join(meetingId);

      socket.data.meetingId = meetingId;

      socket.data.cameraEnabled = true;
      socket.data.microphoneEnabled = true;

      console.log(
        `User ${socket.id} joined meeting ${meetingId}`
      );

      // Send existing users to the new participant
      socket.emit("room-users", {
        socketIds: existingUsers,
      });

      // Notify existing participants
      socket.to(meetingId).emit("user-joined", {
        socketId: socket.id,
      });
    });

    // ==========================================
    // WEBRTC OFFER
    // ==========================================
    socket.on(
      "offer",
      ({
        target,
        offer,
      }: {
        target: string;
        offer: WebRTCOffer;
      }) => {
        console.log(
          `Offer from ${socket.id} to ${target}`
        );

        io.to(target).emit("offer", {
          sender: socket.id,
          offer,
        });
      }
    );

    // ==========================================
    // WEBRTC ANSWER
    // ==========================================
    socket.on(
      "answer",
      ({
        target,
        answer,
      }: {
        target: string;
        answer: WebRTCAnswer;
      }) => {
        console.log(
          `Answer from ${socket.id} to ${target}`
        );

        io.to(target).emit("answer", {
          sender: socket.id,
          answer,
        });
      }
    );

    // ==========================================
    // ICE CANDIDATE
    // ==========================================
    socket.on(
      "ice-candidate",
      ({
        target,
        candidate,
      }: {
        target: string;
        candidate: WebRTCIceCandidate;
      }) => {
        console.log(
          `ICE candidate from ${socket.id} to ${target}`
        );

        io.to(target).emit("ice-candidate", {
          sender: socket.id,
          candidate,
        });
      }
    );

    // ==========================================
    // CHAT MESSAGE + @MENTION NOTIFICATIONS
    // ==========================================
    socket.on(
      "chat-message",
      async ({
        meetingId,
        message,
      }: {
        meetingId: string;
        message: {
          text: string;
        };
      }) => {
        const text = message.text.trim();

        if (!text) return;

        // Send the chat message to other meeting participants.
        socket.to(meetingId).emit("chat-message", {
          text,
        });

        // Find email mentions such as @dipali@example.com.
        const matches = text.match(
          /@[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
        ) ?? [];

        const mentionedEmails = [
          ...new Set(matches.map((mention) => mention.slice(1).toLowerCase())),
        ];

        for (const email of mentionedEmails) {
          try {
            const mentionedUser = await User.findOne({ email }).select("_id name");

            if (!mentionedUser) continue;

            const mentionedUserId = mentionedUser._id.toString();

            // Do not notify the sender about their own mention.
            if (mentionedUserId === socket.data.userId) continue;

            // Send a real-time notification to the mentioned user.
            io.to(`user:${mentionedUserId}`).emit("notification:new", {
              type: "mention",
              title: "You were mentioned in a meeting",
              message: text,
              createdAt: new Date().toISOString(),
              read: false,
            });
          } catch (error) {
            console.error("Failed to send mention notification:", error);
          }
        }
      }
    );

         // ==========================================
        // PARTICIPANT MEDIA STATUS
        // ==========================================
        socket.on(
          "media-status",
          ({
            meetingId,
            cameraEnabled,
            microphoneEnabled,
          }: {
            meetingId: string;
            cameraEnabled: boolean;
            microphoneEnabled: boolean;
          }) => {
            socket.data.cameraEnabled =
              cameraEnabled;

            socket.data.microphoneEnabled =
              microphoneEnabled;

            socket.to(meetingId).emit(
              "participant-media-status",
              {
                socketId: socket.id,
                cameraEnabled,
                microphoneEnabled,
              }
            );
          }
        );


        
    // ==========================================
    // TASK ASSIGNMENT NOTIFICATION
    // ==========================================
    socket.on(
      "task-assigned",
      (data: {
        assigneeId: string;
        taskId: string;
        title: string;
      }) => {
        if (data.assigneeId !== socket.data.userId) {
          return;
        }

        io.to(`user:${data.assigneeId}`).emit("notification:new", {
          type: "task-assigned",
          title: "New task assigned",
          message: data.title,
          taskId: data.taskId,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
    );
    // ==========================================
    // DISCONNECT
    // ==========================================
    socket.on("disconnect", () => {
      const meetingId = socket.data.meetingId;

      console.log(
        "User disconnected:",
        socket.id
      );

      if (meetingId) {
        socket.to(meetingId).emit("user-left", {
          socketId: socket.id,
        });

        console.log(
          `User ${socket.id} left meeting ${meetingId}`
        );
      }
    });
  });
};

export default setupSocket;
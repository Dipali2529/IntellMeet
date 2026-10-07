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
    // CHAT MESSAGE
    // ==========================================
    socket.on(
      "chat-message",
      ({
        meetingId,
        message,
      }: {
        meetingId: string;
        message: {
          text: string;
        };
      }) => {
        console.log(
          `Chat message from ${socket.id} in meeting ${meetingId}:`,
          message.text
        );

        // Send message to all OTHER participants
        // in the same meeting room.
        socket.to(meetingId).emit("chat-message", {
          text: message.text,
        });
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
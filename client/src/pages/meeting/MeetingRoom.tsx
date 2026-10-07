import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { socket } from "../../services/socket";
import { rtcConfiguration } from "../../services/webrtc";
import { transcribeAudio } from "../../services/transcriptionService";

interface Meeting {
  _id: string;
  title: string;
  description?: string;
  host: string;
  meetingCode: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  allowChat: boolean;
  allowScreenShare: boolean;
  allowRecording: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  sender: string;
  message: string;
  time: string;
}

function MeetingRoom() {
  const navigate = useNavigate();

  // ==========================================
  // VIDEO REFERENCES
  // ==========================================
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  

  // ==========================================
  // WEBRTC REFERENCES
  // ==========================================
  const peerConnectionRef =
    useRef<RTCPeerConnection | null>(null);

  // const localStreamRef = useRef<MediaStream | null>(null);

  // const remoteSocketIdRef = useRef<string | null>(null);

  // const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);


  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const remoteSocketIdRef = useRef<string | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidate[]>([]);
  const [mediaReady, setMediaReady] = useState(false);
  // ==========================================
  // STATE
  // ==========================================
  const [meeting, setMeeting] =
    useState<Meeting | null>(null);

  const [cameraEnabled, setCameraEnabled] =
    useState(true);

  const [microphoneEnabled, setMicrophoneEnabled] =
    useState(true);

    const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [participants, setParticipants] =
    useState<string[]>([]);

    const [participantMediaStatus, setParticipantMediaStatus] =
  useState<
    Record<
      string,
      {
        cameraEnabled: boolean;
        microphoneEnabled: boolean;
      }
    >
  >({});

  const [showParticipants, setShowParticipants] =
    useState(false);

  const [showChat, setShowChat] =
    useState(false);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [chatMessage, setChatMessage] =
    useState("");

    const [transcript, setTranscript] = useState("");
    const [isTranscribing, setIsTranscribing] = useState(false);


    const handleTranscription = async (audioBlob: Blob) => {
  try {
    setIsTranscribing(true);

    const result = await transcribeAudio(audioBlob);

    setTranscript(result);
  } catch (error) {
    console.error("Transcription error:", error);
  } finally {
    setIsTranscribing(false);
  }
};
  // ==========================================
  // LOAD MEETING
  // ==========================================
  useEffect(() => {
    const savedMeeting =
      localStorage.getItem("currentMeeting");

    if (!savedMeeting) {
      navigate("/dashboard");
      return;
    }

    try {
      const parsedMeeting =
        JSON.parse(savedMeeting) as Meeting;

      setMeeting(parsedMeeting);
    } catch (error) {
      console.error(
        "Invalid meeting data:",
        error
      );

      localStorage.removeItem("currentMeeting");

      navigate("/dashboard");
    }
  }, [navigate]);

  // ==========================================
  // LOCAL CAMERA + MICROPHONE
  // ==========================================
    useEffect(() => {
      const startLocalMedia = async () => {
        try {
          const stream =
            await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });

          localStreamRef.current = stream;

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }

          setMediaReady(true);
        } catch (error) {
          console.error(
            "Error accessing camera/microphone:",
            error
          );
        }
      };

      startLocalMedia();

      return () => {
        if (localStreamRef.current) {
          localStreamRef.current
            .getTracks()
            .forEach((track) => track.stop());
        }
      };
    }, []);
  // ==========================================
  // CREATE WEBRTC PEER CONNECTION
  // ==========================================
  const createPeerConnection = (
    targetSocketId: string
  ) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const peerConnection =
      new RTCPeerConnection(
        rtcConfiguration
      );

    peerConnectionRef.current =
      peerConnection;

    remoteSocketIdRef.current =
      targetSocketId;

    // ------------------------------------------
    // Add local tracks
    // ------------------------------------------
    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => {
          peerConnection.addTrack(
            track,
            localStreamRef.current as MediaStream
          );
        });
    }

    // ------------------------------------------
    // Remote stream
    // ------------------------------------------
    peerConnection.ontrack = (event) => {
      console.log(
        "Remote track received"
      );

      const remoteStream =
        event.streams[0];

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject =
          remoteStream;

        remoteVideoRef.current
          .play()
          .catch((error) => {
            console.log(
              "Remote video autoplay waiting:",
              error
            );
          });
      }
    };

    // ------------------------------------------
    // ICE candidate
    // ------------------------------------------
    peerConnection.onicecandidate = (
      event
    ) => {
      if (
        event.candidate &&
        remoteSocketIdRef.current
      ) {
        socket.emit("ice-candidate", {
          target:
            remoteSocketIdRef.current,
          candidate:
            event.candidate.toJSON(),
        });

        console.log(
          "ICE candidate sent to:",
          remoteSocketIdRef.current
        );
      }
    };

    // ------------------------------------------
    // Connection state
    // ------------------------------------------
    peerConnection.onconnectionstatechange =
      () => {
        console.log(
          "WebRTC connection state:",
          peerConnection.connectionState
        );
      };

    // ------------------------------------------
    // ICE connection state
    // ------------------------------------------
    peerConnection.oniceconnectionstatechange =
      () => {
        console.log(
          "ICE connection state:",
          peerConnection.iceConnectionState
        );
      };

    return peerConnection;
  };

  // ==========================================
  // SOCKET.IO + WEBRTC SIGNALING
  // ==========================================
  useEffect(() => {
    if (!meeting?.meetingCode) {
      return;
    }

    const meetingId =
      meeting.meetingCode;

    socket.connect();


    console.log(
      "Connecting to Socket.io server..."
    );

    // ------------------------------------------
    // SOCKET CONNECT
    // ------------------------------------------
    const handleConnect = () => {
      console.log(
        "Socket connected:",
        socket.id
      );

      socket.emit(
        "join-meeting",
        meetingId
      );

      console.log(
        "Joined meeting:",
        meetingId
      );
    };

    // ------------------------------------------
    // SOCKET DISCONNECT
    // ------------------------------------------
    const handleDisconnect = () => {
      console.log(
        "Socket disconnected"
      );
    };

    // ------------------------------------------
    // EXISTING USERS
    // ------------------------------------------
    const handleRoomUsers = ({
      socketIds,
    }: {
      socketIds: string[];
    }) => {
      console.log(
        "Existing participants:",
        socketIds
      );

      setParticipants(socketIds);
    };

    // ------------------------------------------
    // NEW USER JOINED
    // ------------------------------------------
    const handleUserJoined = async ({
      socketId,
    }: {
      socketId: string;
    }) => {
      console.log(
        "Another user joined:",
        socketId
      );

      setParticipants((previous) => {
        if (
          previous.includes(socketId)
        ) {
          return previous;
        }

        return [
          ...previous,
          socketId,
        ];
      });

      remoteSocketIdRef.current =
        socketId;

      const peerConnection =
        createPeerConnection(
          socketId
        );

      try {
        const offer =
          await peerConnection.createOffer();

        await peerConnection.setLocalDescription(
          offer
        );

        socket.emit("offer", {
          target: socketId,
          offer,
        });

        console.log(
          "Offer sent to:",
          socketId
        );
      } catch (error) {
        console.error(
          "Error creating offer:",
          error
        );
      }
    };


        const handleParticipantMediaStatus = ({
      socketId,
      cameraEnabled,
      microphoneEnabled,
    }: {
      socketId: string;
      cameraEnabled: boolean;
      microphoneEnabled: boolean;
    }) => {
      setParticipantMediaStatus(
        (previous) => ({
          ...previous,
          [socketId]: {
            cameraEnabled,
            microphoneEnabled,
          },
        })
      );
    };
    // ------------------------------------------
    // OFFER RECEIVED
    // ------------------------------------------
    const handleOffer = async ({
      sender,
      offer,
    }: {
      sender: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      try {
        console.log(
          "Offer received from:",
          sender
        );

        remoteSocketIdRef.current =
          sender;

        const peerConnection =
          createPeerConnection(
            sender
          );

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(
            offer
          )
        );

        // Add ICE candidates that arrived
        // before remote description
        for (
          const candidate of
            pendingIceCandidatesRef.current
        ) {
          try {
            await peerConnection.addIceCandidate(
  new RTCIceCandidate(candidate)
);


            console.log(
              "Pending ICE candidate added"
            );
          } catch (error) {
            console.error(
              "Error adding pending ICE candidate:",
              error
            );
          }
        }

        pendingIceCandidatesRef.current =
          [];

        const answer =
          await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(
          answer
        );

        socket.emit("answer", {
          target: sender,
          answer,
        });

        console.log(
          "Answer sent to:",
          sender
        );
      } catch (error) {
        console.error(
          "Error handling WebRTC offer:",
          error
        );
      }
    };

    // ------------------------------------------
    // ANSWER RECEIVED
    // ------------------------------------------
    const handleAnswer = async ({
      sender,
      answer,
    }: {
      sender: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      try {
        console.log(
          "Answer received from:",
          sender
        );

        if (
          !peerConnectionRef.current
        ) {
          console.error(
            "Peer connection not found."
          );

          return;
        }

        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(
            answer
          )
        );

        // Add pending ICE candidates
        for (
          const candidate of
            pendingIceCandidatesRef.current
        ) {
          try {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );

            console.log(
              "Pending ICE candidate added"
            );
          } catch (error) {
            console.error(
              "Error adding pending ICE candidate:",
              error
            );
          }
        }

        pendingIceCandidatesRef.current =
          [];
      } catch (error) {
        console.error(
          "Error handling answer:",
          error
        );
      }
    };

    // ------------------------------------------
    // ICE CANDIDATE RECEIVED
    // ------------------------------------------
    const handleIceCandidate = async ({
      sender,
      candidate,
    }: {
      sender: string;
      candidate: RTCIceCandidateInit;
    }) => {
      console.log(
        "ICE candidate received from:",
        sender
      );

      if (
        !peerConnectionRef.current
      ) {
        console.log(
          "Peer connection not ready. Saving ICE candidate."
        );

    if (peerConnectionRef.current !== null) {
  const connection: RTCPeerConnection =
    peerConnectionRef.current;

  await connection.addIceCandidate(
    new RTCIceCandidate(candidate)
  );
}
        return;
      }

      try {
        if (
          peerConnectionRef.current
            .remoteDescription
        ) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );

          console.log(
            "ICE candidate added successfully"
          );
        } else {
          console.log(
            "Remote description not ready. Saving ICE candidate."
          );
await peerConnectionRef.current.addIceCandidate(
  new RTCIceCandidate(candidate)
);
        }
      } catch (error) {
        console.error(
          "Error adding ICE candidate:",
          error
        );
      }
    };

    // ------------------------------------------
    // USER LEFT
    // ------------------------------------------
    const handleUserLeft = ({
      socketId,
    }: {
      socketId: string;
    }) => {
      console.log(
        "Participant left:",
        socketId
      );

      setParticipants((previous) =>
        previous.filter(
          (participantId) =>
            participantId !== socketId
        )
      );

      if (
        remoteSocketIdRef.current ===
        socketId
      ) {
        remoteSocketIdRef.current =
          null;

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject =
            null;
        }

        peerConnectionRef.current?.close();

        peerConnectionRef.current =
          null;
      }
    };

        // ==========================================
    // CHAT MESSAGE RECEIVED
    // ==========================================
    const handleChatMessage = ({
      text,
    }: {
      text: string;
    }) => {
      console.log("Chat message received:", text);

      const receivedMessage: ChatMessage = {
        sender: "Participant",
        message: text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((previous) => [
        ...previous,
        receivedMessage,
      ]);
    };
    // ------------------------------------------
    // REGISTER SOCKET EVENTS
    // ------------------------------------------
    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    socket.on(
      "room-users",
      handleRoomUsers
    );

    socket.on(
      "user-joined",
      handleUserJoined
    );

        socket.on(
      "participant-media-status",
      handleParticipantMediaStatus
    );

    socket.on(
      "offer",
      handleOffer
    );

    socket.on(
      "answer",
      handleAnswer
    );

    socket.on(
      "ice-candidate",
      handleIceCandidate
    );

    socket.on(
      "user-left",
      handleUserLeft
    );

      socket.on(
      "chat-message",
      handleChatMessage
    );
    // ------------------------------------------
    // CLEANUP
    // ------------------------------------------
    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "room-users",
        handleRoomUsers
      );

      socket.off(
        "user-joined",
        handleUserJoined
      );

            socket.off(
        "participant-media-status",
        handleParticipantMediaStatus
      );

      socket.off(
        "offer",
        handleOffer
      );

      socket.off(
        "answer",
        handleAnswer
      );

      socket.off(
        "ice-candidate",
        handleIceCandidate
      );

      socket.off(
        "user-left",
        handleUserLeft
      );

      socket.off(
        "chat-message",
        handleChatMessage
      );
      socket.disconnect();

      peerConnectionRef.current?.close();

      peerConnectionRef.current =
        null;
    };
  //}, [meeting?.meetingCode]); //change fo rWebRTC should only start after the local camera stream exists.
  }, [meeting?.meetingCode, localStreamRef.current]);

  // ==========================================
  // CAMERA TOGGLE
  // ==========================================
  const toggleCamera = () => {
    const stream =
      localStreamRef.current;

    if (!stream) {
      return;
    }

    const videoTrack =
      stream.getVideoTracks()[0];

    if (!videoTrack) {
      return;
    }

    videoTrack.enabled =
      !videoTrack.enabled;

    setCameraEnabled(
      videoTrack.enabled
    );

      socket.emit("media-status", {
    meetingId: meeting?.meetingCode,
    cameraEnabled: videoTrack.enabled,
    microphoneEnabled:
      localStreamRef.current?.getAudioTracks()[0]
        ?.enabled ?? true,
    });
  };

  // ==========================================
  // MICROPHONE TOGGLE
  // ==========================================
  const toggleMicrophone = () => {
    const stream =
      localStreamRef.current;

    if (!stream) {
      return;
    }

    const audioTrack =
      stream.getAudioTracks()[0];

    if (!audioTrack) {
      return;
    }

    audioTrack.enabled =
      !audioTrack.enabled;

    setMicrophoneEnabled(
      audioTrack.enabled
    );

        socket.emit("media-status", {
      meetingId: meeting?.meetingCode,
      cameraEnabled:
        localStreamRef.current?.getVideoTracks()[0]
          ?.enabled ?? true,
      microphoneEnabled:
        audioTrack.enabled,
    });
  };

    // ==========================================
    // SEND CHAT MESSAGE
    // ==========================================
    const sendChatMessage = () => {
      if (!chatMessage.trim()) {
        return;
      }

      const newMessage: ChatMessage = {
        sender: "You",
        message: chatMessage.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Show message in your own browser
      setMessages((previous) => [
        ...previous,
        newMessage,
      ]);

      // Send message to other participants
      if (meeting?.meetingCode) {
        socket.emit("chat-message", {
          meetingId: meeting.meetingCode,
          message: {
            text: chatMessage.trim(),
          },
        });
      }

      // Clear input
      setChatMessage("");
    };

  // ==========================================
  // LEAVE MEETING
  // ==========================================
  const leaveMeeting = () => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject =
        null;
    }

    peerConnectionRef.current?.close();

    peerConnectionRef.current =
      null;

    socket.disconnect();

    localStorage.removeItem(
      "currentMeeting"
    );

    navigate("/dashboard");
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (!meeting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        Loading meeting...
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================
  return (
    
    <div className="flex h-screen flex-col bg-gray-950 text-white">

      <button
        onClick={() => {
          const testAudio = new Blob(
            ["IntellMeet test audio"],
            { type: "audio/webm" }
          );

          handleTranscription(testAudio);
        }}
        disabled={isTranscribing}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        {isTranscribing
          ? "Transcribing..."
          : "Test Transcription"}
      </button>

            {transcript && (
        <div className="mt-4 p-4 rounded bg-gray-100 text-gray-900">
          <h3 className="font-semibold mb-2">
            Meeting Transcript
          </h3>

          <p>{transcript}</p>
        </div>
      )}
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}
      <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-5">

        <div>
          <h1 className="text-lg font-semibold">
            {meeting.title}
          </h1>

          <p className="text-xs text-gray-400">
            Meeting ID:{" "}
            {meeting.meetingCode}
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={() =>
              setShowParticipants(
                !showParticipants
              )
            }
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700"
          >
            👥 Participants
          </button>

          <button
            onClick={() =>
              setShowChat(!showChat)
            }
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700"
          >
            💬 Chat
          </button>

        </div>
      </header>

      {/* ====================================== */}
      {/* MAIN AREA */}
      {/* ====================================== */}
      <div className="flex flex-1 overflow-hidden">

        {/* ==================================== */}
        {/* VIDEO AREA */}
        {/* ==================================== */}
        <main className="relative flex flex-1 items-center justify-center bg-black p-4">

          <div className="grid h-full w-full max-w-7xl grid-cols-1 gap-4 md:grid-cols-2">

            {/* LOCAL VIDEO */}
            <div className="relative overflow-hidden rounded-xl bg-gray-900">

              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
              />

              <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-2 text-sm">
                You
              </div>

              {!cameraEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl">
                      Y
                    </div>

                    <p className="text-gray-300">
                      Camera is off
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* REMOTE VIDEO */}
            <div className="relative overflow-hidden rounded-xl bg-gray-900">

              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />

              {participants.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-700 text-3xl">
                      P
                    </div>

                    <p className="text-gray-400">
                      Waiting for another participant...
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-2 text-sm">
                Remote Participant
              </div>
            </div>

          </div>
        </main>

        {/* ==================================== */}
        {/* PARTICIPANTS PANEL */}
        {/* ==================================== */}
        {showParticipants && (
          <aside className="flex w-80 flex-col border-l border-gray-800 bg-gray-900">

            <div className="border-b border-gray-800 p-4">
              <h2 className="font-semibold">
                Participants
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {participants.length + 1}{" "}
                {participants.length + 1 === 1
                  ? "participant"
                  : "participants"}
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">

              {/* YOU */}
              <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold">
                  Y
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">
                    You
                  </p>

                  <p className="text-xs text-gray-500">
                    Host
                  </p>
                </div>

                <span>
                  {microphoneEnabled
                    ? "🎤"
                    : "🔇"}
                </span>

              </div>

              {/* OTHER PARTICIPANTS */}
              {participants.map(
                (
                  participantId,
                  index
                ) => (
                  <div
                    key={participantId}
                    className="flex items-center gap-3 rounded-lg bg-gray-800 p-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 font-semibold">
                      P
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Participant{" "}
                        {index + 1}
                      </p>

                      <p className="text-xs text-gray-500">
                        Meeting Member
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                    <span>
                      {participantMediaStatus[
                        participantId
                      ]?.microphoneEnabled !== false
                        ? "🎤"
                        : "🔇"}
                    </span>

                    <span>
                      {participantMediaStatus[
                        participantId
                      ]?.cameraEnabled !== false
                        ? "📹"
                        : "🚫"}
                    </span>
                  </div>
                  </div>
                )
              )}

              {participants.length ===
                0 && (
                <p className="pt-4 text-center text-sm text-gray-500">
                  You are the only participant in this meeting.
                </p>
              )}

            </div>
          </aside>
        )}

        {/* ==================================== */}
        {/* CHAT PANEL */}
        {/* ==================================== */}
        {showChat && (
          <aside className="flex w-80 flex-col border-l border-gray-800 bg-gray-900">

            <div className="border-b border-gray-800 p-4">
              <h2 className="font-semibold">
                Meeting Chat
              </h2>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">

              {messages.length === 0 && (
                <p className="text-center text-sm text-gray-500">
                  No messages yet.
                </p>
              )}

              {messages.map(
                (message, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-gray-800 p-3"
                  >
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">
                        {message.sender}
                      </span>

                      <span className="text-xs text-gray-500">
                        {message.time}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-300">
                      {message.message}
                    </p>
                  </div>
                )
              )}

            </div>

            <div className="border-t border-gray-800 p-3">

              <div className="flex gap-2">

                <input
                  value={chatMessage}
                  onChange={(event) =>
                    setChatMessage(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      sendChatMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={
                    sendChatMessage
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
                >
                  Send
                </button>

              </div>

            </div>
          </aside>
        )}

      </div>

      {/* ====================================== */}
      {/* BOTTOM CONTROLS */}
      {/* ====================================== */}
      <footer className="flex h-20 items-center justify-center gap-3 border-t border-gray-800 bg-gray-900">

        {/* MICROPHONE */}
        <button
          onClick={
            toggleMicrophone
          }
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            microphoneEnabled
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {microphoneEnabled
            ? "🎤"
            : "🔇"}
        </button>

        {/* CAMERA */}
        <button
          onClick={toggleCamera}
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            cameraEnabled
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {cameraEnabled
            ? "📹"
            : "📷"}
        </button>

        {/* SCREEN SHARE */}
        {meeting.allowScreenShare && (
          <button
            onClick={async () => {
              try {
                const screenStream =
                  await navigator.mediaDevices.getDisplayMedia(
                    {
                      video: true,
                    }
                  );

                const screenTrack =
                  screenStream.getVideoTracks()[0];

                if (
                  peerConnectionRef.current
                ) {
                  const sender =
                    peerConnectionRef.current
                      .getSenders()
                      .find(
                        (item) =>
                          item.track
                            ?.kind ===
                          "video"
                      );

                  if (sender) {
                    await sender.replaceTrack(
                      screenTrack
                    );
                  }
                }

                screenTrack.onended =
                  async () => {
                    const cameraTrack =
                      localStreamRef.current?.getVideoTracks()[0];

                    const sender =
                      peerConnectionRef.current
                        ?.getSenders()
                        .find(
                          (item) =>
                            item.track
                              ?.kind ===
                            "video"
                        );

                    if (
                      sender &&
                      cameraTrack
                    ) {
                      await sender.replaceTrack(
                        cameraTrack
                      );
                    }
                  };
              } catch (error) {
                console.error(
                  "Screen sharing failed:",
                  error
                );
              }
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700"
          >
            🖥️
          </button>
        )}

        {/* LEAVE */}
        <button
          onClick={leaveMeeting}
          className="rounded-full bg-red-600 px-6 py-3 font-medium hover:bg-red-700"
        >
          Leave Meeting
        </button>

      </footer>
    </div>
  );
}

export default MeetingRoom;
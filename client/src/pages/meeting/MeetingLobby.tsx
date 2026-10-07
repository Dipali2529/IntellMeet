import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
}

export default function MeetingLobby() {
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<Meeting | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load meeting information
  useEffect(() => {
    const storedMeeting = localStorage.getItem("currentMeeting");

    if (!storedMeeting) {
      navigate("/dashboard");
      return;
    }

    try {
      const parsedMeeting: Meeting = JSON.parse(storedMeeting);

      setMeeting(parsedMeeting);
    } catch (error) {
      console.error("Unable to read meeting information:", error);

      setError("Unable to load meeting information.");

      navigate("/dashboard");
    }
  }, [navigate]);

  // Start camera and microphone
  useEffect(() => {
    const startMedia = async () => {
      try {
        setLoading(true);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setCameraEnabled(true);
        setMicrophoneEnabled(true);
        setError("");
      } catch (err) {
        console.error("Media permission error:", err);

        setError(
          "Camera or microphone permission was denied. Please allow access from your browser."
        );
      } finally {
        setLoading(false);
      }
    };

    startMedia();

    return () => {
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  // Camera toggle
  const toggleCamera = () => {
    const stream = streamRef.current;

    if (!stream) return;

    const videoTracks = stream.getVideoTracks();

    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setCameraEnabled(videoTracks[0]?.enabled ?? false);
  };

  // Microphone toggle
  const toggleMicrophone = () => {
    const stream = streamRef.current;

    if (!stream) return;

    const audioTracks = stream.getAudioTracks();

    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setMicrophoneEnabled(audioTracks[0]?.enabled ?? false);
  };

  // Join meeting
  const handleJoinMeeting = () => {
    if (!meeting) {
      setError("Meeting information is not available.");
      return;
    }

    navigate("/meeting/room");
  };

  // Leave lobby
  const handleLeave = () => {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              IntellMeet
            </h1>

            <p className="text-sm text-gray-400">
              Meeting Lobby
            </p>
          </div>

          <button
            type="button"
            onClick={handleLeave}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center justify-center p-6">
        <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl">
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <p className="text-gray-400">
                    Starting camera...
                  </p>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`h-full w-full object-cover ${
                  cameraEnabled ? "" : "hidden"
                }`}
              />

              {!cameraEnabled && (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-700 text-3xl">
                      👤
                    </div>

                    <p className="text-gray-400">
                      Camera is off
                    </p>
                  </div>
                </div>
              )}

              {/* Camera status */}
              <div className="absolute bottom-4 left-4 rounded-lg bg-black/70 px-3 py-2 text-sm">
                {cameraEnabled
                  ? "📹 Camera On"
                  : "📹 Camera Off"}
              </div>
            </div>

            {/* Controls */}
            <div className="mt-5 flex justify-center gap-4">
              {/* Microphone */}
              <button
                type="button"
                onClick={toggleMicrophone}
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  microphoneEnabled
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                title={
                  microphoneEnabled
                    ? "Turn microphone off"
                    : "Turn microphone on"
                }
              >
                {microphoneEnabled ? "🎤" : "🔇"}
              </button>

              {/* Camera */}
              <button
                type="button"
                onClick={toggleCamera}
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  cameraEnabled
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                title={
                  cameraEnabled
                    ? "Turn camera off"
                    : "Turn camera on"
                }
              >
                {cameraEnabled ? "📹" : "🚫"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Meeting Information */}
          <div className="rounded-2xl bg-gray-900 p-6">
            <h2 className="text-2xl font-bold">
              Ready to join?
            </h2>

            <p className="mt-2 text-gray-400">
              Check your camera and microphone before joining the meeting.
            </p>

            {/* Meeting Details */}
            <div className="mt-8 rounded-xl bg-gray-800 p-5">
              <p className="text-sm text-gray-400">
                Meeting
              </p>

              <h3 className="mt-1 text-lg font-semibold">
                {meeting?.title || "Loading meeting..."}
              </h3>

              {meeting?.description && (
                <p className="mt-2 text-sm text-gray-400">
                  {meeting.description}
                </p>
              )}

              <div className="mt-4 space-y-2 text-sm text-gray-400">
                <p>
                  🔑 Meeting Code:{" "}
                  <span className="font-medium text-white">
                    {meeting?.meetingCode || "Loading..."}
                  </span>
                </p>

                <p>
                  📅 Date:{" "}
                  {meeting?.scheduledDate || "Not specified"}
                </p>

                <p>
                  🕐 Time:{" "}
                  {meeting?.scheduledTime || "Not specified"}
                </p>

                <p>
                  ⏱️ Duration:{" "}
                  {meeting?.duration
                    ? `${meeting.duration} minutes`
                    : "Not specified"}
                </p>

                <p>
                  👥 Participants: 0
                </p>

                <p>
                  🎤 Microphone:{" "}
                  {microphoneEnabled ? "On" : "Off"}
                </p>

                <p>
                  📹 Camera:{" "}
                  {cameraEnabled ? "On" : "Off"}
                </p>

                <p>
                  💬 Chat:{" "}
                  {meeting?.allowChat ? "Enabled" : "Disabled"}
                </p>

                <p>
                  🖥️ Screen Share:{" "}
                  {meeting?.allowScreenShare
                    ? "Enabled"
                    : "Disabled"}
                </p>

                <p>
                  🔴 Recording:{" "}
                  {meeting?.allowRecording
                    ? "Enabled"
                    : "Disabled"}
                </p>
              </div>
            </div>

            {/* Join */}
            <button
              type="button"
              onClick={handleJoinMeeting}
              disabled={!meeting}
              className="mt-6 w-full rounded-xl bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Join Meeting
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={handleLeave}
              className="mt-3 w-full rounded-xl border border-gray-700 px-5 py-3 font-medium text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
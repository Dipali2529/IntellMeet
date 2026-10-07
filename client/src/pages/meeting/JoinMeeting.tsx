import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMeetingByCode } from "../../services/meeting";

function JoinMeeting() {
  const navigate = useNavigate();

  const [meetingCode, setMeetingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    const code = meetingCode.trim().toUpperCase();

    if (!code) {
      setError("Please enter the meeting code.");
      return;
    }

    try {
      setLoading(true);

      const meeting = await getMeetingByCode(code);

      localStorage.setItem(
        "currentMeeting",
        JSON.stringify(meeting)
      );

      navigate("/meeting/lobby");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to join meeting."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="text-2xl font-bold text-gray-900">
          Join Meeting
        </h1>

        <p className="mt-2 text-gray-500">
          Enter the meeting code shared by the host.
        </p>

        <form
          onSubmit={handleJoinMeeting}
          className="mt-6 space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Meeting Code
            </label>

            <input
              type="text"
              value={meetingCode}
              onChange={(e) =>
                setMeetingCode(e.target.value.toUpperCase())
              }
              placeholder="INT-ABC123"
              maxLength={10}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 uppercase outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Meeting"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="w-full rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </form>

      </div>
    </div>
  );
}

export default JoinMeeting;
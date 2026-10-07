
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMeeting } from "../../services/meeting";

export default function CreateMeeting() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [allowChat, setAllowChat] = useState(true);
  const [allowScreenShare, setAllowScreenShare] = useState(true);
  const [allowRecording, setAllowRecording] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setError("");

  try {
    setLoading(true);

    const meetingData = {
      title,
      description,
      scheduledDate: date,
      scheduledTime: time,
      duration: Number(duration),
      allowChat,
      allowScreenShare,
      allowRecording,
    };

    const response = await createMeeting(meetingData);

    console.log("Meeting created:", response.meeting);

    // Store meeting information temporarily
    localStorage.setItem(
      "currentMeeting",
      JSON.stringify(response.meeting)
    );

    // Go to meeting lobby
    navigate("/meeting/lobby");
  } catch (error) {
    console.error("Create meeting error:", error);

    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("Failed to create meeting. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create Meeting
            </h1>

            <p className="text-sm text-gray-500">
              Schedule a new IntellMeet meeting
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl p-6">

          <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-8 shadow-sm"
      >
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

  {/* Basic Information */}

          {/* Basic Information */}
          <section>

            <h2 className="text-xl font-semibold text-gray-900">
              Meeting Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the basic details for your meeting.
            </p>

            <div className="mt-6 space-y-5">

              {/* Meeting Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Meeting Title
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Team Meeting"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter meeting description..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Date / Time / Duration */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                <div>
                  <label
                    htmlFor="date"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Date
                  </label>

                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="time"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Time
                  </label>

                  <input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="duration"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Duration
                  </label>

                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

              </div>

            </div>

          </section>

          {/* Meeting Settings */}
          <section className="mt-10 border-t pt-8">

            <h2 className="text-xl font-semibold text-gray-900">
              Meeting Settings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configure the features available during the meeting.
            </p>

            <div className="mt-6 space-y-5">

              {/* Chat */}
              <label className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-gray-50">

                <div>
                  <h3 className="font-medium text-gray-900">
                    Enable Meeting Chat
                  </h3>

                  <p className="text-sm text-gray-500">
                    Allow participants to send messages during the meeting.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={allowChat}
                  onChange={(e) => setAllowChat(e.target.checked)}
                  className="h-5 w-5"
                />

              </label>

              {/* Screen Share */}
              <label className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-gray-50">

                <div>
                  <h3 className="font-medium text-gray-900">
                    Screen Sharing
                  </h3>

                  <p className="text-sm text-gray-500">
                    Allow participants to share their screen.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={allowScreenShare}
                  onChange={(e) =>
                    setAllowScreenShare(e.target.checked)
                  }
                  className="h-5 w-5"
                />

              </label>

              {/* Recording */}
              <label className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-gray-50">

                <div>
                  <h3 className="font-medium text-gray-900">
                    Meeting Recording
                  </h3>

                  <p className="text-sm text-gray-500">
                    Record the meeting for future reference.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={allowRecording}
                  onChange={(e) =>
                    setAllowRecording(e.target.checked)
                  }
                  className="h-5 w-5"
                />

              </label>

            </div>

          </section>

          {/* Actions */}
          <div className="mt-10 flex justify-end gap-3 border-t pt-6">

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Meeting..." : "Create Meeting"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}
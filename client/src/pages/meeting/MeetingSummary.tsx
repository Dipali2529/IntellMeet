import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAccessToken } from "../../services/auth";

type ActionItem = {
  _id?: string;
  task: string;
  assignee: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed";
};

type MeetingDetails = {
  _id: string;
  title: string;
  meetingCode: string;
  summary?: string;
  transcript?: string;
  keyPoints?: string[];
  actionItems?: ActionItem[];
  chatMessages?: {
    senderName: string;
    message: string;
    createdAt: string;
  }[];
  recordingUrl?: string;
  recordingAvailable?: boolean;
  createdAt?: string;
};

import { API_URL as BASE_API_URL } from "../../config/api";

const API_URL = `${BASE_API_URL}/api/meetings`;

export default function MeetingSummary() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<MeetingDetails | null>(null);
  const [activeTab, setActiveTab] = useState("Summary");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMeeting = async () => {
      try {
        const token = getAccessToken();

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_URL}/${meetingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Meeting not found."
              : "Unable to load meeting history."
          );
        }

        const data = await response.json();
        setMeeting(data.meeting ?? data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load meeting."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadMeeting();
  }, [meetingId, navigate]);

  const copySummary = async () => {
    if (!meeting?.summary) return;

    try {
      await navigator.clipboard.writeText(meeting.summary);
      window.alert("Meeting summary copied.");
    } catch {
      window.alert("Could not copy summary.");
    }
  };

  const exportSummary = () => {
    if (!meeting) return;

    const content = [
      `Meeting: ${meeting.title}`,
      `Meeting Code: ${meeting.meetingCode}`,
      "",
      "AI SUMMARY",
      meeting.summary || "No summary saved.",
      "",
      "KEY POINTS",
      ...(meeting.keyPoints ?? []).map((point) => `- ${point}`),
      "",
      "TRANSCRIPT",
      meeting.transcript || "No transcript saved.",
      "",
      "ACTION ITEMS",
      ...(meeting.actionItems ?? []).map(
        (item) =>
          `- ${item.task} | Assignee: ${item.assignee || "Unassigned"} | Due: ${item.dueDate || "Not specified"} | Status: ${item.status}`
      ),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${meeting.title.replace(/[^a-z0-9-_]/gi, "_")}-summary.txt`;
    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-8 text-slate-600">Loading meeting history...</div>;
  }

  if (error || !meeting) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <button onClick={() => navigate("/dashboard")} className="mb-6 text-blue-600">
          ← Back to Dashboard
        </button>
        <p className="text-red-600">{error || "Meeting not found."}</p>
      </main>
    );
  }

  const tabs = ["Summary", "Action Items", "Transcript", "Chat", "Recording"];

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Dashboard
        </button>

        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-blue-600">
                MEETING HISTORY
              </p>
              <h1 className="text-2xl font-bold">{meeting.title}</h1>
              <p className="mt-2 text-sm text-slate-500">
                Meeting code: {meeting.meetingCode}
              </p>
              {meeting.createdAt && (
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(meeting.createdAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void copySummary()}
                disabled={!meeting.summary}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                Copy Summary
              </button>
              <button
                onClick={exportSummary}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Export Summary
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <section className="min-h-64 py-6">
            {activeTab === "Summary" && (
              <div>
                <h2 className="mb-3 text-lg font-bold">AI Meeting Summary</h2>
                {meeting.summary ? (
                  <p className="whitespace-pre-wrap leading-7 text-slate-700">
                    {meeting.summary}
                  </p>
                ) : (
                  <p className="text-slate-500">
                    No AI summary has been saved for this meeting yet.
                  </p>
                )}

                {!!meeting.keyPoints?.length && (
                  <>
                    <h3 className="mb-3 mt-6 font-semibold">Key Points</h3>
                    <ul className="list-disc space-y-2 pl-5 text-slate-700">
                      {meeting.keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {activeTab === "Action Items" && (
              <div>
                <h2 className="mb-4 text-lg font-bold">AI Action Items</h2>
                {!meeting.actionItems?.length ? (
                  <p className="text-slate-500">No action items saved.</p>
                ) : (
                  <div className="space-y-3">
                    {meeting.actionItems.map((item, index) => (
                      <article
                        key={item._id ?? index}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <h3 className="font-semibold">{item.task}</h3>
                        <p className="mt-2 text-sm text-slate-600">
                          Assignee: {item.assignee || "Unassigned"}
                        </p>
                        <p className="text-sm text-slate-600">
                          Due date: {item.dueDate || "Not specified"}
                        </p>
                        <p className="mt-2 text-sm">
                          Status: <strong>{item.status}</strong>
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Transcript" && (
              <div>
                <h2 className="mb-3 text-lg font-bold">Meeting Transcript</h2>
                <p className="whitespace-pre-wrap leading-7 text-slate-700">
                  {meeting.transcript || "No transcript saved for this meeting."}
                </p>
              </div>
            )}

            {activeTab === "Chat" && (
              <div>
                <h2 className="mb-3 text-lg font-bold">Meeting Chat</h2>
                {!meeting.chatMessages?.length ? (
                  <p className="text-slate-500">
                    No saved chat messages are available.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {meeting.chatMessages.map((chat, index) => (
                      <article key={index} className="rounded-lg bg-slate-50 p-3">
                        <p className="font-semibold">{chat.senderName}</p>
                        <p className="mt-1">{chat.message}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(chat.createdAt).toLocaleString()}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Recording" && (
              <div>
                <h2 className="mb-3 text-lg font-bold">Meeting Recording</h2>
                {meeting.recordingAvailable && meeting.recordingUrl ? (
                  <video
                    controls
                    className="w-full rounded-xl bg-black"
                    src={meeting.recordingUrl}
                  />
                ) : (
                  <p className="text-slate-500">
                    No saved recording is available for this meeting.
                  </p>
                )}
              </div>
            )}
          </section>
        </header>
      </div>
    </main>
  );
}

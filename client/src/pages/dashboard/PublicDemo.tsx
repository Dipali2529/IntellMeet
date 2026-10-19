
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  CalendarDays,
  Clock3,
  RefreshCw,
  LogIn,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Copy,
} from "lucide-react";
import { API_URL as BASE_API_URL } from "../../config/api";

interface PublicMeeting {
  _id: string;
  title: string;
  description?: string;
  duration?: number;
  scheduledDate?: string;
  scheduledTime?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  meetingCode?: string;
}

function PublicDemo() {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState<PublicMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<PublicMeeting | null>(null);

  const loadMeetings = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const baseUrl = BASE_API_URL.replace(/\/+$/, "");
      const response = await fetch(
        `${baseUrl}/meetings/public-demo`
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load public meetings (${response.status}).`
        );
      }

      const data = await response.json();

      setMeetings(
        Array.isArray(data.meetings) ? data.meetings : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the meetings service."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadMeetings();
  }, []);

  const formatDate = (meeting: PublicMeeting) => {
    if (meeting.scheduledDate) {
      const date = new Date(
        `${meeting.scheduledDate.slice(0, 10)}T${
          meeting.scheduledTime || "00:00"
        }`
      );

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    if (meeting.createdAt) {
      const date = new Date(meeting.createdAt);

      if (!Number.isNaN(date.getTime())) {
        return `Created ${date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      }
    }

    return "Date not available";
  };

  const scrollToMeetings = () => {
    document
      .getElementById("public-meetings")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openProtectedSection = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 px-4 py-6 text-slate-300 md:flex">
          <div className="mb-10 flex items-center gap-3 px-3">
           <div className="flex w-full items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-left font-medium text-white">
              <Video size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide">
                IntellMeet
              </h1>
              <p className="text-xs text-slate-400">
                Meetings made smarter
              </p>
            </div>
          </div>

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            <button
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="flex w-full items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-left font-medium text-white"
            >
              <LayoutDashboard size={19} />
              Dashboard
            </button>

            <button
              onClick={scrollToMeetings}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Video size={19} />
              Meetings
            </button>

            <button
              onClick={scrollToMeetings}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <CalendarDays size={19} />
              Upcoming
            </button>

            <button
              onClick={openProtectedSection}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <BriefcaseBusiness size={19} />
              Workspace
              <LogIn size={14} className="ml-auto text-slate-500" />
            </button>

            <button
              onClick={openProtectedSection}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Users size={19} />
              Teams
              <LogIn size={14} className="ml-auto text-slate-500" />
            </button>
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <Sparkles size={21} />
            </div>
            <h3 className="font-semibold">AI-powered meetings</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Discover how IntellMeet helps teams collaborate.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck size={15} />
              Public demo access
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <header className="flex min-h-[76px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
            <div>
              <p className="text-sm text-slate-500">
                IntellMeet / Public workspace
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Demo Dashboard
              </h2>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <LogIn size={17} />
              Sign in
            </button>
          </header>

          {/* Mobile navigation */}
          <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 md:hidden">
            <button
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
            >
              Dashboard
            </button>
            <button
              onClick={scrollToMeetings}
              className="shrink-0 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Meetings
            </button>
            <button
              onClick={openProtectedSection}
              className="shrink-0 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Workspace
            </button>
            <button
              onClick={openProtectedSection}
              className="shrink-0 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Teams
            </button>
          </nav>

          <main className="mx-auto max-w-[1600px] space-y-8 p-5 sm:p-8">
        
           
                {/* Welcome heading */}
               
        {/* Welcome heading */}
        <section>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome to IntellMeet
        </h2>
        <p className="mt-2 text-base text-slate-500">
            Create a meeting, join with a meeting code, or explore public meetings without logging in.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
                <button
                type="button"
                onClick={() =>
                    navigate("/meeting/create", {
                    state: { demoMode: true },
                    })
                }
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                <Video size={18} />
                Create Meeting
                </button>

            <button
                type="button"
                onClick={() =>
                    navigate("/meeting/join", {
                    state: { demoMode: true },
                    })
                }
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                <LogIn size={18} />
                Join Meeting
                </button>
            </div>
            </section>


            {/* Live statistics */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Public meetings
                    </p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {loading ? "..." : meetings.length}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Approved for public viewing
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Video size={23} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Meeting duration
                    </p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {loading
                        ? "..."
                        : meetings.length
                          ? `${meetings.reduce(
                              (sum, meeting) =>
                                sum + (meeting.duration || 0),
                              0
                            )} min`
                          : "0 min"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Combined scheduled duration
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Clock3 size={23} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:col-span-2 xl:col-span-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Access
                    </p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      Public
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      No login needed to explore
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck size={23} />
                  </div>
                </div>
              </div>
            </section>

            {/* Meeting list */}
            <section
              id="public-meetings"
              className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                    Public Meetings
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Meetings approved for display in the public demo.
                  </p>
                </div>

                <button
                  onClick={() => void loadMeetings(true)}
                  disabled={loading || refreshing}
                  className="flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 sm:self-center"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">
                    Could not load public meetings
                  </p>
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                  <p className="mt-2 text-xs text-red-600">
                    Check that the backend is running and the API URL is configured correctly.
                  </p>
                  <button
                    onClick={() => void loadMeetings(true)}
                    className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Try again
                  </button>
                </div>
              )}

              {loading && (
                <div className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="h-10 w-10 rounded-xl bg-slate-200" />
                      <div className="mt-5 h-4 w-3/4 rounded bg-slate-200" />
                      <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              )}

              {!loading && !error && meetings.length === 0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Video size={27} />
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-slate-900">
                    No public meetings yet
                  </h4>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    No meetings have been approved for public display.
                    Sign in to manage your meetings, or try refreshing later.
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Sign in
                  </button>
                </div>
              )}

              {!loading && !error && meetings.length > 0 && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {meetings.map((meeting) => (
                    <article
                      key={meeting._id}
                      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Video size={22} />
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Public
                        </span>
                      </div>

                      <h4 className="mt-5 break-words text-lg font-bold text-slate-900">
                        {meeting.title}
                      </h4>

                      <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-500">
                        {meeting.description ||
                          "Explore this approved IntellMeet meeting record."}
                      </p>

                      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                        <p className="flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays size={16} className="shrink-0 text-blue-500" />
                          {formatDate(meeting)}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock3 size={16} className="shrink-0 text-blue-500" />
                          {meeting.duration || 60} minutes
                        </p>
                      </div>

                      <button
                        onClick={() => setSelected(meeting)}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                      >
                        View details
                        <ArrowRight size={16} />
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <footer className="border-t border-slate-200 py-5 text-center text-xs leading-6 text-slate-500">
              IntellMeet Public Demo
              <p>Only approved meeting details are shown here.</p>
            </footer>
          </main>
        </div>
      </div>

      {/* Public meeting details */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="public-meeting-title"
          onClick={() => setSelected(null)}
        >
          <section
            className="my-6 w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Video size={24} />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Public meeting
                  </span>
                  <h3
                    id="public-meeting-title"
                    className="mt-2 break-words text-xl font-bold text-slate-900"
                  >
                    {selected.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                aria-label="Close meeting details"
                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <h4 className="font-semibold text-slate-900">Description</h4>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {selected.description ||
                  "No public description is available for this meeting."}
              </p>
            </div>
            
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-semibold text-slate-700">
                Meeting Code
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
                <code className="flex-1 rounded-lg border border-blue-100 bg-white px-4 py-3 text-lg font-bold tracking-wider text-blue-700">
                {selected.meetingCode || "Code unavailable"}
                </code>

                <button
                type="button"
                disabled={!selected.meetingCode}
                onClick={async () => {
                    if (!selected.meetingCode) return;

                    try {
                    await navigator.clipboard.writeText(selected.meetingCode);
                    alert("Meeting code copied!");
                    } catch {
                    alert("Unable to copy the code. Please copy it manually.");
                    }
                }}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                <Copy size={17} />
                Copy Code
                </button>
            </div>

            <button
                type="button"
                disabled={!selected.meetingCode}
                onClick={() =>
                navigate(
                    `/meeting/join?code=${encodeURIComponent(selected.meetingCode || "")}`,
                    { state: { demoMode: true } }
                )
                }
                className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Join This Meeting
            </button>
            </div>


            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <CalendarDays size={19} className="text-blue-600" />
                <p className="mt-2 text-xs text-slate-500">Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDate(selected)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <Clock3 size={19} className="text-blue-600" />
                <p className="mt-2 text-xs text-slate-500">Duration</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selected.duration || 60} minutes
                </p>
              </div>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              This page displays public meeting details only. Sign in to
              access account-specific meetings and collaboration tools.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to dashboard
              </button>
              <button
                onClick={() => navigate("/login")}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Sign in
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default PublicDemo;

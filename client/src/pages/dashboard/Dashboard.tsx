
import { useEffect, useState } from "react";
import {
  Video,
  BriefcaseBusiness,
  LayoutDashboard,
  Users,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../services/auth";
import {
  getMyMeetings,
  type Meeting,
} from "../../services/meeting";
import NotificationCenter from "../../components/common/NotificationCenter";
import ThemeSwitcher from "../../components/common/ThemeSwitcher";
type MeetingFilter = "All" | "Upcoming" | "Past";

function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [meetingFilter, setMeetingFilter] =
    useState<MeetingFilter>("All");
  const [copiedCode, setCopiedCode] = useState("");
  //const [isProfileOpen, setIsProfileOpen] = useState(false);

  const loadMeetings = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await getMyMeetings();
      setMeetings(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load meetings."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadMeetings();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateMeeting = () => {
    navigate("/meeting/create");
  };

  const handleJoinMeeting = () => {
    navigate("/meeting/join");
  };

  const getMeetingDate = (meeting: Meeting): Date | null => {
    if (!meeting.scheduledDate) return null;

    const dateText = meeting.scheduledDate.slice(0, 10);
    const timeText = meeting.scheduledTime || "00:00";

    let date = new Date(`${dateText}T${timeText}`);

    if (Number.isNaN(date.getTime())) {
      date = new Date(`${dateText} ${timeText}`);
    }

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const isUpcoming = (meeting: Meeting) => {
    const date = getMeetingDate(meeting);
    return date !== null && date.getTime() > Date.now();
  };

  const upcomingCount = meetings.filter(isUpcoming).length;

  const filteredMeetings = meetings.filter((meeting) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      meeting.title.toLowerCase().includes(search) ||
      meeting.meetingCode.toLowerCase().includes(search);

    const matchesFilter =
      meetingFilter === "All" ||
      (meetingFilter === "Upcoming" && isUpcoming(meeting)) ||
      (meetingFilter === "Past" && !isUpcoming(meeting));

    return matchesSearch && matchesFilter;
  });

  const formatMeetingDate = (meeting: Meeting) => {
    const date = getMeetingDate(meeting);

    if (!date) return "Date not scheduled";

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatMeetingTime = (meeting: Meeting) => {
    const date = getMeetingDate(meeting);

    if (!date) {
      return meeting.scheduledTime || "Time not scheduled";
    }

    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 1800);
    } catch {
      setError(
        "Unable to copy the meeting code. Please copy it manually."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 px-4 py-6 text-white md:flex">
          <div className="mb-10 flex items-center gap-3 px-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-950/30">
              <Video size={23} className="text-white" />
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

          <nav className="space-y-2">
            <button
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="flex w-full items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-left font-medium text-white shadow-lg shadow-blue-950/30"
            >
              <LayoutDashboard size={19} />
              Dashboard
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("previous-meetings")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Video size={19} />
              Meetings
            </button>

            <button
              onClick={() => {
                setMeetingFilter("Upcoming");
                document
                  .getElementById("previous-meetings")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span>◷</span>
              Upcoming
            </button>

            <button
              onClick={() => navigate("/workspace")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <BriefcaseBusiness size={20} />
              Workspace
            </button>

            <button
              onClick={() => navigate("/teams")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Users size={20} />
              Teams
            </button>
          </nav>

          <div className="mt-auto border-t border-slate-800 px-3 pt-6">
            <p className="text-sm font-medium text-slate-300">
              Better Meetings.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Smarter Teams.
            </p>
          </div>
        </aside>

        {/* Main dashboard */}
        <div className="min-w-0 flex-1">
          {/* Header */}
         <header className="relative z-40 flex min-h-[76px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-blue-600">
                IntellMeet
              </span>
              <span>/</span>
              <span>Dashboard</span>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <NotificationCenter />

              <ThemeSwitcher />

              <div className="group relative">
                <button
                  type="button"
                  aria-label="Open profile menu"
                  className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
                    {(user?.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <span className="hidden text-left sm:block">
                    <span className="block max-w-40 truncate text-sm font-semibold text-slate-800">
                      {user?.name || "User"}
                    </span>
                    <span className="block max-w-40 truncate text-xs text-slate-500">
                      {user?.email || ""}
                    </span>
                  </span>

                  <ChevronDown
                    size={16}
                    className="hidden text-slate-500 sm:block"
                  />
                </button>

                <div className="invisible absolute right-0 top-full z-50 mt-2 w-64 translate-y-1 overflow-hidden rounded-xl border border-slate-200 bg-white opacity-0 shadow-xl transition-all group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate font-semibold text-slate-900">
                      {user?.name || "User"}
                    </p>
                    <p className="break-all text-sm text-slate-500">
                      {user?.email || ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard content */}
          <main className="mx-auto max-w-[1600px] space-y-8 p-5 sm:p-8">
            <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Your workspace
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Good to see you, {user?.name || "User"} 👋
                </h2>
                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                  Manage your meetings and collaborate with your team.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCreateMeeting}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  + Create Meeting
                </button>

                <button
                  onClick={handleJoinMeeting}
                  className="rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Join Meeting
                </button>
              </div>
            </section>

            {/* Statistics */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total Meetings
                    </p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {loading ? "..." : meetings.length}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Meetings created by you
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                    ▣
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Upcoming Meetings
                    </p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {loading ? "..." : upcomingCount}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Scheduled for the future
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
                    ◷
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md sm:col-span-2 xl:col-span-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Team Members
                    </p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      —
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Team member statistics are not connected yet.
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-xl text-violet-600">
                    ♧
                  </div>
                </div>
              </div>
            </section>

            {/* Previous meetings */}
            <section
              id="previous-meetings"
              className="scroll-mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    Previous Meetings
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    View and manage meetings created by your account.
                  </p>
                </div>

                <button
                  onClick={() => void loadMeetings(true)}
                  disabled={loading || refreshing}
                  className="self-start rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 xl:self-center"
                >
                  {refreshing ? "Refreshing..." : "↻ Refresh"}
                </button>
              </div>

              {/* Search and filter */}
              <div className="mt-6 flex flex-col gap-3 lg:flex-row">
                <div className="relative min-w-0 flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                    ⌕
                  </span>
                  <input
                    type="text"
                    placeholder="Search by meeting title or code..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <select
                  value={meetingFilter}
                  onChange={(event) =>
                    setMeetingFilter(
                      event.target.value as MeetingFilter
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="All">All Meetings</option>
                  <option value="Upcoming">Upcoming Meetings</option>
                  <option value="Past">Past Meetings</option>
                </select>
              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-semibold">
                    Unable to load meetings
                  </p>
                  <p className="mt-1">{error}</p>
                  <button
                    onClick={() => void loadMeetings(true)}
                    className="mt-3 font-semibold underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {loading && (
                <div className="py-14 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                  <p className="mt-4 text-sm text-slate-500">
                    Loading your meetings...
                  </p>
                </div>
              )}

              {!loading &&
                !error &&
                filteredMeetings.length === 0 && (
                  <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                      ▣
                    </div>
                    <p className="mt-4 font-semibold text-slate-800">
                      {meetings.length === 0
                        ? "No meetings found"
                        : "No meetings match your search"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {meetings.length === 0
                        ? "Create your first meeting to see it listed here."
                        : "Try another search term or choose All Meetings."}
                    </p>
                    {meetings.length === 0 && (
                      <button
                        onClick={handleCreateMeeting}
                        className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        + Create Meeting
                      </button>
                    )}
                  </div>
                )}

              {/* Meeting list */}
              {!loading &&
                !error &&
                filteredMeetings.length > 0 && (
                  <div className="mt-6 divide-y divide-slate-100">
                    {filteredMeetings.map((meeting) => {
                      const upcoming = isUpcoming(meeting);

                      return (
                        <article
                          key={meeting._id}
                          className="flex flex-col gap-5 py-5 first:pt-2 last:pb-2 xl:flex-row xl:items-center xl:justify-between"
                        >
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600 sm:flex">
                              ▣
                            </div>

                            <div className="min-w-0">
                              <h4 className="break-words font-semibold text-slate-900">
                                {meeting.title}
                              </h4>
                              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                {meeting.description ||
                                  "No description provided."}
                              </p>
                              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                                <span>
                                  ▦ {formatMeetingDate(meeting)}
                                </span>
                                <span>
                                  ◷ {formatMeetingTime(meeting)}
                                </span>
                                {meeting.duration && (
                                  <span>
                                    {meeting.duration} minutes
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                            <div className="mr-1">
                              <p className="mb-1 text-xs text-slate-400">
                                Meeting Code
                              </p>
                              <span className="rounded-lg bg-blue-50 px-3 py-2 font-mono text-sm font-semibold text-blue-700">
                                {meeting.meetingCode}
                              </span>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                upcoming
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {upcoming ? "Upcoming" : "Past"}
                            </span>

                            <button
                              onClick={() =>
                                void handleCopyCode(meeting.meetingCode)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              {copiedCode === meeting.meetingCode
                                ? "✓ Copied"
                                : "Copy code"}
                            </button>

                            <button
                              onClick={() => {
                                void handleCopyCode(
                                  meeting.meetingCode
                                );
                                navigate(
                                  `/meeting/join?code=${encodeURIComponent(
                                    meeting.meetingCode
                                  )}`
                                );
                              }}
                              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                              Join →
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

              {!loading &&
                !error &&
                filteredMeetings.length > 0 && (
                  <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    Showing {filteredMeetings.length} of{" "}
                    {meetings.length} meetings
                  </div>
                )}
            </section>

            <footer className="pb-2 text-center text-xs text-slate-400">
              IntellMeet · AI-Powered Meeting & Collaboration Platform
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../services/auth";

function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              IntellMeet
            </h1>

            <p className="text-sm text-gray-500">
              AI-Powered Meeting & Collaboration Platform
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">
                {user?.name || "User"}
              </p>

              <p className="text-sm text-gray-500">
                {user?.email || ""}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name || "User"} 👋
          </h2>

          <p className="mt-2 text-gray-600">
            Manage your meetings and collaborate with your team.
          </p>
        </div>

        {/* Create Meeting Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Meetings
            </h3>

            <p className="mt-1 text-gray-500">
              Create a new meeting or join an existing meeting.
            </p>
          </div>

          <div className="flex gap-3">
            
            <button
              onClick={handleCreateMeeting}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              + Create Meeting
            </button>

            <button
              onClick={handleJoinMeeting}
              className="rounded-lg border border-blue-600 px-6 py-3 font-medium text-blue-600 transition hover:bg-blue-50"
            >
              Join Meeting
            </button>

          </div>
        </div>
</div>

        {/* Quick Stats */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Meetings</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Upcoming Meetings</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Team Members</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
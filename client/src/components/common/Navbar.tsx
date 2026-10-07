export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">

      {/* Logo / Application Name */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          IntellMeet
        </h1>

        <p className="text-sm text-gray-500">
          AI-Powered Meeting Platform
        </p>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">

        <a
          href="/dashboard"
          className="text-sm font-medium text-gray-700 hover:text-black"
        >
          Dashboard
        </a>

        <a
          href="/meetings"
          className="text-sm font-medium text-gray-700 hover:text-black"
        >
          Meetings
        </a>

        <a
          href="/projects"
          className="text-sm font-medium text-gray-700 hover:text-black"
        >
          Projects
        </a>

        <button
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Logout
        </button>

      </div>

    </nav>
  );
}
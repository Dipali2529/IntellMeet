

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/dashboard/Dashboard";
import CreateMeeting from "./pages/meeting/CreateMeeting";
import MeetingLobby from "./pages/meeting/MeetingLobby";
import MeetingRoom from "./pages/meeting/MeetingRoom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import JoinMeeting from "./pages/meeting/JoinMeeting";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import Workspace from "./pages/dashboard/Workspace";
import Team from "./pages/Team/Team";


function App() {
  return (
<BrowserRouter>
 
  <Routes>

        {/* Authentication */}
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />


          {/* ==================== */}
                  {/* Protected Routes     */}
                  {/* ==================== */}

         <Route element={<ProtectedRoute />}>
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/teams" element={<Team />} />
        </Route>
        {/* Application */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/meeting/create"
          element={<CreateMeeting />}
        />

        <Route
          path="/meeting/lobby"
          element={<MeetingLobby />}
        />

        <Route
          path="/meeting/room"
          element={<MeetingRoom />}
        />
        <Route path="/meeting/join" element={<JoinMeeting />} />

      </Routes>
    </BrowserRouter>
  
  );
}

export default App;





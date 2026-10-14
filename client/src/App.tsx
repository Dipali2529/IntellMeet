import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAccessToken } from "./services/auth";
import { socket } from "./services/socket";

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



type AppNotification = {
  type: string;
  title: string;
  message: string;
  taskId?: string;
  createdAt: string;
  read: boolean;
};

function NotificationCenter() {
  const location = useLocation();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      return;
    }

    socket.auth = { token };
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    if (!socket.connected) {
      socket.connect();
}
   
    const handleNotification = (notification: AppNotification) => {
  setNotifications((current) => [notification, ...current]);
};

    socket.on("notification:new", handleNotification);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [location.pathname]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 20,
        zIndex: 1000,
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        style={{ padding: "10px 14px", cursor: "pointer" }}
      >
        🔔 Notifications ({unreadCount})
      </button>

      {isOpen && (
        <div
          style={{
            background: "white",
            color: "#222",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
            marginTop: 8,
            width: 300,
            maxHeight: 350,
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <h3>Notifications</h3>

          {notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={`${notification.taskId ?? notification.type}-${notification.createdAt}-${index}`}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <small>
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
              </div>
            ))
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setNotifications((current) =>
                  current.map((item) => ({ ...item, read: true }))
                )
              }
            >
              Mark all as read
            </button>
          )}
        </div>
      )}
    </div>
  );
}
function App() {
  return (
<BrowserRouter>
  <NotificationCenter />
  <Routes>

        {/* Authentication */}
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />


          {/* ==================== */}
                  {/* Protected Routes     */}
                  {/* ==================== */}

         <Route element={<ProtectedRoute />}></Route>
        <Route path="/workspace" element={<Workspace />} />
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




// import { useState } from 'react'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App


import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getAccessToken } from "../../services/auth";
import { socket } from "../../services/socket";

type AppNotification = {
  type: string;
  title: string;
  message: string;
  taskId?: string;
  createdAt: string;
  read: boolean;
};

export default function NotificationCenter() {
  const location = useLocation();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    socket.auth = { token };

    const handleNotification = (notification: AppNotification) => {
      setNotifications((current) => [notification, ...current]);
    };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("notification:new", handleNotification);
        socket.on("connect", () => {
    console.log("NOTIFICATION SOCKET CONNECTED:", socket.id);
    });

    socket.on("connect_error", (error) => {
    console.error("NOTIFICATION SOCKET ERROR:", error.message);
    });

    console.log("SOCKET CONNECTED NOW:", socket.connected);
    console.log("CURRENT SOCKET ID:", socket.id);

    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [location.pathname]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="relative flex shrink-0 items-center">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
      >
        <Bell size={21} />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-[100] mt-3 w-[min(320px,calc(100vw-32px))] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  setNotifications((current) =>
                    current.map((item) => ({ ...item, read: true }))
                  )
                }
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                <CheckCheck size={15} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No notifications yet.
              </p>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={`${notification.taskId ?? notification.type}-${notification.createdAt}-${index}`}
                  onClick={() =>
                    setNotifications((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, read: true } : item
                      )
                    )
                  }
                  className="border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                >
                  <div className="flex items-start gap-2">
                    {!notification.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {notification.title}
                      </p>
                      <p className="mt-1 break-words text-sm text-slate-600">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

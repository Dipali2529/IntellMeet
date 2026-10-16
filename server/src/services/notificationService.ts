
import { Server } from "socket.io";

let notificationServer: Server | null = null;

export function setNotificationServer(io: Server): void {
  notificationServer = io;
}

export function notifyUser(
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    taskId?: string;
    createdAt: string;
    read: boolean;
  }
): void {
  if (!notificationServer) {
    console.error("Notification server is not initialized.");
    return;
  }

  console.log("Sending notification to:", `user:${userId}`);

  notificationServer
    .to(`user:${userId}`)
    .emit("notification:new", notification);
}

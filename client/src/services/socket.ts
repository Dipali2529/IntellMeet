
import { io } from "socket.io-client";
import { getAccessToken } from "./auth";

const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  auth: (callback) => {
    callback({
      token: getAccessToken(),
    });
  },
});
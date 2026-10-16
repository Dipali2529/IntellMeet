
import { io } from "socket.io-client";
import { getAccessToken } from "./auth";
import { SOCKET_URL } from "../config/api";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  auth: (callback) => {
    callback({
      token: getAccessToken(),
    });
  },
});

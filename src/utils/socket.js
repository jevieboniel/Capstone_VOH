// src/utils/socket.js
import { io } from "socket.io-client";

const API_ORIGIN = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export function createSocket(token) {
  return io(API_ORIGIN, {
    transports: ["websocket"],
    auth: { token },
    autoConnect: true,
  });
}

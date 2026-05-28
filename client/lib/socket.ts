import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:5000", {
      transports: ["websocket"],
      withCredentials: true
    });
  }
  return socket;
}

import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";

let io: Server | undefined;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: env.CLIENT_URL, credentials: true }
  });

  io.on("connection", (socket) => {
    socket.on("assignment:join", (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
    });
  });

  return io;
}

export function emitAssignment(assignmentId: string, event: string, payload: unknown) {
  io?.to(`assignment:${assignmentId}`).emit(event, payload);
}

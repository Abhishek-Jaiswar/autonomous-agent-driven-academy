import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { logger } from "../utils/logger.js";

// Global Socket.io Server instance placeholder
export let io: Server | null = null;

/**
 * Initializes the Socket.io server on top of the Express HTTP server.
 */
export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Restrict this in production to match frontend domain
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`[Socket] Client connected: ${socket.id}`);

    // Join a specific learning session room
    socket.on("join-session", (sessionId: string) => {
      if (!sessionId) return;
      socket.join(sessionId);
      logger.info(`[Socket] Client ${socket.id} joined session room: ${sessionId}`);
    });

    // Leave a learning session room
    socket.on("leave-session", (sessionId: string) => {
      if (!sessionId) return;
      socket.leave(sessionId);
      logger.info(`[Socket] Client ${socket.id} left session room: ${sessionId}`);
    });

    socket.on("disconnect", () => {
      logger.info(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Emits an event to all sockets joined to a specific session room.
 */
export function emitToSession(sessionId: string, eventName: string, payload: unknown) {
  if (!io) {
    logger.warn(`[Socket] Attempted to emit event ${eventName} to session ${sessionId} before initialization`);
    return;
  }
  
  io.to(sessionId).emit(eventName, payload);
}

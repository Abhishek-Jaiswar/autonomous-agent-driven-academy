import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { logger } from "../utils/logger.js";
import { runSchoolGraph } from "../graph/school.graph.js";
import { profileService } from "../modules/profile/profile.service.js";

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

    // Start the dynamic counselor interview
    socket.on("start-interview", async ({ goalId }: { goalId: string }) => {
      try {
        if (!goalId) return;
        
        logger.info(`[Socket] Starting interview Q&A for goalId: ${goalId}`);
        
        // Fetch goal details
        const goal = await profileService.getGoalProfile(goalId);

        if (!goal || !goal.profile) {
          socket.emit("interview-error", { message: "Goal or Profile not found" });
          return;
        }

        const profile = goal.profile;

        // If interview has already started, resume or push current question
        if (profile.counselorQuestions.length > 0) {
          const chat = profile.interviewChat as any[];
          const lastMsg = chat[chat.length - 1];
          
          socket.emit("interview-question", {
            question: lastMsg.role === "assistant" ? lastMsg.content : "Resume interview...",
            questionIndex: Math.floor(chat.length / 2),
            totalQuestions: profile.counselorQuestions.length,
          });
          return;
        }

        // Trigger dynamic Counselor Graph (Turn 0: Generate Qs)
        const finalState = await runSchoolGraph({
          goalId,
          goalText: goal.goalText,
          category: goal.category,
          durationDays: goal.durationDays,
          counselorQuestions: [],
          currentQuestionIndex: 0,
          isComplete: false,
        });

        // Save generated questions & initial assistant message to DB
        await profileService.initializeCounselorQuestions(
          goalId,
          finalState.counselorQuestions,
          finalState.conversation
        );

        // Emit first question to the room
        socket.emit("interview-question", {
          question: finalState.conversation[0]?.content || "",
          questionIndex: 0,
          totalQuestions: finalState.counselorQuestions.length,
        });

        logger.info(`[Socket] Dispatched first dynamic question for goalId: ${goalId}`);
      } catch (error) {
        logger.error("Error in start-interview socket listener", {
          error: error instanceof Error ? error.message : String(error),
        });
        socket.emit("interview-error", { message: "Failed to initialize interview" });
      }
    });

    // Handle user answering a counselor question
    socket.on("submit-answer", async ({ goalId, answer }: { goalId: string; answer: string }) => {
      try {
        if (!goalId || !answer) return;

        logger.info(`[Socket] Received answer for goalId: ${goalId} — "${answer}"`);

        // Fetch current session details
        const goal = await profileService.getGoalProfile(goalId);

        if (!goal || !goal.profile) {
          socket.emit("interview-error", { message: "Goal or Profile not found" });
          return;
        }

        const profile = goal.profile;
        const currentChat = profile.interviewChat as any[];
        
        // Calculate current index based on chat turns (user/assistant pairs)
        const currentIndex = Math.floor(currentChat.length / 2);

        // Run the Counselor Graph turn
        const finalState = await runSchoolGraph({
          goalId,
          goalText: goal.goalText,
          category: goal.category,
          durationDays: goal.durationDays,
          counselorQuestions: profile.counselorQuestions,
          currentQuestionIndex: currentIndex,
          lastUserResponse: answer,
          conversation: currentChat,
          isComplete: false,
        });

        // Save updated chat logs to DB
        await profileService.updateChatLog(goalId, finalState.conversation);

        // If completed, the Profiler has already triggered the next background queue task
        if (finalState.isComplete) {
          socket.emit("interview-completed", { goalId });
          logger.info(`[Socket] Counselor interview marked complete for goalId: ${goalId}`);
          return;
        }

        // Otherwise, emit the next question
        const nextMsg = finalState.conversation[finalState.conversation.length - 1];
        socket.emit("interview-question", {
          question: nextMsg?.content || "",
          questionIndex: finalState.currentQuestionIndex,
          totalQuestions: finalState.counselorQuestions.length,
        });

        logger.info(`[Socket] Dispatched next question for goalId: ${goalId}`);
      } catch (error) {
        logger.error("Error in submit-answer socket listener", {
          error: error instanceof Error ? error.message : String(error),
        });
        socket.emit("interview-error", { message: "Failed to submit answer" });
      }
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

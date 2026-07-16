import axios from "axios";
import type {
  ApiError,
  ApiSuccess,
  InterviewState,
  StartInterviewResponse,
} from "./types";

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handleAxiosError(error: any): ApiError {
  if (axios.isAxiosError(error) && error.response) {
    return {
      success: false,
      error: error.response.data?.error ?? "Request failed",
      details: error.response.data?.details,
    };
  }
  return {
    success: false,
    error: error.message ?? "An unexpected network error occurred",
  };
}

// ─── Interview API ────────────────────────────────────────────────────────────

/**
 * Starts a new interview session and returns the first question.
 * POST /interview/start
 */
export async function startInterview(
  role: string,
  candidateIntro?: string
): Promise<ApiSuccess<StartInterviewResponse> | ApiError> {
  try {
    const res = await api.post<ApiSuccess<StartInterviewResponse>>(
      "/interview/start",
      { role, candidateIntro }
    );
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
}

/**
 * Retrieves the full current state of an interview session.
 * GET /interview/:id
 */
export async function getInterview(
  interviewId: string
): Promise<ApiSuccess<InterviewState> | ApiError> {
  try {
    const res = await api.get<ApiSuccess<InterviewState>>(
      `/interview/${interviewId}`
    );
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
}

interface SubmitAnswerResponse {
  interviewId: string;
  question: string;
  questionCount: number;
}

/**
 * Submits the candidate's answer and retrieves the next question.
 * POST /interview/message
 */
export async function submitAnswer(
  interviewId: string,
  answer: string
): Promise<ApiSuccess<SubmitAnswerResponse> | ApiError> {
  try {
    const res = await api.post<ApiSuccess<SubmitAnswerResponse>>(
      "/interview/message",
      { interviewId, answer }
    );
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
}

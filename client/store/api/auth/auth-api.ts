import { baseApi } from "../baseApi";
import type {
  ApiSuccess,
  CounselorInterviewResponse,
  LearnerProfileReview,
} from "@/lib/types";

interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  email: string;
}

interface StartCurriculumRequest {
  goalText: string;
  category: "exam_prep" | "job_project" | "school_subject";
  durationDays: number;
}

interface StartCurriculumResponse {
  goalId: string;
  curriculumId: string;
  message: string;
}

interface StartInterviewRequest {
  goalId: string;
}

interface SubmitAnswerRequest {
  goalId: string;
  answer: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<ApiSuccess<AuthUser>, AuthCredentials>({
      query: (credentials) => ({
        url: "/auth/signup",
        method: "POST",
        body: credentials,
      }),
    }),

    login: builder.mutation<ApiSuccess<{ user: AuthUser }>, AuthCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    getMe: builder.query<ApiSuccess<AuthUser>, void>({
      query: () => "/auth/me",
    }),

    logout: builder.mutation<any, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),

    startCurriculum: builder.mutation<
      ApiSuccess<StartCurriculumResponse>,
      StartCurriculumRequest
    >({
      query: (payload) => ({
        url: "/curriculum/start",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Curriculum"],
    }),

    getCurriculum: builder.query<ApiSuccess<any>, string | null>({
      query: (goalId) => `/curriculum/${goalId}`,
      providesTags: (result, error, goalId) =>
        goalId ? [{ type: "Curriculum", id: goalId }] : ["Curriculum"],
    }),

    startCounselorInterview: builder.mutation<
      ApiSuccess<CounselorInterviewResponse>,
      StartInterviewRequest
    >({
      query: (payload) => ({
        url: "/curriculum/interview/start",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Curriculum"],
    }),

    submitCounselorAnswer: builder.mutation<
      ApiSuccess<CounselorInterviewResponse & { profile?: LearnerProfileReview }>,
      SubmitAnswerRequest
    >({
      query: (payload) => ({
        url: "/curriculum/interview/answer",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Curriculum"],
    }),

    getCounselorInterview: builder.query<ApiSuccess<CounselorInterviewResponse>, string>({
      query: (goalId) => `/curriculum/interview/${goalId}`,
      providesTags: (result, error, goalId) => [
        { type: "Curriculum", id: goalId },
      ],
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useGetMeQuery,
  useLogoutMutation,
  useStartCurriculumMutation,
  useGetCurriculumQuery,
  useStartCounselorInterviewMutation,
  useSubmitCounselorAnswerMutation,
  useGetCounselorInterviewQuery,
} = authApi;

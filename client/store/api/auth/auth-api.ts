import { baseApi } from "../baseApi"
import type { User, CounselorInterviewResponse } from "@/lib/types"

export interface AuthResponse {
  success?: boolean
  message?: string
  data?: {
    user: User
    token: string
  }
  user?: User
  token?: string
}

export interface ApiSuccess<T> {
  success: boolean
  message?: string
  data: T
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, any>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    signup: builder.mutation<AuthResponse, any>({
      query: (userData) => ({
        url: "/auth/signup",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    me: builder.query<AuthResponse, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    // Curriculum & Agent Graph Endpoints
    startCurriculumSession: builder.mutation<
      ApiSuccess<{ goalId: string; curriculumId: string }>,
      { goalText: string; category: string; durationDays: number }
    >({
      query: (body) => ({
        url: "/curriculum/start",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Curriculum"],
    }),

    getCurriculum: builder.query<ApiSuccess<any>, string | null>({
      query: (goalId) => `/curriculum/${goalId}`,
      providesTags: (result, error, goalId) => [
        { type: "Curriculum", id: goalId || "LIST" },
      ],
    }),

    startCounselorInterview: builder.mutation<
      ApiSuccess<CounselorInterviewResponse>,
      { goalId: string }
    >({
      query: (body) => ({
        url: "/curriculum/interview/start",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { goalId }) => [
        { type: "Curriculum", id: goalId },
      ],
    }),

    submitCounselorAnswer: builder.mutation<
      ApiSuccess<CounselorInterviewResponse>,
      { goalId: string; answer: string }
    >({
      query: (body) => ({
        url: "/curriculum/interview/answer",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { goalId }) => [
        { type: "Curriculum", id: goalId },
      ],
    }),

    getCounselorInterview: builder.query<ApiSuccess<CounselorInterviewResponse>, string>({
      query: (goalId) => `/curriculum/interview/${goalId}`,
      providesTags: (result, error, goalId) => [
        { type: "Curriculum", id: goalId },
      ],
    }),

    // Explicit Step-Trigger Mutations for Progressive Flow
    triggerProfiler: builder.mutation<ApiSuccess<any>, { goalId: string }>({
      query: (body) => ({
        url: "/curriculum/trigger-profiler",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { goalId }) => [{ type: "Curriculum", id: goalId }],
    }),

    triggerLibrarian: builder.mutation<ApiSuccess<any>, { goalId: string }>({
      query: (body) => ({
        url: "/curriculum/trigger-librarian",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { goalId }) => [{ type: "Curriculum", id: goalId }],
    }),

    triggerArchitect: builder.mutation<ApiSuccess<any>, { goalId: string }>({
      query: (body) => ({
        url: "/curriculum/trigger-architect",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { goalId }) => [{ type: "Curriculum", id: goalId }],
    }),

    triggerSchedule: builder.mutation<ApiSuccess<any>, { goalId: string; durationDays?: number }>({
      query: (body) => ({
        url: "/curriculum/trigger-schedule",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { goalId }) => [{ type: "Curriculum", id: goalId }],
    }),

    triggerRagIndexing: builder.mutation<ApiSuccess<any>, { goalId: string }>({
      query: (body) => ({
        url: "/curriculum/trigger-rag-index",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { goalId }) => [{ type: "Curriculum", id: goalId }],
    }),

    getUserProjects: builder.query<ApiSuccess<any[]>, void>({
      query: () => "/curriculum/projects",
      providesTags: ["Curriculum"],
    }),

    getUserAnalytics: builder.query<ApiSuccess<any>, void>({
      query: () => "/curriculum/analytics",
      providesTags: ["Curriculum"],
    }),

    deleteUserProject: builder.mutation<ApiSuccess<any>, string>({
      query: (goalId) => ({
        url: `/curriculum/project/${goalId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Curriculum"],
    }),

    toggleResourceStatus: builder.mutation<
      ApiSuccess<any>,
      { resourceId: string; status: "INCLUDED" | "REJECTED" }
    >({
      query: ({ resourceId, status }) => ({
        url: `/curriculum/resource/${resourceId}/toggle`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Curriculum"],
    }),

    getLessonDetails: builder.query<ApiSuccess<any>, string | null>({
      query: (lessonId) => `/curriculum/lesson/${lessonId}`,
    }),

    submitLessonDoubt: builder.mutation<
      ApiSuccess<{ answer: string; sources?: string[] }>,
      { lessonId: string; goalId: string; doubt: string }
    >({
      query: ({ lessonId, goalId, doubt }) => ({
        url: `/curriculum/lesson/${lessonId}/doubt`,
        method: "POST",
        body: { goalId, doubt },
      }),
    }),

    submitQuizAnswer: builder.mutation<
      ApiSuccess<any>,
      { activityId: string; answers: Record<number, string> }
    >({
      query: ({ activityId, answers }) => ({
        url: `/curriculum/activity/${activityId}/submit`,
        method: "POST",
        body: { answers },
      }),
      invalidatesTags: ["Curriculum"],
    }),
  }),
})

export const {
  useLoginMutation,
  useSignupMutation,
  useMeQuery,
  useMeQuery: useGetMeQuery,
  useLogoutMutation,
  useStartCurriculumSessionMutation,
  useStartCurriculumSessionMutation: useStartCurriculumMutation,
  useGetCurriculumQuery,
  useStartCounselorInterviewMutation,
  useSubmitCounselorAnswerMutation,
  useGetCounselorInterviewQuery,
  useLazyGetCounselorInterviewQuery,
  useTriggerProfilerMutation,
  useTriggerLibrarianMutation,
  useTriggerArchitectMutation,
  useTriggerScheduleMutation,
  useTriggerRagIndexingMutation,
  useGetUserProjectsQuery,
  useGetUserAnalyticsQuery,
  useDeleteUserProjectMutation,
  useToggleResourceStatusMutation,
  useGetLessonDetailsQuery,
  useSubmitLessonDoubtMutation,
  useSubmitQuizAnswerMutation,
} = authApi;

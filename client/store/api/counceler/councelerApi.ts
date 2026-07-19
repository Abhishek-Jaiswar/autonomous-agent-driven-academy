import { baseApi } from "../baseApi";
import type { ApiSuccess, StartInterviewResponse, InterviewState } from "@/lib/types";
import type {
  StartInterviewRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from "./counceler.types";

export const councelerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startInterview: builder.mutation<ApiSuccess<StartInterviewResponse>, StartInterviewRequest>({
      query: (body) => ({
        url: "/curriculum/interview/start",
        method: "POST",
        body,
      }),
    }),
    
    getInterview: builder.query<ApiSuccess<InterviewState>, string>({
      query: (interviewId) => `/curriculum/interview/${interviewId}`,
    }),

    submitAnswer: builder.mutation<ApiSuccess<SubmitAnswerResponse>, SubmitAnswerRequest>({
      query: (body) => ({
        url: "/curriculum/interview/answer",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useStartInterviewMutation,
  useGetInterviewQuery,
  useSubmitAnswerMutation,
} = councelerApi;

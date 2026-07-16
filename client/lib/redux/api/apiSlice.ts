import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    prepareHeaders: (headers, { getState }) => {
      // Access the auth token from global state
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Curriculum"],
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (credentials) => ({
        url: "/auth/signup",
        method: "POST",
        body: credentials,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    startCurriculum: builder.mutation({
      query: (payload) => ({
        url: "/curriculum/start",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Curriculum"],
    }),
    getCurriculum: builder.query({
      query: (goalId) => `/curriculum/${goalId}`,
      providesTags: (result, error, goalId) => [{ type: "Curriculum", id: goalId }],
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useStartCurriculumMutation,
  useGetCurriculumQuery,
} = apiSlice;

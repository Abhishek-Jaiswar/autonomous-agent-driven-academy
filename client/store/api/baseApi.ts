import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://autonomous-agent-driven-academy.onrender.com",
    credentials: "include",
  }),
  tagTypes: ["User", "Curriculum"],
  endpoints: () => ({}),
});

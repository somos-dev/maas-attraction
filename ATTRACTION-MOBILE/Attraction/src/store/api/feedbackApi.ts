// src/store/api/feedbackApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import type { Feedback, FeedbackRequest } from "../types/feedback";

// Normalizza envelope {success,message,data} o oggetto nudo
const normalize = (res: any): Feedback | null => {
  if (!res) return null;
  if (typeof res === "object" && "success" in res) {
    return (res.data ?? null) as Feedback | null;
  }
  return res as Feedback;
};

export const feedbackApi = createApi({
  reducerPath: "feedbackApi",
  baseQuery: baseQueryWithReauth, // base = `${API_CONFIG.BASE_URL}auth/`
  tagTypes: ["MyFeedback"],
  endpoints: (builder) => ({
    getMyFeedback: builder.query<Feedback | null, void>({
      query: () => ({ url: "feedback/", method: "GET" }),
      transformResponse: (res) => normalize(res),
      providesTags: ["MyFeedback"],
    }),
    createFeedback: builder.mutation<Feedback, FeedbackRequest>({
      query: (body) => ({
        url: "feedback/",
        method: "POST",
        body,
      }),
      transformResponse: (res) => normalize(res) as Feedback,
      invalidatesTags: ["MyFeedback"],
    }),
    updateFeedback: builder.mutation<Feedback, FeedbackRequest>({
      query: (body) => ({
        url: "feedback/",
        method: "PUT",
        body,
      }),
      transformResponse: (res) => normalize(res) as Feedback,
      invalidatesTags: ["MyFeedback"],
    }),
  }),
});

export const {
  useGetMyFeedbackQuery,
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
} = feedbackApi;



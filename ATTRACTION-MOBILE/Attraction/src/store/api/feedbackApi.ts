import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "../../config/apiConfig";
import { Feedback, FeedbackRequest } from "../types/feedback";

export const feedbackApi = createApi({
  reducerPath: "feedbackApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}auth/feedback/`,
    prepareHeaders: (headers) => {
      Object.entries(API_CONFIG.HEADERS).forEach(([k, v]) => {
        headers.set(k, v as string);
      });
      return headers;
    },
  }),
  tagTypes: ["Feedback"],
  endpoints: (builder) => ({
    // GET /feedback/
    getFeedbacks: builder.query<Feedback[], void>({
      query: () => "",
      providesTags: ["Feedback"],
    }),

    // POST /feedback/
    createFeedback: builder.mutation<Feedback, FeedbackRequest>({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Feedback"],
    }),
  }),
});

export const { useGetFeedbacksQuery, useCreateFeedbackMutation } = feedbackApi;

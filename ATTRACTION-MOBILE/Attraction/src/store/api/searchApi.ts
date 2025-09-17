// src/store/api/searchApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "../../config/apiConfig";
import { Search, SearchRequest } from "../types/search";

export const searchApi = createApi({
  reducerPath: "searchApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}auth/`, 
    prepareHeaders: (headers) => {
      Object.entries(API_CONFIG.HEADERS).forEach(([k, v]) => {
        headers.set(k, v as string);
      });
      return headers;
    },
  }),
  tagTypes: ["Search"], // utile per invalidare cache
  endpoints: (builder) => ({
    // GET /api/auth/search/
    getSearches: builder.query<Search[], void>({
      query: () => "search/",
      providesTags: ["Search"],
    }),

    // POST /api/auth/search/
    createSearch: builder.mutation<Search, SearchRequest>({
      query: (body) => ({
        url: "search/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Search"],
    }),
  }),
});

export const { useGetSearchesQuery, useCreateSearchMutation } = searchApi;




import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import { Search, SearchRequest } from "../types/search";

export const searchApi = createApi({
  reducerPath: "searchApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Search"],
  endpoints: (builder) => ({
    // GET /search/
    getSearches: builder.query<Search[], void>({
      query: () => "search/",
      // 👇 il backend risponde con { success, message, data: [...] }
      transformResponse: (response: { data: Search[] }) => response.data,
      providesTags: ["Search"],
    }),

    // POST /search/
    createSearch: builder.mutation<Search, SearchRequest>({
      query: (body) => ({
        url: "search/",
        method: "POST",
        body,
      }),
      // 👇 anche qui il backend wrappa la risposta
      transformResponse: (response: { data: Search }) => response.data,
      invalidatesTags: ["Search"],
    }),
  }),
});

export const { useGetSearchesQuery, useCreateSearchMutation } = searchApi;







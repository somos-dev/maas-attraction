import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import { Search, SearchRequest } from "../types/search";

export const searchApi = createApi({
  reducerPath: "searchApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Search"],
  endpoints: (builder) => ({
    // GET /search/ → restituisce un array diretto
    getSearches: builder.query<Search[], void>({
      query: () => "search/",
      transformResponse: (response: any) => {
        console.log(" Risposta backend getSearches:", response);
        // Il backend restituisce un array, non un oggetto con "data"
        return Array.isArray(response) ? response : [];
      },
      providesTags: ["Search"],
    }),

    // 🔹 POST /search/
    createSearch: builder.mutation<Search, SearchRequest>({
      query: (body) => ({
        url: "search/",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        console.log("✅ Risposta backend createSearch:", response);
        // Anche qui, restituisce direttamente un oggetto Search
        return response;
      },
      invalidatesTags: ["Search"],
    }),
  }),
});

export const { useGetSearchesQuery, useCreateSearchMutation } = searchApi;









import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { RootState } from "../store";
import { updateAccessToken, clearAuth } from "../slices/authSlice";
import { API_CONFIG } from "../../config/apiConfig";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_CONFIG.BASE_URL}auth/`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.access;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    Object.entries(API_CONFIG.HEADERS).forEach(([k, v]) =>
      headers.set(k, v as string)
    );
    return headers;
  },
});

export const baseQueryWithReauth: typeof rawBaseQuery = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refresh = (api.getState() as RootState).auth.refresh;

    if (refresh) {
      const refreshResult = await rawBaseQuery(
        {
          url: "token/refresh/",
          method: "POST",
          body: { refresh },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const newAccess = (refreshResult.data as { access: string }).access;
        api.dispatch(updateAccessToken(newAccess));

        // ripeti la query originale
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(clearAuth());
      }
    }
  }

  return result;
};

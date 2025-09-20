// lib/axiosBaseQuery.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { getModalController } from "@/lib/modalController";
import { ROOTS_AUTH } from "@/routes/api_endpoints";

const axiosInstance = axios.create({
  baseURL: ROOTS_AUTH,
  // withCredentials: true,
});

export const axiosBaseQuery = (): BaseQueryFn<
  { url: string; method: AxiosRequestConfig["method"]; data?: any; params?: any },
  unknown,
  unknown
> => async ({ url, method, data, params }) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    console.log(data,method, url, params, headers);
    const result = await axiosInstance({ url, method, data, params, headers });
    console.log("result",result)
    return {
        data: result.data?.data ?? result.data ?? { success: true }
    };
  } catch (err) {
    console.log("Error in axiosBaseQuery:", err);
    const error = err as AxiosError;

    // --- Handle 401: try refresh, then show modal if that fails -----
    if (error?.response?.status === 401) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        console.log("Refreshing token with:", refreshToken);
        const res = await axios.post("/token/refresh/", {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;
        localStorage.setItem("accessToken", newAccess);

        const retry = await axiosInstance({
          url,
          method,
          data,
          params,
          headers: { Authorization: `Bearer ${newAccess}` },
        });

        return { data: retry.data };
      } catch (refreshError) {
        console.log("Error refreshing token:", refreshError);
        localStorage.clear();
        getModalController()?.onOpen(); // Open modal imperatively
        return { error: refreshError };
      }
    }

    const safeError = {
      status: error.response?.status,
      message: error.message,
      respMessage: error.response?.data
    };

    return { error: safeError }; // ✅ serializable only
  
  }
};

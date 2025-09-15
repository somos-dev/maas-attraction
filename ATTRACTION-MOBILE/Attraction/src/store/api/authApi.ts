import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { User } from '../slices/authSlice';
import { API_CONFIG } from "../../config/apiConfig";


// ---- Request types ----
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  codice_fiscale?: string;
  type?: string; // es. "Studente" o "Lavoratore" o stringa vuota
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RefreshRequest {
  refresh: string;
}

interface LogoutRequest {
  refresh: string;
}

// aggiunte
interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;      // inviato via link email dal backend
  password: string;   // nuova password
}

// ---- Response types ----
interface LoginResponse {
  access: string;
  refresh: string;
  user?: User; //  opzionale  dipende dal backend
}

interface RegisterResponse {
  access: string;
  refresh: string;
  user?: User;
}

interface RefreshResponse {
  access: string;
}

//  risposta forgot/reset (può variare a seconda del backend DRF)
interface MessageResponse {
  status: number;
  message: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}auth/`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.access;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: 'register/',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: 'login/',
        method: 'POST',
        body,
      }),
    }),
    refresh: builder.mutation<RefreshResponse, RefreshRequest>({
      query: (body) => ({
        url: 'token/refresh/',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<void, LogoutRequest>({
      query: (body) => ({
        url: 'logout/',
        method: 'POST',
        body,
      }),
    }),

    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: 'password-reset/',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: `password-reset-confirm/${body.token}/`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;


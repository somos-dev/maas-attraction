"use client"
import { createContext, ReactNode, useEffect, useReducer, useRef, useState } from 'react';
// utils
import { clearStoreData, isValidToken, setSession } from '../utils/jwt';
// @types
import { ActionMap, AuthState, AuthUser, JWTContextType } from '../@types/auth';
import { ENDPOINTS_AUTH } from '../routes/api_endpoints';
import { jwtDecode } from 'jwt-decode';
import { PATH_AUTH } from '../routes/paths';
import DialogTokenExpired from '../components/custom/DialogTokenExpired';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { object, string, z } from 'zod';
import { ActionState } from '@/lib/create-safe-action';
import axiosInstance from '../utils/axios';
import { useRoutesStore } from '@/store/routesStore';
import { useLocationStore } from '@/store/locationStore';
import { useStopsStore } from '@/store/stopsStore';
import { useMapStore } from '@/store/mapStore';
import { useInputStateStore } from '@/store/inputsStateStore';

// ----------------------------------------------------------------------

export enum Types {
  Initial = 'INITIALIZE',
  Login = 'LOGIN',
  Logout = 'LOGOUT',
  Register = 'REGISTER',
}

export const signInSchema = object({
  email: z.string().email("Invalid email address"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export type SignInInputType = z.infer<typeof signInSchema>;
export type SignInReturnType = ActionState<SignInInputType, AuthUser>;

export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(50, "Username cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  codiceFiscale: z
    .string({
      required_error: "Codice Fiscale is required",
      invalid_type_error: "Codice Fiscale must be a string",
    })
    .length(16, "Codice Fiscale must be exactly 16 characters long"),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),
  confirmPassword: z.string({
    required_error: "Re-enter your password to confirm",
    invalid_type_error: "password must be a string",
  }),
  role: z.enum(["user", "admin", "moderator"], {
    errorMap: () => ({ message: "Invalid role selected" }),
  }),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpInputType = z.infer<typeof signUpSchema>;
export type SignUpReturnType = ActionState<SignUpInputType, AuthUser>;

// ----------------------------------------------------------------------

type JWTAuthPayload = {
  [Types.Initial]: {
    isAuthenticated: boolean;
    user: AuthUser | null;
  };
  [Types.Login]: {
    user: AuthUser | null;
  };
  [Types.Logout]: undefined;
  [Types.Register]: {
    user: AuthUser | null;
  };
};

export type JWTActions = ActionMap<JWTAuthPayload>[keyof ActionMap<JWTAuthPayload>];

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  isActive: false,
  user: null,
};

const JWTReducer = (state: AuthState, action: JWTActions) => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        isActive: action.payload.isAuthenticated,
        user: action.payload.user,
      };
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        isActive: true,
        user: action.payload.user,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isActive: false,
        user: null,
      };
    case 'REGISTER':
      return {
        ...state,
        isAuthenticated: false,
        user: action.payload.user,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<JWTContextType | null>(null);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(JWTReducer, initialState);
  const authModal = useAuthModal();

  const expiredTimer = useRef<NodeJS.Timeout | null>(null);
  const authInterceptor = useRef<number | null>(null);

  const clearExpiredTimer = () => {
    if (expiredTimer.current) {
      clearTimeout(expiredTimer.current);
      expiredTimer.current = null;
    }
  };

  const clearAuthInterceptor = () => {
    if (authInterceptor.current) {
      axiosInstance.interceptors.response.eject(authInterceptor.current);
      authInterceptor.current = null;
    }
  };

  const handleTokenExpiring = (token: string) => {
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      const currentTime = Date.now();
      const timeLeft = exp * 1000 - currentTime;

      clearExpiredTimer();

      if (timeLeft > 2000) {
        expiredTimer.current = setTimeout(async () => {
          // Try silent refresh when access token expires
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await axiosInstance.post(ENDPOINTS_AUTH.refresh, { refresh: refreshToken });
              const newAccessToken = response.data.access;
              localStorage.setItem('accessToken', newAccessToken);
              setSession(newAccessToken, refreshToken);
              handleTokenExpiring(newAccessToken); // Reset timer for new token
              return;
            } catch (refreshError) {
              // Refresh failed, show modal
              if (!authModal.isOpen) {
                authModal.onOpen();
              }
              handleSession(undefined);
              dispatch({ type: Types.Logout });
              return;
            }
          } else {
            // No refresh token, show modal
            if (!authModal.isOpen) {
              authModal.onOpen();
            }
            handleSession(undefined);
            clearStoreData();
            dispatch({ type: Types.Logout });
            return;
          }
        }, timeLeft - 1000); // Try refresh 1 second before expiration
      } else if (timeLeft > 0) {
        // Token expires soon, try refresh immediately
        (async () => {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await axiosInstance.post(ENDPOINTS_AUTH.refresh, { refresh: refreshToken });
              const newAccessToken = response.data.access;
              localStorage.setItem('accessToken', newAccessToken);
              setSession(newAccessToken, refreshToken);
              handleTokenExpiring(newAccessToken);
              return;
            } catch (refreshError) {
              if (!authModal.isOpen) {
                authModal.onOpen();
              }
              handleSession(undefined);
              dispatch({ type: Types.Logout });
              return;
            }
          } else {
            if (!authModal.isOpen) {
              authModal.onOpen();
            }
            handleSession(undefined);
            clearStoreData();
            dispatch({ type: Types.Logout });
            return;
          }
        })();
      } else {
        // Token already expired, try refresh immediately
        (async () => {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await axiosInstance.post(ENDPOINTS_AUTH.refresh, { refresh: refreshToken });
              const newAccessToken = response.data.access;
              localStorage.setItem('accessToken', newAccessToken);
              setSession(newAccessToken, refreshToken);
              handleTokenExpiring(newAccessToken);
              return;
            } catch (refreshError) {
              if (!authModal.isOpen) {
                authModal.onOpen();
              }
              handleSession(undefined);
              dispatch({ type: Types.Logout });
              return;
            }
          } else {
            if (!authModal.isOpen) {
              authModal.onOpen();
            }
            handleSession(undefined);
            clearStoreData();
            dispatch({ type: Types.Logout });
            return;
          }
        })();
      }
    } catch (error) {
      console.error('Error handling token expiration:', error);
    }
  };

  const interceptAuthError = () => {
    // Clear existing interceptor
    clearAuthInterceptor();

    authInterceptor.current = axiosInstance.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const originalRequest = error.config;
        console.log(error)
        const isUnauthorized = error?.response?.status === 401;
        const alreadyTried = originalRequest?._retry;
        console.log("Intercepting auth error:", alreadyTried, isUnauthorized);
        if (isUnauthorized && !alreadyTried && !originalRequest.url.includes(ENDPOINTS_AUTH.refresh)) {
          console.log("Unauthorized request, trying to refresh token...");  
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (!refreshToken) {
              console.log("Refresh token not found");
              throw new Error('No refresh token available');
            }

            const response = await axiosInstance.post(ENDPOINTS_AUTH.refresh, {
              refresh: refreshToken,
            });

            const newAccessToken = response.data.access;
            localStorage.setItem('accessToken', newAccessToken);
            setSession(newAccessToken, refreshToken);
            handleTokenExpiring(newAccessToken); // Use access token for expiration

            // Retry original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            console.warn("Refresh token expired or invalid", refreshError);
            handleSession(undefined);
            if (!authModal.isOpen) {
              authModal.onOpen();
            }
            dispatch({ type: Types.Logout });
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  };

  const handleSession = (accessToken?: string, refreshToken?: string | null) => {
    if (accessToken && refreshToken) {
      setSession(accessToken, refreshToken);
      handleTokenExpiring(accessToken); // Use access token for expiration timing
      interceptAuthError();
    } else {
      clearExpiredTimer();
      clearAuthInterceptor();
      setSession(null);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("Initializing auth context");
        console.log('moving in')
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : '';
        if (accessToken && isValidToken(accessToken)) {
          console.log('moved in')
          // Valid access token exists
          handleSession(accessToken, refreshToken);
          const response = await axiosInstance.get(ENDPOINTS_AUTH.profile);
          const user = response?.data?.data;
          console.log('user before refresh', user)
          dispatch({
            type: Types.Initial,
            payload: {
              isAuthenticated: true,
              user: user,
            },
          });
        } else if (refreshToken) {
          // No valid access token but refresh token exists
          try {
            interceptAuthError();
            const response = await axiosInstance.post(ENDPOINTS_AUTH.refresh, {
              refresh: refreshToken,
            });
            
            const newAccessToken = response.data.access;
            localStorage.setItem('accessToken', newAccessToken);
            setSession(newAccessToken, refreshToken);
            handleTokenExpiring(newAccessToken);

            const profResponse = await axiosInstance.get(ENDPOINTS_AUTH.profile);
            const user = profResponse?.data?.data ?? profResponse?.data ?? null;
            console.log('user after refresh', user)
            dispatch({
              type: Types.Initial,
              payload: {
                isAuthenticated: true,
                user: user,
              },
            });
          } catch (refreshError) {
            console.warn("Failed to refresh token during initialization", refreshError);
            // Clear invalid tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            dispatch({
              type: Types.Initial,
              payload: {
                isAuthenticated: false,
                user: null,
              },
            });
          }
        } else {
          // No tokens available
          dispatch({
            type: Types.Initial,
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        dispatch({
          type: Types.Initial,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    initialize();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearExpiredTimer();
      clearAuthInterceptor();
      // Don't close modal on unmount - let it handle its own state
    };
  }, []);

  const login = async (props: SignInInputType): Promise<SignInReturnType> => {
    try {
      const response = await axiosInstance.post(ENDPOINTS_AUTH.login, {
        email: props.email,
        password: props.password,
      },
      {
        // withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

      const data = response.data;
      handleSession(data?.access, data?.refresh);

      const profResponse = await axiosInstance.get(ENDPOINTS_AUTH.profile);
      const user = profResponse?.data?.data ?? profResponse?.data ?? null;
            
      dispatch({
        type: Types.Login,
        payload: {
          user: user,
        },
      });

      return {
        data: user,
      };
    } catch (error: any) {
      console.error('Login error why:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || "Login failed";
      return {
        error: errorMessage,
      };
    }
  };

  const register = async (props: SignUpInputType): Promise<SignUpReturnType> => {
    try {
      const response = await axiosInstance.post(ENDPOINTS_AUTH.register, {
        email: props.email,
        username: props.username,
        codice_fiscale: props.codiceFiscale,
        password: props.password,
        confirm_password: props.confirmPassword,
        role: props.role,
      });

      const data = response.data;

      dispatch({
        type: Types.Register,
        payload: {
          user: null,
        },
      });

      return {
        data
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorData = error?.response?.data?.error || {};
      
      const fieldErrors = {
        email: errorData?.email || [],
        username: errorData?.username|| [],
        password: errorData?.password|| [],
        confirmPassword: errorData?.confirm_password|| [],
        codiceFiscale: errorData?.codice_fiscale|| [],
        role: errorData?.role|| []
      };

      console.log("Field errors in register:", fieldErrors);
      return {
        error: errorData?.detail || "Failed to create the account",
        fieldErrors: fieldErrors
      };
    }
  };

  const logout = async () => {
    try {
      // Only attempt logout API call if we have a valid token
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken && isValidToken(accessToken)) {
        await axiosInstance.post(ENDPOINTS_AUTH.logout);
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
      // Continue with cleanup even if logout request fails
    } finally {
      handleSession(undefined);
      useRoutesStore.getState().reset();
      useLocationStore.getState().reset();
      useMapStore.getState().reset();
      useStopsStore.getState().reset();
      useInputStateStore.getState().reset();
      dispatch({ type: Types.Logout });

    }
  };

  const handleDispatch = (action: JWTActions) => {
    switch (action.type) {
      case Types.Initial:
        dispatch({
          type: Types.Initial,
          payload: {
            isAuthenticated: action.payload.isAuthenticated,
            user: action.payload.user,
          },
        });
        break;
      case Types.Login:
        dispatch({
          type: Types.Login,
          payload: {
            user: action.payload.user,
          },
        });
        break;
      case Types.Logout:
        dispatch({
          type: Types.Logout,
        });
        break;
      case Types.Register:
        dispatch({
          type: Types.Register,
          payload: {
            user: action.payload.user,
          },
        });
        break;
      default:
        break;
    }
  };


  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'jwt',
        login,
        logout,
        register,
        handleDispatch,
      }}
    >
      {children}
      <DialogTokenExpired />
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };

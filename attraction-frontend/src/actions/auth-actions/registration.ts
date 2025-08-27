// actions/authActions.ts

import { AuthUser } from "@/@types/auth";
import { ActionState } from "@/lib/create-safe-action";
import { authApi } from "@/redux/store/authApi";
import { z } from "zod";

export const signUpSchema = z.object({
  username: z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(50, "Username cannot exceed 50 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  codiceFiscale: z
  .string({
            required_error: "Codic Fiscale is required",
            invalid_type_error: "Codic Fiscale must be a string",
  })
  .length(16, "Codice Fiscale must be exactly 16 characters long")
  // .regex(
  //   /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/,
  //   "Invalid Codice Fiscale format"
  // )
  ,
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
  
export type RegisterInput = z.infer<typeof signUpSchema>;
export type SignUpReturnType = ActionState<RegisterInput, AuthUser>;


import { AppDispatch } from "@/redux/store"; // Make sure this import points to your store's dispatch type

export const registerAction = (
  registerTrigger: (data: RegisterInput) => ReturnType<typeof authApi.endpoints.register.initiate>,
  dispatch: AppDispatch
) => {
  return async (
    data: RegisterInput
  ): Promise<ActionState<RegisterInput, any>> => {
    try {
      const response = await dispatch(registerTrigger(data)).unwrap();
      return { data: response };
    } catch (err: any) {
      return {
        error: err?.data?.detail || "Registration failed",
        fieldErrors: {
          email: err?.data?.email || [],
          username: err?.data?.username || [],
          password: err?.data?.password || [],
          confirmPassword: err?.data?.confirm_password || [],
          role: err?.data?.role || [],
          codiceFiscale: err?.data?.codiceFiscale || [],
        },
      };
    }
  };
};

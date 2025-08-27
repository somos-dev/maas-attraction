"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeClosedIcon, EyeIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { ActionState, createSafeAction } from "@/lib/create-safe-action";
import { useParams, useRouter } from "next/navigation";
import { PATH_AUTH } from "@/routes/paths";
import { z } from "zod";
import { AuthUser } from "@/@types/auth";
import axios from "axios";
import { ENDPOINTS_AUTH } from "@/routes/api_endpoints";
import useLocales from '@/hooks/useLocales';

export const resetPasswordSchema = z.object({
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
  
export type ResetPasswordInputType = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordReturnType = ActionState<ResetPasswordInputType, AuthUser>;



export default function ResetPassword() {
  const params = useParams()
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fromRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const { translate } = useLocales();

const resetPassword =  async (props: ResetPasswordInputType): Promise<ResetPasswordReturnType> =>{
    try{
        const response = await axios.post(`${ENDPOINTS_AUTH.resetPassword}${params.uidb64}/${params.token}/`,{
          uidb64: params.uid,
          token: params.token,
          new_password:props.password,
        })
        return {
            data:response.data
        }
    }catch(error: any ){
      console.log(error)
      error = {
        details: error?.response?.data?.detail|| "",
        password:error?.password || "",
        confirmPassword:error?.confirm_password || "",
      }
      return {
        error: error?.details || "Failed to reset the password",
        fieldErrors: error?.detail ? "" : error
      };
    }
}

const resetPasswordSafe = createSafeAction(resetPasswordSchema, resetPassword)


const { execute, fieldErrors, isLoading } = useAction(resetPasswordSafe, {
    onSuccess: (data) => {
      toast.success(data?.detail || "Your password is successfully updated!");
      console.log("Email sent", data);
      router.push(PATH_AUTH.login);
    },

    onError: (error) => {
      toast.error(error);
    },
    onFieldError: (error) => {
    }
  })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm_password") as string

    console.log(password, confirmPassword);

    if (!password || !confirmPassword) {
      toast.error(String(translate('toast.allFieldsRequired')));
      return 
    }

    execute({ password, confirmPassword });
  }



  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full min-h-screen bg-white dark:bg-gray-900 px-4 sm:px-0 mb-4 overflow-y-hidden">
      <div className="w-full max-w-md mx-auto  pt-2 pt-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          <span className="ml-1">{String(translate('auth.backToDashboard'))}</span>
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-4">
            <h1 className="mb-2 font-semibold text-gray-800 text-3xl sm:text-title-md dark:text-white/90">
              {String(translate('auth.resetPasswordTitle'))}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {String(translate('auth.resetPasswordPrompt'))}
            </p>
          </div>
          <div>
            <div className="relative sm:py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
            </div>
            <form ref={fromRef} onSubmit={onSubmit}>
              <div className="space-y-2">
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    {String(translate('auth.password'))}<span className="text-rose-600">{" "}*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      placeholder={String(translate('auth.enterPassword'))}
                      type={showPassword ? "text" : "password"}
                      className="w-full pr-10 max-h-10"
                      disabled={isLoading}
                      error={!!fieldErrors?.password} 
                      hints={fieldErrors?.password}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-6"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-200 dark:fill-gray-600" />
                      ) : (
                        <EyeClosedIcon className="fill-gray-200 dark:fill-gray-600" />
                      )}
                    </span>
                  </div>
                </div>
                {/* <!-- Confirm Password --> */}
                <div>
                  <Label>
                    {String(translate('auth.confirmPassword'))}<span className="text-rose-600">{" "}*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      placeholder={String(translate('auth.reEnterPassword'))}
                      type={showPassword ? "text" : "password"}
                      className="w-full pr-10 max-h-10"
                      disabled={isLoading}
                      error={!!fieldErrors?.confirmPassword} 
                      hints={fieldErrors?.confirmPassword}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-6"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-200 dark:fill-gray-600" />
                      ) : (
                        <EyeClosedIcon className="fill-gray-200 dark:fill-gray-600" />
                      )}
                    </span>
                  </div>
                </div>
                {/* <!-- Button --> */}
                <div className="mt-10">
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled={isLoading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-blue-500 shadow-theme-xs hover:bg-blue-600"
                  >
                    {isLoading ? String(translate('auth.sendingResetRequest')) : String(translate('auth.resetButton'))}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-2 mb-3">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                {String(translate('auth.goBackTo'))}{" "}
                <Link
                  href="/auth/signin"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
                >
                  {String(translate('auth.signIn'))}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

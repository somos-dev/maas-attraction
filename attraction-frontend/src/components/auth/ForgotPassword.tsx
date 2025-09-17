"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { Button } from "../ui/button";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { ActionState, createSafeAction } from "@/lib/create-safe-action";
import { useRouter } from "next/navigation";
import { PATH_AUTH } from "@/routes/paths";
import { z } from "zod";
import { AuthUser } from "@/@types/auth";
import axios from "axios";
import { ENDPOINTS_AUTH } from "@/routes/api_endpoints";
import useLocales from '@/hooks/useLocales';

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordInputType = z.infer<typeof forgotPasswordSchema>;
export type ForgotPasswordReturnType = ActionState<ForgotPasswordInputType, AuthUser>;


export default function ForgotPassword() {
  const fromRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const { translate } = useLocales();


  const sendEmail = async (props: ForgotPasswordInputType): Promise<ForgotPasswordReturnType> => {
    try {
      const response = await axios.post(ENDPOINTS_AUTH.forgotPassword, {
        email: props.email,
      })

      console.log("sent email response", response)
      return {
        data: response.data
      }
    } catch (error: any) {
      console.log("error success", error)
      error = {
        details: error?.detail || "",
        email: error?.email || "",
      }
      return {
        error: error?.detail || "Failed to reset the password",
        fieldErrors: error?.detail ? "" : error
      };
    }
  }

  const signUp = createSafeAction(forgotPasswordSchema, sendEmail)


  const { execute, fieldErrors, isLoading } = useAction(signUp, {
    onSuccess: (data) => {
      toast.success(
        typeof data?.detail === "string"
          ? data.detail
          : "Please check your email..."
      );
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

    const email = formData.get("email") as string

    console.log(email);

    if (!email) {
      toast.error(String(translate('toast.allFieldsRequired')));
      return


    }

    execute({ email });
  }



  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full min-h-screen bg-white dark:bg-gray-900 px-4 sm:px-0 mb-4 overflow-y-scroll">
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
              {String(translate('auth.forgotPasswordTitle'))}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {String(translate('auth.forgotPasswordPrompt'))}
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
                {/* <!-- Codice fiscale --> */}
                <div>
                  <Label>
                    {String(translate('auth.email'))}<span className="text-rose-600">{" "}*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder={String(translate('auth.enterEmail'))}
                    className="w-full max-h-10"
                    disabled={isLoading}
                    error={!!fieldErrors?.email}
                    hints={fieldErrors?.email}
                  />
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

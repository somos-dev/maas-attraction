"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeClosedIcon, EyeIcon } from "lucide-react";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { Button } from "../ui/button";
import Select from "../form/Select";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { createSafeAction } from "@/lib/create-safe-action";
import useAuth from "@/hooks/useAuth";
import { signUpSchema } from "@/context/JWTContext";
import { useRouter } from "next/navigation";
import { PATH_AUTH } from "@/routes/paths";
import { useSafeAction } from "@/hooks/use-safe-action";
import useLocales from '@/hooks/useLocales';

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const fromRef = useRef<HTMLFormElement>(null)
  const {register} = useAuth()
  const router = useRouter()
  const { translate, currentLang, onChangeLang } = useLocales();



const { execute, fieldErrors, isLoading } = useSafeAction(signUpSchema,register, {
    onSuccess: (data) => {
      toast.success(`Account Created, Please Check your email to activate your account!`);
      console.log("User Account created successfully!", data);
      router.push(PATH_AUTH.login);
    },

    onError: (error) => {
      toast.error(error);
    },
    onFieldError: (error) => {
    }
  })

// const signUp = createSafeAction(signUpSchema, register)


// const { execute, fieldErrors, isLoading } = useAction(signUp, {
//     onSuccess: (data) => {
//       toast.success(`Account Created, Please Check your email to activate your account!`);
//       console.log("User Account created successfully!", data);
//       router.push(PATH_AUTH.login);
//     },

//     onError: (error) => {
//       toast.error(error);
//     },
//     onFieldError: (error) => {
//     }
//   })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const username = formData.get("username") as string;
    const email = formData.get("email") as string
    const codiceFiscale = formData.get("codice_fiscale") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;
    const role = (formData.get("role") as "user" | "admin" | "moderator") || "user";

    console.log(email, username, codiceFiscale, password, confirmPassword );

    if (!username || !email || !password || !confirmPassword || !codiceFiscale) {
      toast.error(String(translate('toast.allFieldsRequired')));
      return 

      
    }

    execute({ email, username, codiceFiscale, password, confirmPassword, role });
  }



  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full min-h-screen bg-white dark:bg-gray-900 px-4 sm:px-0 mb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-lg">
      {/* Language Switch Button */}
      <div className="z-50 absolute top-4 right-4 flex items-center space-x-2">
        <button 
          onClick={() => onChangeLang('en')} 
          className={`border p-2 rounded-md text-sm cursor-pointer transition-colors ${
            currentLang.value === 'en' ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-50'
          }`}
        >
          {String(translate('language.engShort'))}
        </button>
        <button 
          onClick={() => onChangeLang('it')} 
          className={`border p-2 rounded-md text-sm cursor-pointer transition-colors ${
            currentLang.value === 'it' ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-50'
          }`}
        >
          {String(translate('language.itaShort'))}
        </button>
      </div>
      
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
              {String(translate('auth.signUp'))}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {String(translate('auth.signUpPrompt'))}
            </p>
          </div>
          <div>
            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-5">
              <button className="inline-flex items-center justify-center gap-3 py-1 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-4 w-full hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                {/* Google SVG */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* ...paths */}
                  <path
                    d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                    fill="#EB4335"
                  />
                </svg>
                <span className="sm:inline">{String(translate('auth.signUpWithGoogle'))}</span>
              </button>
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-4 w-full hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                {/* X SVG */}
                <svg
                  width="21"
                  className="fill-current"
                  height="20"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z" />
                </svg>
                <span className="sm:inline">{String(translate('auth.signUpWithX'))}</span>
              </button>
            </div>
            <div className="relative sm:py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-0">
                  Or
                </span>
              </div>
            </div>
            <form ref={fromRef} onSubmit={onSubmit}>
              <div className="space-y-2">
                <div className="flex flex-col gap-5 sm:grid sm:grid-cols-2">
                  {/* <!-- Email --> */}
                  <div className="sm:col-span-1">
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
                  {/* <!-- Username --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      {String(translate('auth.username'))}<span className="text-rose-600">{" "}*</span>
                    </Label>
                    <Input
                      type="text"
                      id="username"
                      name="username"
                      placeholder={String(translate('auth.enterUsername'))}
                      className="w-full max-h-10"
                      disabled={isLoading}
                      error={!!fieldErrors?.username} 
                      hints={fieldErrors?.username}
                    />
                  </div>
                </div>
                {/* <!-- Codice fiscale --> */}
                <div>
                  <Label>
                    {String(translate('auth.codiceFiscale'))}<span className="text-rose-600">{" "}*</span>
                  </Label>
                  <Input
                    type="text"
                    id="Codice_fiscale"
                    name="codice_fiscale"
                    placeholder={String(translate('auth.enterCodiceFiscale'))}
                    className="w-full max-h-10"
                    disabled={isLoading}
                    error={!!fieldErrors?.codiceFiscale} 
                    hints={fieldErrors?.codiceFiscale}
                  />
                </div>
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
                {/* <!-- Role Selection --> */}
                <div>
                  <Select
                    placeholder={String(translate('auth.selectRole'))}
                    className="w-full max-h-10 my-3"
                    disabled={isLoading}
                    onChange={()=>{}}
                    options = {[
                      {
                        value:"user",
                        label:String(translate('auth.userRole'))
                      },
                      {
                        value:"admin",
                        label:String(translate('auth.adminRole'))
                      },
                    ]}
                  />
                </div>
                {/* <!-- Checkbox --> */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    className="w-5 h-5 mt-1"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                    {String(translate('auth.agreeToTermsText'))}{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      {String(translate('auth.termsAndConditions'))},
                    </span>{" "}
                    {String(translate('common.and'))}{" "}
                    <span className="text-gray-800 dark:text-white">
                      {String(translate('auth.privacyPolicyLink'))}
                    </span>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div>
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled={isLoading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-blue-500 shadow-theme-xs hover:bg-blue-600"
                  >
                    {isLoading ? String(translate('auth.creatingAccount')) : String(translate('auth.signUpButton'))}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-2 mb-3">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                {String(translate('auth.alreadyHaveAccount'))}{" "}
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

"use client";

import { useState, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import LoadingScreen from "../components/LoadingScreen";

type Props = { children: ReactNode };

export default function AuthGuard({ children }: Props) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [intended, setIntended] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return; 

    if (!isAuthenticated) {
      if (intended === null) {
        setIntended(pathname);
      }
      router.replace(`/auth/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isAuthenticated && intended) {
      router.replace(intended);
      setIntended(null);
    }
  }, [isInitialized, isAuthenticated, pathname, intended, router]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

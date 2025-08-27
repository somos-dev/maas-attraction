"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import LoadingScreen from "@/components/LoadingScreen";
import { PATH_ROUTES } from "@/routes/paths";

type Props = {
  children: React.ReactNode;
};

export default function GuestGuard({ children }: Props) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated) {
      router.replace(PATH_ROUTES.dashboard); 
    }
  }, [isAuthenticated, isInitialized, pathname, router]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// components/ProModalBinder.tsx
"use client";

import { useEffect } from "react";
import { useProModal } from "@/hooks/use-pro-modal";
import { setModalController } from "@/lib/modalController";

export const ProModalBinder = () => {
  const modal = useProModal();

  useEffect(() => {
    setModalController(modal);
  }, [modal]);

  return null;
};

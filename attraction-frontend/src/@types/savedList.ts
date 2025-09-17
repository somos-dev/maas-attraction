// src/@types/savedList.ts

import { LucideIcon } from "lucide-react";

export type Place = {
  id: string;
  name: string;
  address: string;
  icon: LucideIcon;
};

export type List = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  places: Place[];
  isCustom: boolean;
};

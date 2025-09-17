// TypeScript module declaration for the shadcn/ui dropdown-menu component

declare module "ui/dropdown-menu" {
  import * as React from "react";
  import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

  export const DropdownMenu: typeof DropdownMenuPrimitive.Root;
  export const DropdownMenuTrigger: typeof DropdownMenuPrimitive.Trigger;
  export const DropdownMenuContent: React.ForwardRefExoticComponent<any>;
  export const DropdownMenuItem: React.ForwardRefExoticComponent<any>;
  export const DropdownMenuSeparator: React.ForwardRefExoticComponent<any>;
}

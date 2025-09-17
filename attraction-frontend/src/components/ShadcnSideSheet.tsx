import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetOverlay, SheetTitle } from "./ui/sheet"
import { useSideSheetStore } from "@/store/sideSheet"



const SIDESHEET_WIDTH = '20rem'

export function SideSheet({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  height = "100%",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right" | "top" | "bottom"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
  height?: string | number
}) {
    const {isSideSheetOpen, setSideSheetOpen} = useSideSheetStore()
  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  // if (isMobile) {
    return (
      <Sheet open={isSideSheetOpen} onOpenChange={setSideSheetOpen} {...props}>
        <SheetOverlay className="hidden bg-black/0"/>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
        //   className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDESHEET_WIDTH,
              "height": height ,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  // }

  // return (
  //   <div
  //     className="group peer text-sidebar-foreground hidden md:block"
  //     data-state={state}
  //     data-collapsible={state === "collapsed" ? collapsible : ""}
  //     data-variant={variant}
  //     data-side={side}
  //     data-slot="sidebar"
  //   >
  //     {/* This is what handles the sidebar gap on desktop */}
  //     <div
  //       data-slot="sidebar-gap"
  //       className={cn(
  //         "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
  //         "group-data-[collapsible=offcanvas]:w-0",
  //         "group-data-[side=right]:rotate-180",
  //         variant === "floating" || variant === "inset"
  //           ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
  //           : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
  //       )}
  //     />
  //     <div
  //       data-slot="sidebar-container"
  //       className={cn(
  //         "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
  //         side === "left"
  //           ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
  //           : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
  //         // Adjust the padding for floating and inset variants.
  //         variant === "floating" || variant === "inset"
  //           ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
  //           : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
  //         className
  //       )}
  //       {...props}
  //     >
  //       <div
  //         data-sidebar="sidebar"
  //         data-slot="sidebar-inner"
  //         className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
  //       >
  //         {children}
  //       </div>
  //     </div>
  //   </div>
  // )
}
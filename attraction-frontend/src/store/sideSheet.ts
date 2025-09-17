import { create } from "zustand";



interface SideSheetStore {
    isSideSheetOpen:boolean,
    setSideSheetOpen:()=>void
    setSideSheetClose:()=>void
    toggleSideSheet:()=>void
}

export const useSideSheetStore = create<SideSheetStore>((set)=>({
    isSideSheetOpen:false,
    setSideSheetOpen: ()=>set({isSideSheetOpen:true}),
    setSideSheetClose: ()=>set({isSideSheetOpen:false}),
    toggleSideSheet:()=>set((state)=>({isSideSheetOpen:!state.isSideSheetOpen})),
}))
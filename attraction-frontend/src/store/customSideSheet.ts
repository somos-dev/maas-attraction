import { create } from "zustand";



interface CustomSideSheetStore {
    isSideSheetOpen:boolean,
    currentContent: React.ReactNode,
    currentBottomSheetContent: React.ReactNode,
    setCurrentContent: (content: string) => void,
    setBottomSheetContent: (content: string) => void,
    setSideSheetOpen:()=>void
    setSideSheetClose:()=>void
    toggleSideSheet:()=>void
}

export const useCustomSideSheetStore = create<CustomSideSheetStore>((set)=>({
    isSideSheetOpen:false,
    currentContent: "directions",
    currentBottomSheetContent: "directions",
    setCurrentContent: (content) => set({ currentContent: content }),
    setBottomSheetContent: (content) => set({ currentBottomSheetContent: content }),
    setSideSheetOpen: ()=>set({isSideSheetOpen:true}),
    setSideSheetClose: ()=>set({isSideSheetOpen:false}),
    toggleSideSheet:()=>set((state)=>({isSideSheetOpen:!state.isSideSheetOpen})),
}))
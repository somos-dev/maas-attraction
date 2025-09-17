import { create } from "zustand";



interface SidebarStore {
    isSidebarOpen:boolean,
    setIsSidebarOpen:(isOpen:boolean)=>void,
    setSidebarOpen:()=>void
    setSidebarClose:()=>void
    toggleSidebar:()=>void
}

export const useSidebarStore = create<SidebarStore>((set)=>({
    isSidebarOpen:false,
    setIsSidebarOpen:(isOpen:boolean)=>set({isSidebarOpen:isOpen}),
    setSidebarOpen: ()=>set({isSidebarOpen:true}),
    setSidebarClose: ()=>set({isSidebarOpen:false}),
    toggleSidebar:()=>set((state)=>({isSidebarOpen:!state.isSidebarOpen})),
}))
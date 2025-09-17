import { create } from "zustand";



interface PanelStore {
    isPanelOpen:boolean,
    setPanelOpen:()=>void
    setPanelClose:()=>void
    togglePanel:()=>void
    isDetailsOpen:boolean,
    setDetailsOpen:()=>void
    setDetailsClose:()=>void
    toggleDetails:()=>void
}

export const usePanelStore = create<PanelStore>((set)=>({
    isPanelOpen:false,
    setPanelOpen: ()=>set({isPanelOpen:true}),
    setPanelClose: ()=>set({isPanelOpen:false}),
    togglePanel:()=>set((state)=>({isPanelOpen:!state.isPanelOpen})),
    isDetailsOpen:false,
    setDetailsOpen: ()=>set({isDetailsOpen:true}),
    setDetailsClose: ()=>set({isDetailsOpen:false}),
    toggleDetails:()=>set((state)=>({isDetailsOpen:!state.isDetailsOpen}))
}))
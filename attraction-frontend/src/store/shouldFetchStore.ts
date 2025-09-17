import { create } from "zustand";



interface ShouldFetchStore {
    shouldFetch:boolean,
    setShouldFetch:(setValue:boolean)=>void
    setShouldFetchOpen:()=>void
    setShouldFetchClose:()=>void
    toggleShouldFetch:()=>void
}

export const useShouldFetchStore = create<ShouldFetchStore>((set)=>({
    shouldFetch:false,
    setShouldFetch: (setValue)=>set({shouldFetch:setValue}),
    setShouldFetchOpen: ()=>set({shouldFetch:true}),
    setShouldFetchClose: ()=>set({shouldFetch:false}),
    toggleShouldFetch:()=>set((state)=>({shouldFetch:!state.shouldFetch})),
}))
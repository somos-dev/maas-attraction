import { create } from "zustand";



interface ProfileStore {
    isProfileOpen:boolean,
    setProfileOpen:()=>void
    setProfileClose:()=>void
}

export const useProfileStore = create<ProfileStore>((set)=>({
    isProfileOpen:false,
    setProfileOpen: ()=>set({isProfileOpen:true}),
    setProfileClose: ()=>set({isProfileOpen:false})
}))
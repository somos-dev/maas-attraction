import { create } from "zustand";



interface InputStateStore {
  originInputText: string;
  destInputText: string;
  setOriginInputText: (name: string ) => void;
  setDestInputText: (name: string) => void;
  reset: () => void;
}

export const useInputStateStore = create<InputStateStore>((set)=>({
      originInputText: '',
      destInputText: '',
      setOriginInputText: (name) => set({ originInputText: name }),
      setDestInputText: (name) => set({ destInputText: name }),
      reset: () => set({ originInputText: '', destInputText: '' }),
}))
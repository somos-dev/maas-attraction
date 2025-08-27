import { create } from 'zustand';

interface AuthModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useAuthModal = create<AuthModalStore>((set, get) => ({
  isOpen: false,
  onOpen: () => {
    // Prevent opening multiple modals
    if (!get().isOpen) {
      set({ isOpen: true });
    }
  },
  onClose: () => set({ isOpen: false }),
}));
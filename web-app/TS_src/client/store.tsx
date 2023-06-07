import { create } from 'zustand';

interface StoreState {
  showLogin: Boolean;
  showRegistration: Boolean;
  loginToggle: (status: boolean) => void;
  registerToggle: (status: boolean) => void;
}

const useStore = create<StoreState>((set) => ({
  showLogin: false,
  loginToggle: (status: boolean) => set((state) => ({ showLogin: status })),

  showRegistration: false,
  registerToggle: (status: boolean) => set((state) => ({ showRegistration: status })),

}));

export default useStore;
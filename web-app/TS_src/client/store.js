import { create } from 'zustand';

const useStore = create((set) => ({
  showLogin: false,
  loginToggle: () => set((state) => ({ showLogin: !state.showLogin })),
  showRegistration: false,
  registerToggle: () => set((state) => ({ showRegistration: !state.showRegistration })),
  

}))


export default useStore;
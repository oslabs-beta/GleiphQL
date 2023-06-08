import { create } from 'zustand';

interface StoreState {
  // login component toggle
  showLogin: Boolean;
  loginToggle: (status: boolean) => void;
  // register component toggle
  showRegistration: Boolean;
  registerToggle: (status: boolean) => void;
  // user login info
  userEmail: String;
  setUserEmail: (userEmail: string) => void;
  userPassword: String;
  setUserPassword: (userPassword: string) => void;
  confirmPassword: String;
  setConfirmPassword: (confirmPassword: string) => void;

  // boolean to confirm user is logged in
  isLoggedIn: Boolean;
  setIsLoggedIn: (status: boolean) => void;
  // boolean to check matched passwords
  passMatch: Boolean;
  setPassMatch: (status: boolean) => void;
}

const useStore = create<StoreState>((set) => ({
  showLogin: false,
  loginToggle: (status: boolean) => set((state) => ({ showLogin: status })),

  showRegistration: false,
  registerToggle: (status: boolean) => set((state) => ({ showRegistration: status })),

  userEmail: "",
  setUserEmail: (userEmail) => set((state) => ({
    ...state, userEmail
  })),

  userPassword: "",
  setUserPassword: (userPassword) => set((state) => ({
    ...state, userPassword
  })),

  confirmPassword: "",
  setConfirmPassword: (confirmPassword) => set((state) =>({
    ...state, confirmPassword
  })),

  isLoggedIn: false,
  setIsLoggedIn:(status: boolean) => set((state) => ({ isLoggedIn: status })),

  passMatch: false,
  setPassMatch: (status: boolean) => set((state) => ({
    passMatch: status 
  })),

}));

export default useStore;
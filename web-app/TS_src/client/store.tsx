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

  // array of requestdata for a current graphql endpoint
  endpointRequests: any;
  setEndpointRequests: (requests: any) => void;
  // string that shows what datatype to display on dashboard chart
  chartDataType: string;
  setChartDataType: (dataType: string) => void;
  // string that shows what datatype to display on dashboard chart
  chartTimeInterval: string;
  setChartTime: (chartTime: string) => void;
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

  endpointRequests : [],
  setEndpointRequests: (requests: any) => set((state) => ({
    endpointRequests: requests
  })),

  chartDataType: "Requests",
  setChartDataType: (dataType: string) => set((state) => ({
    chartDataType: dataType
  })),

  chartTimeInterval: "Last 7 Days",
  setChartTime: (chartTime: string) => set((state) => ({
    chartTimeInterval: chartTime
  }))
}));

export default useStore;
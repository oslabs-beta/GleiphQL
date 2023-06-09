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
  // array of requestdata for a current graphql endpoint
  endpointRequests: any;
  setEndpointRequests: (requests: any) => void;
  // string that shows what datatype to display on dashboard chart
  chartDataType: string;
  setChartDataType: (dataType: string) => void;
  // string that shows what datatype to display on dashboard chart
  chartTimeInterval: string;
  setChartTime: (chartTime: string) => void;

  // boolean to confirm user is logged in
  isLoggedIn: Boolean;
  setIsLoggedIn: (status: boolean) => void;
  // boolean to check matched passwords
  passMatch: Boolean;
  setPassMatch: (status: boolean) => void;

  currEndPoint: Endpoint;
  setCurrEndPoint: (id: number, url:string) => void;

  endPointArr: Endpoint[];
  setEndPointArr: (endPointArr: Endpoint[]) => void;

  currUserId: number;
  setCurrUserId: (userId: number) => void;

  eventSource: EventSource;
  setEventSource: (eventSource: EventSource) => void;

  activeEvent: Boolean;
  setActiveEvent: (status: boolean) => void;
}
interface Endpoint {
  id: number;
  url: string;
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

  currEndPoint: {
    id: 0,
    url: ''
  },
  setCurrEndPoint: (id: number, url: string) => set((state) => ({
    currEndPoint: {
      id,
      url
    }
  })),

  endPointArr: [],
  setEndPointArr: (endPointArr: Endpoint[]) => set((state) => ({
    endPointArr: endPointArr
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
  })),

  currUserId: 0,
  setCurrUserId: (userId: number) => set((state) => ({
    currUserId: userId
  })),
  
  eventSource: new EventSource(''),
  setEventSource:  (eventSource: EventSource) => set((state) => ({
    eventSource: eventSource
  })),

  activeEvent: false,
  setActiveEvent: (status: boolean) => set((state) => ({
    activeEvent: status
  }))

}));

export default useStore;
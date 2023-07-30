import { create } from 'zustand';

import {
  UserInfo,
  SetNumAndStrFx,
  SetStatusFx,
  Endpoint,
  EndpointRequest,
  SetEndpointRequests,
  Connection,
  SetConnection,
} from './types';

interface StoreState {
  modalOpen: boolean;
  setModalOpen: SetStatusFx;

  currUser: UserInfo;
  setCurrUser: SetNumAndStrFx;

  showLogin: boolean;
  loginToggle: SetStatusFx;

  isLoggedIn: boolean;
  setIsLoggedIn: SetStatusFx;

  showRegistration: boolean;
  registerToggle: SetStatusFx;

  currEndpoint: Endpoint;
  setCurrEndpoint: SetNumAndStrFx;

  endpointRequests: EndpointRequest[];
  setEndpointRequests: SetEndpointRequests;

  connection: Connection;
  setConnection: SetConnection;
}

const useStore = create<StoreState>((set) => ({
  modalOpen: false,
  setModalOpen: (status: boolean) : void => set((state) => ({ modalOpen: status})),

  currUser: {
    userId: 0,
    userEmail: '',
  },
  setCurrUser: (userId: number, userEmail: string) : void => set((state) => ({
    currUser: {
      userId,
      userEmail
    }
  })),

  showLogin: false,
  loginToggle: (status: boolean) : void => set((state) => ({ showLogin: status })),

  isLoggedIn: false,
  setIsLoggedIn:(status: boolean) : void => set((state) => ({ isLoggedIn: status })),

  showRegistration: false,
  registerToggle: (status: boolean) : void => set((state) => ({ showRegistration: status })),

  currEndpoint: {
    endpoint_id: 0,
    url: ''
  },
  setCurrEndpoint: (endpoint_id: number, url: string) : void => set((state) => ({
    currEndpoint: {
      endpoint_id,
      url
    } 
  })),

  endpointRequests : [],
  setEndpointRequests: (requests: EndpointRequest[]) : void => set((state) => ({
    endpointRequests: requests
  })),

  connection: null,
  setConnection: (c: Connection) : void => set((state) => ({
    connection: c
  }))
}));

export default useStore;
export interface UserInfo {
  userId: number;
  userEmail: string;
}

export interface UserResponse extends UserInfo {
  userExists?: boolean;
  userCreated?: boolean;
  signedIn?: boolean;
}

export interface Endpoint {
  endpoint_id: number;
  url: string;
}

export interface EndpointRequest {
  endpoint_id: number;
  ip_address: string;
  timestamp: string;
  object_types: any;
  query_string: string;
  complexity_score: number;
  query_depth: number;
}

export type SetNumAndStrFx = (num: number, str: string) => void;

export type SetStatusFx = (status: boolean) => void;

export type SetStrValueFx = (value: string) => void;

export type SetEndpointRequests = (endpointRequests: EndpointRequest[]) => void;

export type Connection = (() => void) | null;

export type SetConnection = (connection: Connection) => void;

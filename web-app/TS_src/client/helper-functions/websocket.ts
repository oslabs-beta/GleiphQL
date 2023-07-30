import { Endpoint, SetEndpointRequests, EndpointRequest } from "../types";

// instantiating a connection with the Websocket Server to obtain updates on the current endpoint data
const streamWS = (currEndPoint: Endpoint, setEndpointRequests: SetEndpointRequests) : (() => void) => {
  const fetchWS = new WebSocket(`ws://localhost:8080/${currEndPoint.endpoint_id}`)
    fetchWS.onmessage = function(event) : void {
      const data: EndpointRequest[] = JSON.parse(event.data);
      setEndpointRequests(data);
    }

    fetchWS.onerror = function(err: unknown) : void {
      console.error('websocket connection failed:', err);
    };

    return () : void => {
      console.log('closing current connection', currEndPoint.endpoint_id);
      // to use later for closing connections
      fetchWS.close()
    }
}

export default streamWS;
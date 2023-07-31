import { Endpoint } from '../store';

const streamWS = (currEndPoint: Endpoint, setEndpointRequests: (requests: any) => void) => {
  const fetchWS = new WebSocket(`ws://localhost:8080/${currEndPoint.id}`)
    fetchWS.onmessage = function(event) {
      const data = JSON.parse(event.data);
      setEndpointRequests(data);
    }

    fetchWS.onerror = function(err) {
      console.error('websocket connection failed:', err);
    };

    return () => {
      console.log('closing current connection', currEndPoint.id);
      fetchWS.close()
    }
}

export default streamWS;
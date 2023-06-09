import Button from '@mui/material/Button';
import React, { useEffect, useState } from 'react';
import useStore from '../store';

interface SidebarButtonProps {
  endPointUrl: string;
  endPointId: number;
}

const SidebarButton: React.FC<SidebarButtonProps> = (props) => {
  const { setCurrEndPoint, currEndPoint, activeEvent, setActiveEvent, eventSource, setEventSource } = useStore();
  //const [eventSource, setEventSource] = useState<EventSource>()

  // Connections are closed but multiple end points are trying to connect at the same time. 
  useEffect(() => {
    if(currEndPoint.id !== props.endPointId) {
      eventSource?.close();
    } else {
      setEventSource(new EventSource(`http://localhost:3500/api/sse/${currEndPoint.id}`));

      eventSource?.addEventListener('open', () => {
        console.log('SSE opened!');
      });
  
      eventSource?.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        console.log(`this is data: ${JSON.stringify(data)}`);
      });
  
      eventSource?.addEventListener('error', (event) => {
        console.log('Error', event);
      });
    }
  }, [currEndPoint])
  
  const toggleEndPoint = () => {
    
      if(activeEvent){
        eventSource.close();
        setEventSource(new EventSource(""));
      }

      setCurrEndPoint(props.endPointId, props.endPointUrl);
      setEventSource(new EventSource(`http://localhost:3500/api/sse/${currEndPoint.id}`))
        
      eventSource?.addEventListener('open', () => {
        console.log('SSE opened!');
      });
  
      eventSource?.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        console.log(`this is data: ${JSON.stringify(data)}`);
      });
  
      eventSource?.addEventListener('error', (event) => {
        console.log('Error', event);
      });
      
      // eventSource.onmessage = (event) => {
      //   const eventData = JSON.parse(event.data);
      //   console.log('Receive SSE Event:', eventData);
      //   // handle the received SSE event data here
  
      // };
      // eventSource.onerror = (error) => {
      //   console.error('Error connecting to SSE endpoint: ', error)
      //   // handle the error here
      // };
      // return () => {
      //   // clean up the even source when the component unmounts
      //   eventSource.close();
      // };
  }

  

  return (
    <div>
      <Button variant = 'contained' onClick = {toggleEndPoint}>{props.endPointUrl}</Button>
    </div>
  )
}

export default SidebarButton
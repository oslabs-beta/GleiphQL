import React, { useEffect } from 'react';

const SSEComponent: React.FC<{}> = () => {
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3500/api/sse')
    
    eventSource.addEventListener('open', () => {
      console.log('SSE opened!');
    });

    eventSource.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      console.log(`this is data: ${data}`);
    });

    eventSource.addEventListener('error', (event) => {
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

    return () => {
      // clean up the even source when the component unmounts
      eventSource.close();
    };
  }, []);

  return (
    <>
      <div className='sse-component'>
        <h1>Event Source:</h1>
      </div>
    </>
  )
}

export default SSEComponent;
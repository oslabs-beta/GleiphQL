import { useEffect, useState } from 'react';
import useStore from '../store';
import axios from 'axios';
import SidebarButton from './SidebarButton';
import { v4 as uuidv4 } from 'uuid';
import Box from '@mui/material/Box';

//fix any

const queryEndPoints = async (userId: number): Promise<any> => {
  const response = await axios.get(`/api/endpoint/${userId}`);
  //@ts-ignore
  return response.data;
}

const Sidebar: React.FC<{}> = () => {
  const [ endpointArray, setEndpointArray ] = useState<any[]>([]);
  const { currEndPoint, setCurrEndPoint, currUserId } = useStore();

  //useEffect that queries for current endPoints and generates endPointArray
  useEffect(() => {
    const fetchData = async () => {
      // fix any
      try {
        const queryArr: any[] = await queryEndPoints(currUserId);
        if(queryArr.length) {
          const endPoints = queryArr.map((ele) => <SidebarButton key={uuidv4()} endPointUrl={ele.url} endPointId={ele.endpoint_id}></SidebarButton>)
          setEndpointArray(endPoints);
          setCurrEndPoint(queryArr[0].endpoint_id, queryArr[0].url);
        }
      } catch (err: any) {
        console.log(err.message);
      }
    };
    fetchData();
  }, [])

  //wrap endpoint array in things
  //just use button that when you click sets currEndPoint
  return (
    <div>
      <Box sx={{
              '& > :not(style)': { m: 1, width: '25ch' },
       }}>
      {currEndPoint.url}
      {endpointArray}
      </Box>
    </div>
  )
}

export default Sidebar
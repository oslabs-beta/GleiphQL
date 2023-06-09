import { useEffect, useState } from 'react';
import useStore from '../store';
import axios from 'axios';
import SidebarButton from './SidebarButton';
import { v4 as uuidv4 } from 'uuid';
import Box from '@mui/material/Box';

//fix any
const queryEndPoints = async (ownerId: number): Promise<any> => {
  const response = await axios.get(`http://localhost:3500/api/endpoint/${ownerId}`);
  console.log(response.data);
  //@ts-ignore
  return response.data;
}

const Sidebar: React.FC<{}> = () => {
  const ownerId = 8;
  const [endpointArray, setEndpointArray] = useState<any[]>([]);
  const { currEndPoint, setCurrEndPoint } = useStore();

  //useEffect that queries for current endPoints and generates endPointArray
  useEffect(() => {
    const fetchData = async () => {
      //fix any
      const queryArr: any[] = await queryEndPoints(ownerId);
      const endPoints = queryArr.map((ele) => <SidebarButton key={uuidv4()} endPointUrl={ele.url}></SidebarButton>)
      setEndpointArray(endPoints);
      setCurrEndPoint(queryArr[0].url);
    }
    fetchData()
  }, [])

  //wrap endpoint array in things
  //just use button that when you click sets currEndPoint
  return (
    <div>
      <Box sx={{
              '& > :not(style)': { m: 1, width: '25ch' },
       }}>
      {currEndPoint}
      {endpointArray}
      </Box>
    </div>
  )
}

export default Sidebar
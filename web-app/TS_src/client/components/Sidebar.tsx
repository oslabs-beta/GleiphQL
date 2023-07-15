import { useEffect, useState } from 'react';
import useStore from '../store';
import axios from 'axios';
import SidebarButton from './SidebarButton';
import { v4 as uuidv4 } from 'uuid';
import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";

const queryEndPoints = async (userId: number): Promise<any> => {
  const response = await axios.get(`/api/endpoint/${userId}`);
  //@ts-ignore
  return response.data;
}

const Sidebar: React.FC<{}> = () => {
  const [ endpointArray, setEndpointArray ] = useState<any[]>([]);
  const { setCurrEndPoint, currUser } = useStore();

  //useEffect that queries for current endPoints and generates endPointArray
  useEffect(() => {
    const fetchData = async () => {
      // fix any
      try {
        const queryArr: any[] = await queryEndPoints(currUser.userId);
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
    <div className='sidebar'>
      <Typography variant="h5">
        My Endpoints
      </Typography>
      <Box sx={{
        '& > :not(style)': { m: 1, width: '25ch' },
      }}>
      {endpointArray}
      </Box>
    </div>
  )
}

export default Sidebar
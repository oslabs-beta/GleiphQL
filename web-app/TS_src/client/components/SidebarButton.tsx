import Button from '@mui/material/Button';
import React from 'react';
import useStore from '../store';

interface SidebarButtonProps {
  endPointUrl: string;
  endPointId: number;
}

const SidebarButton: React.FC<SidebarButtonProps> = (props) => {
  const { setCurrEndPoint } = useStore();
  const toggleEndPoint = () => {
    setCurrEndPoint(props.endPointId, props.endPointUrl);
  }

  return (
    <div>
      <Button sx={{fontSize: "12px", width: "90%"}} variant='contained' onClick={toggleEndPoint}>{props.endPointUrl}</Button>
    </div>
  )
}

export default SidebarButton
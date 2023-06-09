import Button from '@mui/material/Button';
import React from 'react';
import useStore from '../store';

interface SidebarButtonProps {
  endPointUrl: string
}

const SidebarButton: React.FC<SidebarButtonProps> = (props) => {
  const { setCurrEndPoint } = useStore();
  const toggleEndPoint = () => {
    setCurrEndPoint(props.endPointUrl);
  }

  return (
    <div>
      <Button variant = 'contained' onClick = {toggleEndPoint}>{props.endPointUrl}</Button>
    </div>
  )
}

export default SidebarButton
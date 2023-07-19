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
    <li className='p-1.5'>
      <button className='w-64 h-11 border rounded-md text-sm text-white bg-blue-950 hover:bg-blue-900' onClick={toggleEndPoint}>{props.endPointUrl}</button>
    </li>
  )
}

export default SidebarButton
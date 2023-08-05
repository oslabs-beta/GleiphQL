import { toast } from 'react-toastify';

// alerting notifications by types
const notify = (msg: string, type?: string) : void => {
  switch(type) { 
    case 'success':
      toast.success(msg);
      break;
    case 'error':
      toast.error(msg);
      break;
    default:
      toast(msg, {
        position: 'bottom-right',
      });
  }
};

export default notify;
import { toast } from 'react-toastify';
// Import default CSS styles for react-toastify so that toast notifications work properly with custom id's applied
import 'react-toastify/dist/ReactToastify.css';

// alerting notifications by types
const notify = (msg: string, type?: string) : void => {
  switch(type) { 
    case 'success':
      toast.success(msg, {
        toastId: 'notification-success',
      });
      break;
    case 'error':
      toast.error(msg, {
        toastId: 'notification-error',
      });
      break;
    default:
      toast(msg, {
        position: 'bottom-right',
      });
  }
};

export default notify;
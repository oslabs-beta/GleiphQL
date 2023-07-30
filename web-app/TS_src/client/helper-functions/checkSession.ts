import axios from 'axios';
import { UserResponse, SetStatusFx, SetNumAndStrFx } from '../types';

// check if there is an active session
export default async function checkSession (
  setIsLoggedIn: SetStatusFx,
  setCurrUser: SetNumAndStrFx,
  setIsLoading: SetStatusFx) : Promise<void> {
  try {
    const response: UserResponse = (await axios.get('/api/session')).data;
    if(response.signedIn) {
      setIsLoggedIn(response.signedIn);
      setCurrUser(response.userId || 0, response.userEmail || '');
      setIsLoading(false);
    }
  } catch (err: unknown) {
    if(err instanceof Error) console.log(err.message);
    else console.log('unknown error');
    setIsLoggedIn(false);
    setCurrUser(0, '');
    setIsLoading(false);
  }
};
import axios from 'axios';

export default async function checkSession(
  setIsLoggedIn: (isLoggedIn: boolean) => void, 
  setCurrUser: (currUserId: number, currUserEmail: string) => void,
  setIsLoading: (isLoading: boolean) => void) {
  try {
    const response = await axios.get('/api/session');
    setIsLoggedIn(response.data.signedIn);
    setCurrUser(response.data.userId || 0, response.data.userEmail || '');
    setIsLoading(false);
  } catch (err: any) {
    console.log(err.message);
    setIsLoggedIn(false);
    setCurrUser(0, '');
    setIsLoading(false);
  }
};
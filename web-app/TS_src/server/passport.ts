import { Strategy } from 'passport-local';
import { verifyUser } from './controllers/userController';


const authUser = async (email: string, password: string, done: Function) => {
  try {
    const result = await verifyUser(email, password);
    const authenticatedUser = result.signedIn? { signedIn: result.signedIn, userId: result.userId, userEmail: email } : false;
    return done(null, authenticatedUser);
  } catch(err) {
    done(err);
  }
};

export default function (passport : any) {
  passport.use('local', new Strategy({
    usernameField: 'email'
  }, authUser));
}


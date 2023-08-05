import passportLocal from 'passport-local';
import { verifyUser } from './controllers/userController';
import passport from 'passport';
import { verifiedUserObj } from '../types';

const LocalStrategy = passportLocal.Strategy;

export default function (p: typeof passport) : void {
  p.use('local', new LocalStrategy({
    usernameField: 'email'
  }, async (email, password, done) => {
    try {
      const result: verifiedUserObj = await verifyUser(email, password);
      const authenticatedUser: verifiedUserObj | boolean  = result.signedIn? { signedIn: result.signedIn, userId: result.userId, userEmail: email } : false;
      return done(null, authenticatedUser);
    } catch(err: unknown) {
      return done(err);
    }
  }));
}


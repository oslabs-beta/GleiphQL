import passport from 'passport';
import Auth0Strategy from 'passport-auth0';
import passportJWT from 'passport-jwt';
const JwtStrategy = passportJWT.Strategy;

//@ts-ignore
const auth0Strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL,
  },
  //@ts-ignore
  (accessToken, refreshToken, extraParams, profile, done) => {
    return done(null, profile);
  }
);

const jwtStrategy = new JwtStrategy(
  {
    //@ts-ignore
    jwtFromRequest: (req) => req.session.jwt,
    secretOrKey: process.env.JWT_SECRET_KEY,
  },
  (payload, done) => {
    return done(null, payload);
  }
);

passport.use(auth0Strategy);
passport.use(jwtStrategy);

export default passport;
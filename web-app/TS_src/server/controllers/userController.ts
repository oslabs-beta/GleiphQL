import db from '../models/dbModel';
import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcryptjs';
import { verifiedUserObj, AsyncMiddleWare } from '../../types';

interface UserCredentials {
  user_id: number;
  email: string;
  password: string;
}

interface UserController {
  checkUserExists: AsyncMiddleWare;
  register: AsyncMiddleWare;
  deleteUser: AsyncMiddleWare;
}


const SALT_WORK_FACTOR: number = 10;


// look up user in Users table by email
const searchUser = async (email: string) : Promise<UserCredentials | null> => {
  const sqlCommand: string = `
    SELECT * FROM users WHERE email = $1;
  `;
  const values: string[] = [ email ];
  try {
    const result: UserCredentials[] = (await db.query(sqlCommand, values)).rows;
    return result[0];
  } catch(err: unknown) {
    console.log('error in searchUser: error in searching user in the database');
  }
  return null;
}

// verify user credentials
export const verifyUser =  async (email: string, password: string) : Promise<verifiedUserObj> => {
  let signedIn: boolean = false;
  let userId: number = 0;
  const result: UserCredentials | null = await searchUser(email);
  if(result) {
    const matched: boolean = await bcrypt.compare(password, result.password);
    if(matched) {
      signedIn = true;
      userId = result.user_id;
    }
  }
  return {
    signedIn,
    userId,
    userEmail: email,
  };
};

const userController : UserController = {
  // check if user exists
  checkUserExists: async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) return next({
      log: 'Error in userController.checkUserExists: not given all necessary inputs',
      status: 400,
      message: { error: 'Did not receive necessary inputs to check if a user exists' }
    });
    try {
      const result: UserCredentials | null = await searchUser(email);
      if(result) res.locals.userExists = true;
      else res.locals.userExists = false;
    } catch(err: unknown) {
      return next({
        log: 'Error in userController.userExists: ' + err,
        status: 400,
        message: { error: 'Could not check if user already exists' }
      });
    }
    return next();
  },
  // register a new user account
  register: async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    // before adding a new account, check if a user with the credentials already exist
    if(res.locals.userExists) res.locals.userCreated = false;
    else {
      const { email, password } = req.body;
      const sqlCommand: string = `
        INSERT INTO users (email, password)
        VALUES ($1, $2)
        RETURNING *;
      `;
      try {
        // hash password
        const hashedPW: string = await bcrypt.hash(password, SALT_WORK_FACTOR);
        const values: string[] = [ email, hashedPW ];
        const result: UserCredentials[] = (await db.query(sqlCommand, values)).rows;
        res.locals.userCreated = true;
        res.locals.userId = result[0].user_id;
      } catch (err: unknown) {
        return next({
          log: 'Error in userController.register: ' + err,
          status: 400,
          message: { error: 'Could not successfully add a new user' }
        });
      }
    }
    return next();
  },
  deleteUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next({
        log: 'Error in userController.deleteUser: not given all necessary inputs',
        status: 400,
        message: { error: 'Did not receive necessary inputs to delete a user' },
      });
    }

    try {
      // Verify the user's credentials before proceeding with deletion
      const user: verifiedUserObj = await verifyUser(email, password);
      if (!user.signedIn) {
        return next ({
          log: 'Error in userController.deleteUser: invalid credentials',
          status: 401, 
          message: { error: 'Invalid credentials. Cannot delete user.' },
        });
      }
      // Perform the account deletion in database
      const sqlCommand: string = `
        DELETE FROM users WHERE email = $1;  
      `;
      const values: string[] = [email];
      await db.query(sqlCommand, values);

      res.locals.deleted = true;
      return next(); // Resolve the Promise with a 'void'
    } catch (err: unknown) {
      return next({
        log: 'Error in userController.deleteUser: could not delete user',
        status: 500,
        message: { error: 'Could not delete user' },
      });
    }
  } 
};

export default userController;

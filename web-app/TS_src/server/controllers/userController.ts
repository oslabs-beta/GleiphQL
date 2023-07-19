import db from '../models/dbModel';
import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcryptjs';

const SALT_WORK_FACTOR = 10;

const searchUser = async (email: string) => {
  const sqlCommand: string = `
  SELECT * FROM users WHERE email = $1;
  `;
  const values: string[] = [ email ];
  let result;
  try {
    result = await db.query(sqlCommand, values);
  } catch(err: any) {
    console.log('error in searchUser: error in searching user in the database')
  }
  return result;
}

export const verifyUser =  async (email: string, password: string) => {
  let signedIn: boolean = false;
  let userId;
  const result = await searchUser(email);
  if(result && result.rows[0]) {
    const matched: boolean = await bcrypt.compare(password, result.rows[0].password);
    if(matched) {
      signedIn = true;
      userId = result.rows[0].user_id;
    }
  }
  return {
    signedIn,
    userId,
    userEmail: email,
  };
};

const userController = {
  checkUserExists: async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) return next({
      log: 'Error in userController.checkUserExists: not given all necessary inputs',
      status: 400,
      message: { error: 'Did not receive necessary inputs to check if a user exists' }
    });
    try {
      const result = await searchUser(email);
      if(result && result.rows[0]) res.locals.userExists = true;
      else res.locals.userExists = false;
    } catch(err: any) {
      return next({
        log: 'Error in userController.userExists: could not check if a user already exists',
        status: 400,
        message: { error: err.message }
      });
    }
    return next();
  },
  register: async (req: Request, res: Response, next: NextFunction) => {
    console.log(res.locals.userExists);
    if(res.locals.userExists) res.locals.userCreated = false;
    else {
      const { email, password } = req.body;
      const sqlCommand: string = `
        INSERT INTO users (email, password)
        VALUES ($1, $2)
        RETURNING *;
      `;
      try {
        const hashedPW: string = await bcrypt.hash(password, SALT_WORK_FACTOR);
        const values: string[] = [ email, hashedPW ];
        const result: any = await db.query(sqlCommand, values);
        res.locals.userCreated = true;
        res.locals.userId = result.rows[0].user_id;
      } catch (err: any) {
        return next({
          log: 'Error in userController.register: could not add a new user',
          status: 400,
          message: { error: err.message }
        });
      }
    }
    return next();
  },
};

export default userController;
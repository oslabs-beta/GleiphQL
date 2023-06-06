import db from '../models/dbModel';
import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcryptjs';

const SALT_WORK_FACTOR = 10;

const userController = {
  checkUserExists: async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) return next({
      log: 'Error in userController.checkUserExists: not given all necessary inputs',
      status: 400,
      message: { error: 'Did not receive necessary inputs to check if a user exists' }
    });
    try {
      const sqlCommand: string = `
      SELECT * FROM users WHERE email = $1;
      `;
      const values: string[] = [ email ];
      const result: any = await db.query(sqlCommand, values);
      if(result.rows[0] === undefined) {
        res.locals.userExists = false;
      } else {
        res.locals.userExists = true;
        res.locals.userId = result.rows[0].user_id;
        res.locals.userPW = result.rows[0].password;
      }
      return next();
    } catch(err: any) {
      return next({
        log: 'Error in userController.userExists: checking if a user already exists',
        status: 400,
        message: { error: err.message }
      });
    }
  }, 
  register: async (req: Request, res: Response, next: NextFunction) => {
    if(res.locals.userExists) res.locals.userCreated = false;
    else try {
      const { email, password } = req.body;
      const sqlCommand = `
        INSERT INTO users (email, password)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const hashedPW: string = await bcrypt.hash(password, SALT_WORK_FACTOR);
      const values: string[] = [ email, hashedPW ];
      const result: any = await db.query(sqlCommand, values);
      res.locals.userCreated = true;
      res.locals.userId = result.rows[0].user_id;
    } catch (err: any) {
      return next({
        log: 'Error in userController.register: adding a new user',
        status: 400,
        message: { error: err.message }
      });
    }
    return next();
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    res.locals.signIn = false;
    try {
      const { password } = req.body;
      const matched: boolean = await bcrypt.compare(password, res.locals.userPW);
      if (matched) {
        res.locals.signIn = true;
      }
    } catch(err: any) {
      return next({
        log: 'Error in userController.login: verifying login credentials',
        status: 400,
        message: { error: err.message }
      });
    }
    return next();
  }
};

export default userController;
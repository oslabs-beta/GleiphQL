import * as pg from 'pg';

const PG_URI = process.env.PG_URI;

const pool: pg.Pool = new pg.Pool({
    connectionString: PG_URI,
}); 

const db = {
  query: (text: string, params: any[]) => {
    return pool.query(text, params);
  }
};

export default db;
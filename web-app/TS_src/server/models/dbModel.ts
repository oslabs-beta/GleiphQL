import * as pg from 'pg';

const PG_URI: string = process.env.PG_URI || '';

export const pool: pg.Pool = new pg.Pool({
    connectionString: PG_URI,
});

const db = {
  query: (text: string, params?: any[]) : Promise<pg.QueryResult> => {
    return pool.query(text, params);
  }
};

export default db;
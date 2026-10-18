import pg, { QueryConfigValues, QueryResult, QueryResultRow } from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export const query = <R extends QueryResultRow = QueryResultRow, I extends unknown[] = unknown[]>(
  text: string,
  params?: I
): Promise<QueryResult<R>> => {
  return params === undefined
    ? pool.query<R>(text)
    : pool.query<R, I>({ text, values: params as QueryConfigValues<I> });
};

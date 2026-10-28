// src/persistencia/db.ts
// PostgreSQL connection pool factory and transaction helper.
import pg from 'pg';

export type Db = pg.Pool;
export type Tx = pg.PoolClient;

/**
 * Creates a pg.Pool connected to the given connection string.
 * The caller is responsible for calling pool.end() when done.
 */
export function crearPool(url: string): Db {
  return new pg.Pool({ connectionString: url, max: 5 });
}

/**
 * Executes fn inside a transaction; rolls back on any error.
 */
export async function conTransaccion<T>(db: Db, fn: (tx: Tx) => Promise<T>): Promise<T> {
  const tx = await db.connect();
  try {
    await tx.query('BEGIN');
    const r = await fn(tx);
    await tx.query('COMMIT');
    return r;
  } catch (e) {
    await tx.query('ROLLBACK');
    throw e;
  } finally {
    tx.release();
  }
}

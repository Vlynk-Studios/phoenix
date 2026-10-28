// src/persistencia/db.ts
// PostgreSQL connection pool factory.
import pg from 'pg';

/**
 * Creates and returns a pg.Pool connected to the given DATABASE_URL.
 * The caller is responsible for calling pool.end() when done.
 */
export function crearPool(connectionString: string): pg.Pool {
  return new pg.Pool({ connectionString });
}

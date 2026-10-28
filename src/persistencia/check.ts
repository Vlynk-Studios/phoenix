// src/persistencia/check.ts
// Quick connectivity check against the application database.
// Run with: pnpm db:check
import { crearPool } from './db.ts';

const db = crearPool(process.env.DATABASE_URL!);
const r = await db.query('SELECT version(), current_database() AS bd');
console.log('OK:', r.rows[0]!.bd, '|', r.rows[0]!.version);
await db.end();

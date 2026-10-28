// src/persistencia/migrar.ts
// Applies pending SQL migrations from db/migrations/ in alphabetical order.
// Idempotent: already-applied migrations are skipped.
// Run with: pnpm migrar
// Run against test DB: $env:DATABASE_URL=$env:DATABASE_URL_TEST; pnpm migrar
import { readdir, readFile } from 'node:fs/promises';
import { crearPool, conTransaccion } from './db.ts';

const db = crearPool(process.env.DATABASE_URL!);

// Create migrations tracking table if it does not exist
await db.query(`
  CREATE TABLE IF NOT EXISTS migraciones (
    nombre      TEXT PRIMARY KEY,
    aplicada_en TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

const applied = new Set(
  (await db.query('SELECT nombre FROM migraciones')).rows.map((r: { nombre: string }) => r.nombre),
);

const files = (await readdir('db/migrations'))
  .filter((f) => f.endsWith('.sql'))
  .sort();

for (const f of files) {
  if (applied.has(f)) {
    console.log('Already applied:', f);
    continue;
  }
  const sql = await readFile(`db/migrations/${f}`, 'utf8');
  await conTransaccion(db, async (tx) => {
    await tx.query(sql);
    await tx.query('INSERT INTO migraciones (nombre) VALUES ($1)', [f]);
  });
  console.log('Migration applied:', f);
}

await db.end();
console.log('Done.');

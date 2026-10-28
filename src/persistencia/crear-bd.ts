// src/persistencia/crear-bd.ts
// Idempotent script: creates the application role and databases.
// Reads credentials from ADMIN_DATABASE_URL, DATABASE_URL, DATABASE_URL_TEST.
// Run once with: pnpm db:crear
import pg from 'pg';

const admin = new pg.Client({ connectionString: process.env.ADMIN_DATABASE_URL });
await admin.connect();

const IDENT = /^[a-z_][a-z0-9_]*$/;

function parseUrl(url: string): { usuario: string; clave: string; base: string } {
  const u = new URL(url);
  const usuario = decodeURIComponent(u.username);
  const clave = decodeURIComponent(u.password);
  const base = u.pathname.slice(1);
  if (!IDENT.test(usuario) || !IDENT.test(base)) {
    throw new Error(`Invalid identifier in URL: ${usuario}/${base}`);
  }
  return { usuario, clave, base };
}

const targets = [process.env.DATABASE_URL!, process.env.DATABASE_URL_TEST!].map(parseUrl);

for (const { usuario, clave, base } of targets) {
  // Create role if it does not exist
  const rol = await admin.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [usuario]);
  if (rol.rowCount === 0) {
    await admin.query(
      `CREATE ROLE ${admin.escapeIdentifier(usuario)} LOGIN PASSWORD ${admin.escapeLiteral(clave)}`,
    );
    console.log('Role created:', usuario);
  } else {
    console.log('Role already exists:', usuario);
  }

  // Create database if it does not exist
  const bd = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [base]);
  if (bd.rowCount === 0) {
    await admin.query(
      `CREATE DATABASE ${admin.escapeIdentifier(base)} OWNER ${admin.escapeIdentifier(usuario)}`,
    );
    console.log('Database created:', base);
  } else {
    console.log('Database already exists:', base);
  }
}

await admin.end();
console.log('Done.');

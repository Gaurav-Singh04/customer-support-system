import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDatabaseClient } from './client';

async function runMigrations() {
  const { db, pool } = createDatabaseClient();

  try {
    await migrate(db, {
      migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)),
    });

    console.log('Applied Drizzle migrations.');
  } finally {
    await pool.end();
  }
}

runMigrations().catch((error) => {
  console.error('Failed to apply Drizzle migrations.', error);
  process.exitCode = 1;
});

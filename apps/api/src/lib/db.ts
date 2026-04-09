import { createDatabaseClient } from '@swades/db';

let instance: ReturnType<typeof createDatabaseClient> | null = null;

export function getDb() {
  if (!instance) {
    instance = createDatabaseClient();
  }
  return instance;
}

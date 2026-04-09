export * from './client';
export * from './schema';

export function createDbStatus() {
  return process.env.DATABASE_URL ? 'configured' : 'missing-database-url';
}

import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Drizzle-kit commands might fail if run locally without .env');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});

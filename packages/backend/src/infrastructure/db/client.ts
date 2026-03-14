import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '@/infrastructure/db/schema.js';

const sqlite = new Database('db.sqlite');
export const db = drizzle(sqlite, { schema });

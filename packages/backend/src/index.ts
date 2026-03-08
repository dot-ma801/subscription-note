import { serve } from '@hono/node-server';
import { createApp } from './presentation/app.js';
import { createDb } from './infrastructure/database/db.js';

const db = createDb('./data/app.db');
const app = createApp(db);

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});

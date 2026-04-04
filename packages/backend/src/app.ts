import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '@/infrastructure/db/client';
import { createRecurringPaymentsRoute } from '@/presentation/routes/recurringPayments';

export const app = new Hono();

app.onError((err, c) => {
  console.error(err);

  if (err instanceof z.ZodError) {
    return c.json(
      {
        errors: err.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      400,
    );
  }

  return c.json({ message: 'Internal server error' }, 500);
});

app.route('/api/recurring-payments', createRecurringPaymentsRoute(db));

export type AppType = typeof app;

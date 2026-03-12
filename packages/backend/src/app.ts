import { Hono } from 'hono';
import { z } from 'zod';
import { recurringPaymentsRoute } from './presentation/routes/recurringPayments.js';

export const app = new Hono();

app.onError((err, c) => {
  console.error(err);

  if (err instanceof z.ZodError) {
    return c.json(
      {
        errors: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      400,
    );
  }

  return c.json({ message: 'Internal server error' }, 500);
});

app.route('/api/recurring-payments', recurringPaymentsRoute);

export type AppType = typeof app;

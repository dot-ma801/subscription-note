import { Hono } from 'hono';
import type { drizzle } from 'drizzle-orm/better-sqlite3';
import { DrizzleRecurringPaymentRepository } from '@/infrastructure/repositories/DrizzleRecurringPaymentRepository';
import { GetAllRecurringPaymentsUseCase } from '@/usecases/GetAllRecurringPaymentsUseCase';
import { GetRecurringPaymentByIdUseCase, NotFoundError } from '@/usecases/GetRecurringPaymentByIdUseCase';

type Db = ReturnType<typeof drizzle>;

export function createRecurringPaymentsRoute(db: Db) {
  const route = new Hono();

  route.get('/', async (c) => {
    const repository = new DrizzleRecurringPaymentRepository(db);
    const useCase = new GetAllRecurringPaymentsUseCase(repository);
    const payments = await useCase.execute();
    return c.json(payments);
  });

  route.get('/:id', async (c) => {
    const id = c.req.param('id');
    const repository = new DrizzleRecurringPaymentRepository(db);
    const useCase = new GetRecurringPaymentByIdUseCase(repository);

    try {
      const payment = await useCase.execute(id);
      return c.json(payment);
    } catch (err) {
      if (err instanceof NotFoundError) {
        return c.json({ message: 'RecurringPayment not found' }, 404);
      }
      throw err;
    }
  });

  return route;
}

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { DrizzleRecurringPaymentRepository } from '@/infrastructure/repositories/DrizzleRecurringPaymentRepository';
import { GetAllRecurringPaymentsUseCase } from '@/usecases/GetAllRecurringPaymentsUseCase';
import { GetRecurringPaymentByIdUseCase, NotFoundError } from '@/usecases/GetRecurringPaymentByIdUseCase';
import { CreateRecurringPaymentUseCase } from '@/usecases/CreateRecurringPaymentUseCase';
import { UpdateRecurringPaymentUseCase } from '@/usecases/UpdateRecurringPaymentUseCase';
import { CreateRecurringPaymentSchema, UpdateRecurringPaymentSchema } from '@subscription-note/shared';
import type * as schema from '@/infrastructure/db/schema';

type Db = BetterSQLite3Database<typeof schema>;

// テストでインメモリ DB を注入できるよう、ファクトリ関数として export する（DI パターン）。
// 本番では app.ts から本物の db を渡し、テストでは :memory: の db を渡す。
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

  route.post('/', zValidator('json', CreateRecurringPaymentSchema), async (c) => {
    const body = c.req.valid('json');
    const repository = new DrizzleRecurringPaymentRepository(db);
    const useCase = new CreateRecurringPaymentUseCase(repository);
    const payment = await useCase.execute(body);
    return c.json(payment, 201);
  });

  route.put('/:id', zValidator('json', UpdateRecurringPaymentSchema), async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const repository = new DrizzleRecurringPaymentRepository(db);
    const useCase = new UpdateRecurringPaymentUseCase(repository);

    try {
      const payment = await useCase.execute(id, body);
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

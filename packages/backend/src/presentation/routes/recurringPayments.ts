import { Hono } from 'hono';
import { db } from '@/infrastructure/db/client';
import { DrizzleRecurringPaymentRepository } from '@/infrastructure/repositories/DrizzleRecurringPaymentRepository';
import { GetAllRecurringPaymentsUseCase } from '@/usecases/GetAllRecurringPaymentsUseCase';
import { GetRecurringPaymentByIdUseCase, NotFoundError } from '@/usecases/GetRecurringPaymentByIdUseCase';

export const recurringPaymentsRoute = new Hono();

recurringPaymentsRoute.get('/', async (c) => {
  const repository = new DrizzleRecurringPaymentRepository(db);
  const useCase = new GetAllRecurringPaymentsUseCase(repository);
  const payments = await useCase.execute();
  return c.json(payments);
});

recurringPaymentsRoute.get('/:id', async (c) => {
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

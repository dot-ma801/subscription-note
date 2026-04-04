import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { IRecurringPaymentRepository } from '@/domain/repositories/IRecurringPaymentRepository';
import { GetAllRecurringPaymentsUseCase } from '@/usecases/GetAllRecurringPaymentsUseCase';
import { GetRecurringPaymentByIdUseCase, NotFoundError } from '@/usecases/GetRecurringPaymentByIdUseCase';
import { CreateRecurringPaymentUseCase } from '@/usecases/CreateRecurringPaymentUseCase';
import { UpdateRecurringPaymentUseCase } from '@/usecases/UpdateRecurringPaymentUseCase';
import { CancelRecurringPaymentUseCase, AlreadyCancelledError } from '@/usecases/CancelRecurringPaymentUseCase';
import { CreateRecurringPaymentSchema, UpdateRecurringPaymentSchema } from '@subscription-note/shared';

export function createRecurringPaymentsRoute(repository: IRecurringPaymentRepository) {
  const route = new Hono();

  const getAllUseCase = new GetAllRecurringPaymentsUseCase(repository);
  const getByIdUseCase = new GetRecurringPaymentByIdUseCase(repository);
  const createUseCase = new CreateRecurringPaymentUseCase(repository);
  const updateUseCase = new UpdateRecurringPaymentUseCase(repository);
  const cancelUseCase = new CancelRecurringPaymentUseCase(repository);

  route.get('/', async (c) => {
    const payments = await getAllUseCase.execute();
    return c.json(payments);
  });

  route.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const payment = await getByIdUseCase.execute(id);
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
    const payment = await createUseCase.execute(body);
    return c.json(payment, 201);
  });

  route.put('/:id', zValidator('json', UpdateRecurringPaymentSchema), async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');

    try {
      const payment = await updateUseCase.execute(id, body);
      return c.json(payment);
    } catch (err) {
      if (err instanceof NotFoundError) {
        return c.json({ message: 'RecurringPayment not found' }, 404);
      }
      throw err;
    }
  });

  route.delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      await cancelUseCase.execute(id);
      return c.body(null, 204);
    } catch (err) {
      if (err instanceof NotFoundError) {
        return c.json({ message: 'RecurringPayment not found' }, 404);
      }
      if (err instanceof AlreadyCancelledError) {
        return c.json({ message: 'すでに解約済みです' }, 409);
      }
      throw err;
    }
  });

  return route;
}

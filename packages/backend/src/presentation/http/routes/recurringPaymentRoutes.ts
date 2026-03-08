import { Hono } from 'hono';
import {
  CreateRecurringPaymentSchema,
  UpdateRecurringPaymentSchema,
} from '@subscription-note/shared';
import type { CreateRecurringPaymentUseCase } from '../../../application/usecases/CreateRecurringPaymentUseCase.js';
import type { GetRecurringPaymentUseCase } from '../../../application/usecases/GetRecurringPaymentUseCase.js';
import type { GetAllRecurringPaymentsUseCase } from '../../../application/usecases/GetAllRecurringPaymentsUseCase.js';
import type { UpdateRecurringPaymentUseCase } from '../../../application/usecases/UpdateRecurringPaymentUseCase.js';
import type { DeleteRecurringPaymentUseCase } from '../../../application/usecases/DeleteRecurringPaymentUseCase.js';

export interface UseCases {
  create: CreateRecurringPaymentUseCase;
  get: GetRecurringPaymentUseCase;
  getAll: GetAllRecurringPaymentsUseCase;
  update: UpdateRecurringPaymentUseCase;
  delete: DeleteRecurringPaymentUseCase;
}

export function createRecurringPaymentRoutes(useCases: UseCases) {
  return new Hono()
    .post('/api/recurring-payments', async (c) => {
      const body = await c.req.json();
      const validated = CreateRecurringPaymentSchema.parse(body);
      const result = await useCases.create.execute(validated);
      return c.json(result, 201);
    })
    .get('/api/recurring-payments', async (c) => {
      const result = await useCases.getAll.execute();
      return c.json(result, 200);
    })
    .get('/api/recurring-payments/:id', async (c) => {
      const id = c.req.param('id');
      const result = await useCases.get.execute(id);
      return c.json(result, 200);
    })
    .put('/api/recurring-payments/:id', async (c) => {
      const id = c.req.param('id');
      const body = await c.req.json();
      const validated = UpdateRecurringPaymentSchema.parse(body);
      const result = await useCases.update.execute(id, validated);
      return c.json(result, 200);
    })
    .delete('/api/recurring-payments/:id', async (c) => {
      const id = c.req.param('id');
      await useCases.delete.execute(id);
      return c.body(null, 204);
    });
}

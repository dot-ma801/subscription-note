import { Hono } from 'hono';
import { errorHandler } from './http/middlewares/errorHandler.js';
import { createRecurringPaymentRoutes } from './http/routes/recurringPaymentRoutes.js';
import type { AppDatabase } from '../infrastructure/database/db.js';
import { RecurringPaymentRepository } from '../infrastructure/repositories/RecurringPaymentRepository.js';
import { CreateRecurringPaymentUseCase } from '../application/usecases/CreateRecurringPaymentUseCase.js';
import { GetRecurringPaymentUseCase } from '../application/usecases/GetRecurringPaymentUseCase.js';
import { GetAllRecurringPaymentsUseCase } from '../application/usecases/GetAllRecurringPaymentsUseCase.js';
import { UpdateRecurringPaymentUseCase } from '../application/usecases/UpdateRecurringPaymentUseCase.js';
import { DeleteRecurringPaymentUseCase } from '../application/usecases/DeleteRecurringPaymentUseCase.js';

export function createApp(db: AppDatabase) {
  const repository = new RecurringPaymentRepository(db);

  const useCases = {
    create: new CreateRecurringPaymentUseCase(repository),
    get: new GetRecurringPaymentUseCase(repository),
    getAll: new GetAllRecurringPaymentsUseCase(repository),
    update: new UpdateRecurringPaymentUseCase(repository),
    delete: new DeleteRecurringPaymentUseCase(repository),
  };

  const routes = createRecurringPaymentRoutes(useCases);

  const app = new Hono();
  app.onError(errorHandler);
  app.route('/', routes);

  return app;
}

export type AppType = ReturnType<typeof createApp>;

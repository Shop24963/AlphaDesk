import { Router } from 'express';
import { authenticate } from '../../auth/middleware/auth.middleware';
import { backtestController } from './backtest.controller';

const router = Router();

router.use(authenticate);

router.post('/', backtestController.create.bind(backtestController));
router.get('/', backtestController.getAll.bind(backtestController));
router.get('/:id', backtestController.getById.bind(backtestController));
router.put('/:id/status', backtestController.updateStatus.bind(backtestController));
router.post('/:id/run', backtestController.run.bind(backtestController));
router.delete('/:id', backtestController.delete.bind(backtestController));

export { router as backtestRoutes };

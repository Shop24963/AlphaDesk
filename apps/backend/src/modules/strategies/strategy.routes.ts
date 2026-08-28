import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { strategyController } from './strategy.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', strategyController.create.bind(strategyController));
router.get('/', strategyController.getAll.bind(strategyController));
router.get('/:id', strategyController.getById.bind(strategyController));
router.put('/:id', strategyController.update.bind(strategyController));
router.delete('/:id', strategyController.delete.bind(strategyController));
router.post('/:id/toggle', strategyController.toggle.bind(strategyController));
router.put('/:id/backtest', strategyController.updateBacktestStats.bind(strategyController));

export default router;

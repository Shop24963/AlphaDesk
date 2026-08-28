import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { portfolioController } from './portfolio.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', portfolioController.create.bind(portfolioController));
router.get('/', portfolioController.getAll.bind(portfolioController));
router.get('/:id', portfolioController.getById.bind(portfolioController));
router.put('/:id', portfolioController.update.bind(portfolioController));
router.delete('/:id', portfolioController.delete.bind(portfolioController));
router.get('/:id/transactions', portfolioController.getTransactions.bind(portfolioController));
router.post('/:id/transactions', portfolioController.addTransaction.bind(portfolioController));

export default router;

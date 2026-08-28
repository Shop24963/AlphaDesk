import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { watchlistController } from './watchlist.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', watchlistController.create.bind(watchlistController));
router.get('/', watchlistController.getAll.bind(watchlistController));
router.get('/:id', watchlistController.getById.bind(watchlistController));
router.put('/:id', watchlistController.update.bind(watchlistController));
router.delete('/:id', watchlistController.delete.bind(watchlistController));
router.post('/:id/symbols', watchlistController.addSymbol.bind(watchlistController));
router.delete('/:id/symbols', watchlistController.removeSymbol.bind(watchlistController));

export default router;

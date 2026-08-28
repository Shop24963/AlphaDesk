import { Router } from 'express';
import { stockController } from './stock.controller';

const router = Router();

router.get('/', stockController.getAll.bind(stockController));
router.get('/sectors', stockController.getSectors.bind(stockController));
router.get('/industries', stockController.getIndustries.bind(stockController));
router.get('/:id', stockController.getById.bind(stockController));
router.get('/symbol/:symbol/exchange/:exchange', stockController.getBySymbol.bind(stockController));
router.get('/quote/:symbol/exchange/:exchange', stockController.getQuote.bind(stockController));

export { router as stockRoutes };

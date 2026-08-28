import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { tradingController } from './trading.controller';

const router = Router();

router.use(authenticate);

// Paper Trading Account Routes
router.post('/account', tradingController.createAccount.bind(tradingController));
router.get('/account', tradingController.getAccounts.bind(tradingController));
router.get('/account/:id', tradingController.getAccountById.bind(tradingController));
router.post('/account/:accountId/order', tradingController.placeOrder.bind(tradingController));
router.get('/account/:accountId/orders', tradingController.getOrders.bind(tradingController));
router.delete('/account/:accountId/orders/:orderId', tradingController.cancelOrder.bind(tradingController));
router.post('/account/:accountId/update-holdings', tradingController.updateHoldings.bind(tradingController));

export { router as tradingRoutes };

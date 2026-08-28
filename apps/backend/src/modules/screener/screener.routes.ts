import { Router } from 'express';
import { screenerController } from './screener.controller';

const router = Router();

router.get('/', screenerController.screenStocks.bind(screenerController));
router.get('/swing', screenerController.swingScanner.bind(screenerController));
router.get('/positional', screenerController.positionalScanner.bind(screenerController));
router.get('/relative-strength', screenerController.relativeStrength.bind(screenerController));

export { router as screenerRoutes };

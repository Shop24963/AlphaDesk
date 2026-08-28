import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { alertController } from './alert.controller';

const router = Router();

router.use(authenticate);

router.post('/', alertController.create.bind(alertController));
router.get('/', alertController.getAll.bind(alertController));
router.put('/:id', alertController.update.bind(alertController));
router.delete('/:id', alertController.delete.bind(alertController));
router.patch('/:id/toggle', alertController.toggle.bind(alertController));
router.post('/:id/trigger', alertController.trigger.bind(alertController));

export { router as alertRoutes };

import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { alertController } from './alert.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', alertController.create.bind(alertController));
router.get('/', alertController.getAll.bind(alertController));
router.put('/:id', alertController.update.bind(alertController));
router.delete('/:id', alertController.delete.bind(alertController));
router.post('/:id/toggle', alertController.toggle.bind(alertController));
router.post('/:id/trigger', alertController.trigger.bind(alertController));

export default router;

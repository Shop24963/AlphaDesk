import { Router } from 'express';
import { journalController } from './journal.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

// All routes are protected
router.use(protect);

// Get journal statistics
router.get('/stats', journalController.getStats.bind(journalController));

// Get tags cloud
router.get('/tags', journalController.getTags.bind(journalController));

// Get all entries (with filtering and pagination)
router.get('/', journalController.getEntries.bind(journalController));

// Get single entry by ID
router.get('/:id', journalController.getEntry.bind(journalController));

// Create new entry
router.post('/', journalController.createEntry.bind(journalController));

// Update entry
router.put('/:id', journalController.updateEntry.bind(journalController));

// Delete entry
router.delete('/:id', journalController.deleteEntry.bind(journalController));

export default router;

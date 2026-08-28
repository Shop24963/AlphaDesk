import { Router } from 'express';
import { calculatorsController } from './calculators.controller.js';

const router = Router();

// Position size calculator
router.post('/position-size', calculatorsController.calculatePositionSize.bind(calculatorsController));

// Risk-reward calculator
router.post('/risk-reward', calculatorsController.calculateRiskReward.bind(calculatorsController));

// Break-even calculator
router.post('/break-even', calculatorsController.calculateBreakEven.bind(calculatorsController));

// Portfolio allocation calculator
router.post('/portfolio-allocation', calculatorsController.calculatePortfolioAllocation.bind(calculatorsController));

// Compound interest calculator
router.post('/compound-interest', calculatorsController.calculateCompoundInterest.bind(calculatorsController));

// Margin and leverage calculator
router.post('/margin', calculatorsController.calculateMargin.bind(calculatorsController));

export default router;

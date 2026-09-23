import { Router } from 'express';
import protect from '../middleware/auth.js';
import {
  listExpenses,
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import validate from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

router.use(protect);

const expenseValidation = z.object({
  amount: z.number().min(0.01),
  category: z.enum([
    'food', 'transport', 'housing', 'utilities', 'entertainment',
    'healthcare', 'shopping', 'education', 'travel', 'other',
  ]),
  description: z.string().trim().min(1).max(500),
  date: z.string().optional(),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other']).optional(),
});

router.route('/')
  .get(listExpenses)
  .post(validate(expenseValidation), createExpense);

const updateValidation = expenseValidation.partial();

router.route('/:id')
  .get(getExpense)
  .put(validate(updateValidation), updateExpense)
  .delete(deleteExpense);

export default router;

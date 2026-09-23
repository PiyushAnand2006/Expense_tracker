import { Router } from 'express';
import protect from '../middleware/auth.js';
import { getSummary, getByCategory, getByTime } from '../controllers/reportController.js';
import validate from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

router.use(protect);

const reportFilterValidation = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  months: z.coerce.number().int().min(1).max(24).optional(),
});

router.route('/summary').get(validate(reportFilterValidation), getSummary);
router.route('/by-category').get(validate(reportFilterValidation), getByCategory);
router.route('/by-time').get(validate(reportFilterValidation), getByTime);

export default router;

import Expense from '../models/Expense.js';
import mongoose from 'mongoose';
import { z } from 'zod';

const reportFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  months: z.coerce.number().optional(),
});

// GET /api/v1/reports/summary — total, count, average
export const getSummary = async (req, res, next) => {
  try {
    const parsed = reportFilterSchema.parse(req.query);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const filter = { userId };

    if (parsed.startDate) filter.date = { ...filter.date, $gte: new Date(parsed.startDate) };
    if (parsed.endDate) filter.date = { ...filter.date, $lte: new Date(parsed.endDate) };

    const result = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
        },
      },
    ]);

    const data = result[0] || { totalAmount: 0, count: 0, averageAmount: 0 };
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/reports/by-category — grouped by category
export const getByCategory = async (req, res, next) => {
  try {
    const parsed = reportFilterSchema.parse(req.query);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const filter = { userId };

    if (parsed.startDate) {
      filter.date = { ...filter.date, $gte: new Date(parsed.startDate) };
    } else if (parsed.months) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parsed.months);
      filter.date = { ...filter.date, $gte: startDate };
    }

    if (parsed.endDate) filter.date = { ...filter.date, $lte: new Date(parsed.endDate) };

    const result = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/reports/by-time — time series / monthly trend
export const getByTime = async (req, res, next) => {
  try {
    const parsed = reportFilterSchema.parse(req.query);
    const months = parsed.months || 6;
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const filter = { userId };

    if (parsed.startDate) {
      filter.date = { ...filter.date, $gte: new Date(parsed.startDate) };
    } else {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      filter.date = { ...filter.date, $gte: startDate };
    }

    if (parsed.endDate) filter.date = { ...filter.date, $lte: new Date(parsed.endDate) };

    const result = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

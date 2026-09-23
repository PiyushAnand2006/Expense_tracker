import Expense from '../models/Expense.js';
import { z } from 'zod';

const expenseSchema = z.object({
  amount: z.number().min(0.01),
  category: z.enum([
    'food', 'transport', 'housing', 'utilities', 'entertainment',
    'healthcare', 'shopping', 'education', 'travel', 'other',
  ]),
  description: z.string().trim().min(1).max(500),
  date: z.string().optional(),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other']).optional(),
});

const updateSchema = expenseSchema.partial();

// GET /api/v1/expenses — list with optional filters
export const listExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { userId: req.user._id };

    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const [total, expenses] = await Promise.all([
      Expense.countDocuments(filter),
      Expense.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
    ]);

    res.json({
      success: true,
      data: { expenses, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/expenses — create
export const createExpense = async (req, res, next) => {
  try {
    const parsed = expenseSchema.parse(req.body);
    const expense = await Expense.create({
      ...parsed,
      userId: req.user._id,
      date: parsed.date ? new Date(parsed.date) : new Date(),
    });
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/expenses/:id — single
export const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/expenses/:id — update
export const updateExpense = async (req, res, next) => {
  try {
    const parsed = updateSchema.parse(req.body);
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: parsed },
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/expenses/:id — delete
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

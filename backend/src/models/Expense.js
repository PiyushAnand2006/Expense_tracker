import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'food',
        'transport',
        'housing',
        'utilities',
        'entertainment',
        'healthcare',
        'shopping',
        'education',
        'travel',
        'other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description must be at most 500 characters'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other'],
      default: 'cash',
    },
  },
  { timestamps: true }
);

// Aggregate expenses by day for a user
expenseSchema.statics.getDailySummary = async function (userId, startDate, endDate) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  return this.aggregate([
    {
      $match: {
        userId: userObjectId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Aggregate expenses by category for a user
expenseSchema.statics.getCategorySummary = async function (userId, startDate, endDate) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  return this.aggregate([
    {
      $match: {
        userId: userObjectId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);
};

// Get monthly trend for a user
expenseSchema.statics.getMonthlyTrend = async function (userId, months = 6) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  return this.aggregate([
    {
      $match: {
        userId: userObjectId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;

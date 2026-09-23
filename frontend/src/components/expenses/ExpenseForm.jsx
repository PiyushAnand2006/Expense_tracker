import React, { useState, useEffect } from 'react';
import * as expenseService from '../../services/expenseService';
import { categoryOptions } from '../../utils/helpers';

const emptyForm = { amount: '', category: 'food', description: '', date: '', paymentMethod: 'cash' };

const ExpenseForm = ({ onSuccess, initialData = null }) => {
  const [form, setForm] = useState(initialData || emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setForm({
        amount: initialData.amount,
        category: initialData.category,
        description: initialData.description,
        date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 16) : '',
        paymentMethod: initialData.paymentMethod || 'cash',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (!isEdit && !form.date) payload.date = new Date().toISOString();
      if (isEdit) await expenseService.updateExpense(initialData._id, payload);
      else await expenseService.createExpense(payload);
      setForm(emptyForm);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm space-y-4" aria-label="Expense form">
      <h2 className="text-lg font-semibold text-surface-900">{isEdit ? 'Edit Expense' : 'Add Expense'}</h2>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-surface-700 mb-1">Amount</label>
          <input
            id="amount"
            type="number"
            name="amount"
            step="0.01"
            min="0.01"
            required
            value={form.amount}
            onChange={handleChange}
            className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-surface-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
            placeholder="0.00"
            inputMode="decimal"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-surface-700 mb-1">Date & Time</label>
          <input
            id="date"
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-surface-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-surface-700 mb-1">Category</label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-surface-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
        >
          {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-surface-700 mb-1">Description</label>
        <input
          id="description"
          type="text"
          name="description"
          required
          maxLength={500}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={form.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
          placeholder="What was this expense for?"
        />
      </div>

      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-surface-700 mb-1">Payment Method</label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={handleChange}
          className="w-full rounded-lg border border-surface-200 px-3 py-2.5 text-surface-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
        >
          <option value="cash">Cash</option>
          <option value="credit_card">Credit Card</option>
          <option value="debit_card">Debit Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="digital_wallet">Digital Wallet</option>
          <option value="other">Other</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        {loading ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add Expense')}
      </button>
    </form>
  );
};

export default ExpenseForm;

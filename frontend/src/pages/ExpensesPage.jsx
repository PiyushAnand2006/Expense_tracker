import React from 'react';
import { useState } from 'react';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import * as expenseService from '../services/expenseService';
import { useAuth } from '../context/AuthContext';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await expenseService.getExpenses({ limit: 200 });
      setExpenses(res.data.data.expenses);
    } catch {
      // error handled globally
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchExpenses();
  }, []);

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (expense) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expenseService.deleteExpense(expense._id);
      await fetchExpenses();
    } catch {
      // error handled globally
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-surface-900">Expenses</h1>
        <button
          onClick={() => { setEditingExpense(null); setShowForm(!showForm); }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors min-h-[44px] min-w-[128px]"
        >
          {showForm ? 'Close Form' : 'Add Expense'}
        </button>
      </div>

      {showForm && (
        <ExpenseForm
          initialData={editingExpense}
          onSuccess={() => {
            handleFormClose();
            fetchExpenses();
          }}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-20" role="status">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <ExpenseList expenses={expenses} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default ExpensesPage;

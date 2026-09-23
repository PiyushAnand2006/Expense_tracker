import React from 'react';
import { Trash2, Edit } from 'lucide-react';
import { formatCurrency, formatDate, categoryOptions } from '../../utils/helpers';

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  const categoryLabel = (value) => categoryOptions.find((opt) => opt.value === value)?.label || value;

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-surface-500">Date</th>
              <th className="px-4 py-3 font-semibold text-surface-500">Category</th>
              <th className="px-4 py-3 font-semibold text-surface-500">Description</th>
              <th className="px-4 py-3 font-semibold text-surface-500 text-right">Amount</th>
              <th className="px-4 py-3 font-semibold text-surface-500 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200">
            {expenses.map((item) => (
              <tr key={item._id} className="hover:bg-surface-50 transition-colors">
                <td className="px-4 py-3 text-surface-900 tabular-nums">{formatDate(item.date)}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {categoryLabel(item.category)}
                  </span>
                </td>
                <td className="px-4 py-3 text-surface-700 max-w-xs truncate" title={item.description}>
                  {item.description}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-surface-900">
                  {formatCurrency(item.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-surface-500 hover:text-primary-600 rounded-md hover:bg-primary-50 transition-colors min-w-[44px] min-h-[44px]"
                      aria-label={`Edit expense: ${item.description}`}
                    >
                      <Edit className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="p-2 text-surface-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors min-w-[44px] min-h-[44px]"
                      aria-label={`Delete expense: ${item.description}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;

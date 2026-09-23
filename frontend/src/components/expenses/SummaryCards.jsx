import React from 'react';
import { formatCurrency } from '../../utils/helpers';

const SummaryCards = ({ totalAmount, totalCount, avgAmount }) => {
  const cards = [
    { label: 'Total Spent', value: formatCurrency(totalAmount), hint: 'All time total' },
    { label: 'Transactions', value: totalCount, hint: 'Total records' },
    { label: 'Average', value: formatCurrency(avgAmount), hint: 'Per transaction' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ label, value, hint }) => (
        <div key={label} className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-surface-500">{label}</p>
          <p className="text-2xl mt-1 font-semibold tabular-nums text-surface-900">{value}</p>
          <p className="text-xs text-surface-400 mt-1">{hint}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;

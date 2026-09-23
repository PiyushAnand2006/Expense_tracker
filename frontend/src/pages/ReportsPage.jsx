import React from 'react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import * as reportService from '../services/reportService';
import { formatCurrency, formatMonthYear } from '../utils/helpers';

const ReportsPage = () => {
  const [timeData, setTimeData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);
  const [error, setError] = useState('');

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      reportService.getByTime({ months }),
      reportService.getByCategory({ months }),
    ])
      .then(([timeRes, categoryRes]) => {
        if (!mounted) return;
        setTimeData(timeRes.data.data);
        setCategoryData(categoryRes.data.data);
      })
      .catch(() => {
        if (mounted) setError('Failed to load reports');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [months]);

  const chartData = timeData.map((item) => ({
    month: formatMonthYear(item._id),
    total: item.totalAmount,
    count: item.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-surface-900">Reports</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="months" className="text-sm text-surface-600">Last months</label>
          <select
            id="months"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
          >
            {[3, 6, 12].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20" role="status">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm xl:col-span-2">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Monthly Spending</h2>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value, name) => [formatCurrency(value), name === 'total' ? 'Spent' : 'Count']} />
                    <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-surface-500 text-center py-10">No data yet. Add an expense to see insights.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Category Distribution</h2>
            <div className="space-y-3">
              {categoryData.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-sm text-surface-700 capitalize">{item._id}</span>
                  <span className="text-sm font-medium tabular-nums text-surface-900">{formatCurrency(item.totalAmount)}</span>
                </div>
              ))}
              {categoryData.length === 0 && <p className="text-sm text-surface-500">No category data available.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

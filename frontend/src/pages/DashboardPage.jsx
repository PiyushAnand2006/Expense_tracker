import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import * as reportService from '../services/reportService';
import { formatCurrency } from '../utils/helpers';

const COLORS = ['#2563eb', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];

const DashboardPage = () => {
  const [data, setData] = React.useState({ summary: null, byCategory: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([reportService.getSummary(), reportService.getByCategory()])
      .then(([summaryRes, categoryRes]) => {
        if (!mounted) return;
        setData({ summary: summaryRes.data.data, byCategory: categoryRes.data.data });
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load dashboard data');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20" role="status">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  const chartData = data.byCategory.map((item) => ({
    name: item._id,
    value: item.totalAmount,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Total Spent</p>
          <p className="text-2xl mt-1 font-semibold tabular-nums text-surface-900">{formatCurrency(data.summary.totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Transactions</p>
          <p className="text-2xl mt-1 font-semibold tabular-nums text-surface-900">{data.summary.count}</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Average</p>
          <p className="text-2xl mt-1 font-semibold tabular-nums text-surface-900">{formatCurrency(data.summary.averageAmount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Spending by Category</h2>
          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-surface-500 text-center py-10">No data yet. Add an expense to see insights.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">By Category</h2>
          <div className="space-y-3">
            {data.byCategory.map((item, idx) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-sm text-surface-700 capitalize">{item._id}</span>
                </div>
                <div className="text-sm font-medium tabular-nums text-surface-900">{formatCurrency(item.totalAmount)}</div>
              </div>
            ))}
            {data.byCategory.length === 0 && <p className="text-sm text-surface-500">No category data available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

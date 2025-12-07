import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FinancialSummary } from '../types';

interface FinancialChartProps {
  summary: FinancialSummary;
}

const FinancialChart: React.FC<FinancialChartProps> = ({ summary }) => {
  // We want to show how Income is distributed: Expenses vs Savings.
  // If Savings is negative, the pie chart logic gets tricky, so we handle that case.
  const data = [
    { name: 'Expenses', value: summary.totalExpenses },
    { name: 'Savings', value: Math.max(0, summary.savings) },
  ];

  // If there is no data yet
  if (summary.totalIncome === 0 && summary.totalExpenses === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        Add transactions to see analytics
      </div>
    );
  }

  const COLORS = ['#EF4444', '#3B82F6']; // Red for Expenses, Blue for Savings

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Cash Flow Distribution</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {summary.savings < 0 && (
        <p className="text-xs text-orange-500 text-center mt-2">
          Note: Expenses exceed income by ${Math.abs(summary.savings).toFixed(2)}
        </p>
      )}
    </div>
  );
};

export default FinancialChart;
import React from 'react';
import { FinancialSummary } from '../types';

interface SummaryCardsProps {
  summary: FinancialSummary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 flex flex-col">
        <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Total Income</span>
        <span className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(summary.totalIncome)}</span>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex flex-col">
        <span className="text-sm font-medium text-red-600 uppercase tracking-wider">Total Expenses</span>
        <span className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(summary.totalExpenses)}</span>
      </div>

      <div className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col ${summary.savings >= 0 ? 'border-blue-100' : 'border-orange-100'}`}>
        <span className={`text-sm font-medium uppercase tracking-wider ${summary.savings >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
          Net Savings
        </span>
        <span className={`text-3xl font-bold mt-2 ${summary.savings >= 0 ? 'text-gray-900' : 'text-orange-600'}`}>
          {formatCurrency(summary.savings)}
        </span>
      </div>
    </div>
  );
};

export default SummaryCards;
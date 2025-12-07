import React, { useState, useEffect } from 'react';
import { TransactionType } from '../types';

interface TransactionFormProps {
  onAddTransaction: (type: TransactionType, amount: number, description: string, date: string) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  // Initialize with today's date in local YYYY-MM-DD format
  const [date, setDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!description || isNaN(val) || val <= 0 || !date) return;

    onAddTransaction(type, val, description, date);
    
    // Reset fields except date (user might want to add multiple for same day)
    setDescription('');
    setAmount('');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Transaction</h2>
      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-4 xl:items-end">
        
        {/* Type Selection */}
        <div className="w-full xl:w-48">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Type</label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Date Input */}
        <div className="w-full xl:w-40">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Description Input */}
        <div className="w-full xl:flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Description</label>
          <input
            type="text"
            placeholder="e.g. Monthly Salary, Groceries"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Amount Input */}
        <div className="w-full xl:w-32">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full xl:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
        >
          Add Item
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
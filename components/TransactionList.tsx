import React from 'react';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
        <p className="text-gray-400">No recent transactions found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-lg font-semibold text-gray-800">Recent History</h3>
      </div>
      <ul className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {transactions.map((t) => (
          <li key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{t.description}</span>
              <span className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
              </span>
              <button 
                onClick={() => onDelete(t.id)}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                aria-label="Delete transaction"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;
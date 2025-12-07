import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, FinancialSummary } from './types';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FinancialChart from './components/FinancialChart';
import { getFinancialAdvice } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse local storage", e);
      return [];
    }
  });

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Derived State (Summary)
  const summary: FinancialSummary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      savings: totalIncome - totalExpenses
    };
  }, [transactions]);

  // Handlers
  const handleAddTransaction = (type: TransactionType, amount: number, description: string, date: string) => {
    // Parse the date string (YYYY-MM-DD)
    const [year, month, day] = date.split('-').map(Number);
    // Create a date object at Noon UTC. 
    // This ensures that when displayed in local time across most regions, it remains on the selected day.
    // (Using midnight UTC often shifts to previous day in Western hemisphere)
    const transactionDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount,
      description,
      date: transactionDate.toISOString()
    };
    
    // Add new transaction and sort by date descending
    setTransactions(prev => {
      const updated = [newTransaction, ...prev];
      return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    // Reset advice when data changes as it might be stale
    if (aiAdvice) setAiAdvice(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (aiAdvice) setAiAdvice(null);
  };

  const handleGetAdvice = async () => {
    setIsAnalyzing(true);
    setAiAdvice(null);
    try {
      const advice = await getFinancialAdvice(summary, transactions);
      setAiAdvice(advice);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = ["Date", "Type", "Description", "Amount"];
    const rows = transactions.map(t => {
      // Format date as YYYY-MM-DD
      const dateStr = new Date(t.date).toISOString().split('T')[0];
      // Escape quotes in description
      const escapedDesc = `"${t.description.replace(/"/g, '""')}"`;
      return [dateStr, t.type, escapedDesc, t.amount.toFixed(2)].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Monthly Finance</h1>
            <p className="text-gray-500 mt-1">Track your income, expenses, and savings.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportCSV}
              disabled={transactions.length === 0}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all shadow-sm border border-gray-200 ${
                transactions.length === 0
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md active:scale-95'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export CSV
            </button>

            <button 
              onClick={handleGetAdvice}
              disabled={isAnalyzing || transactions.length === 0}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all shadow-sm ${
                isAnalyzing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-md hover:scale-105 active:scale-95'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  AI Insights
                </>
              )}
            </button>
          </div>
        </header>

        {/* AI Advice Section */}
        {aiAdvice && (
          <div className="mb-8 p-6 bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-100 rounded-xl animate-fade-in relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" viewBox="0 0 20 20" fill="currentColor">
                 <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
               </svg>
             </div>
             <h3 className="text-indigo-800 font-semibold mb-2 flex items-center gap-2">
               Advisor says:
             </h3>
             <div className="text-gray-700 leading-relaxed whitespace-pre-wrap relative z-10">
               {aiAdvice}
             </div>
             <button 
               onClick={() => setAiAdvice(null)}
               className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-600"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
             </button>
          </div>
        )}

        <SummaryCards summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form & List */}
          <div className="flex flex-col gap-8">
            <TransactionForm onAddTransaction={handleAddTransaction} />
            <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
          </div>

          {/* Right Column: Analytics */}
          <div>
            <FinancialChart summary={summary} />
            
            {/* Additional simple metric for Income context */}
            <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-medium text-gray-500">Income Utilization</span>
                 <span className="text-sm font-bold text-gray-700">{summary.totalIncome > 0 ? '100%' : '0%'}</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2.5 flex overflow-hidden">
                 <div className="bg-red-500 h-2.5" style={{ width: `${summary.totalIncome > 0 ? Math.min((summary.totalExpenses / summary.totalIncome) * 100, 100) : 0}%` }}></div>
                 <div className="bg-blue-500 h-2.5" style={{ width: `${summary.totalIncome > 0 ? Math.max((summary.savings / summary.totalIncome) * 100, 0) : 0}%` }}></div>
               </div>
               <div className="flex justify-between mt-2 text-xs text-gray-400">
                 <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Expenses</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Savings</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
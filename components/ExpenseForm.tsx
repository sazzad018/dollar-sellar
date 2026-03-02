import React, { useState } from 'react';
import { PlusCircle, WalletCards, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Expense, Deposit } from '../types';

interface Props {
  onAddExpense: (e: Omit<Expense, 'id'>) => void;
  onAddDeposit: (d: Omit<Deposit, 'id'>) => void;
}

const ExpenseForm: React.FC<Props> = ({ onAddExpense, onAddDeposit }) => {
  const [mode, setMode] = useState<'EXPENSE' | 'DEPOSIT'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !reason) return;

    if (mode === 'EXPENSE') {
      onAddExpense({
        amountBDT: parseFloat(amount),
        reason,
        date: new Date().toISOString()
      });
    } else {
      onAddDeposit({
        amountBDT: parseFloat(amount),
        source: reason,
        date: new Date().toISOString()
      });
    }

    setAmount('');
    setReason('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit transition-colors duration-200">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <WalletCards className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        Manage Cash (নগদ ব্যবস্থাপনা)
      </h3>

      <div className="flex gap-2 mb-6 p-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors">
        <button
          onClick={() => setMode('DEPOSIT')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            mode === 'DEPOSIT' 
              ? 'bg-green-600 text-white shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" /> Add Money (জমা)
        </button>
        <button
          onClick={() => setMode('EXPENSE')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            mode === 'EXPENSE' 
              ? 'bg-red-600 text-white shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" /> Expense (খরচ)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Amount (BDT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 5000"
            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
              mode === 'DEPOSIT' 
              ? 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500' 
              : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500'
            }`}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {mode === 'DEPOSIT' ? 'Source (উৎস)' : 'Reason (কারণ)'}
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={mode === 'DEPOSIT' ? "e.g. Initial Capital, Bank Withdraw" : "e.g. Lunch, Transport"}
            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
              mode === 'DEPOSIT' 
              ? 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500' 
              : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500'
            }`}
            required
          />
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
            mode === 'DEPOSIT' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          <PlusCircle className="w-4 h-4" /> 
          {mode === 'DEPOSIT' ? 'Add Balance' : 'Save Expense'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
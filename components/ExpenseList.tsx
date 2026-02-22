import React, { useMemo, useState } from 'react';
import { Expense, Deposit } from '../types';
import { Trash2, Wallet, ArrowDownCircle, ArrowUpCircle, TrendingDown, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  expenses: Expense[];
  deposits: Deposit[];
  currentBalance: number;
  onDeleteExpense: (id: string) => void;
  onDeleteDeposit: (id: string) => void;
}

const ExpenseList: React.FC<Props> = ({ expenses, deposits, currentBalance, onDeleteExpense, onDeleteDeposit }) => {
  const [showAllDaily, setShowAllDaily] = useState(false);

  // Calculate total expense
  const totalExpense = expenses.reduce((sum, item) => sum + item.amountBDT, 0);

  // Calculate daily expenses
  const allDailyExpenses = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach(expense => {
      const dateObj = new Date(expense.date);
      const dateKey = dateObj.toDateString(); // Use toDateString for grouping to ignore time
      grouped[dateKey] = (grouped[dateKey] || 0) + expense.amountBDT;
    });
    return Object.entries(grouped)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [expenses]);

  const displayedDailyExpenses = showAllDaily ? allDailyExpenses : allDailyExpenses.slice(0, 6);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today (আজ)';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday (গতকাল)';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Merge and sort by date
  const allItems = [
    ...expenses.map(e => ({ ...e, type: 'EXPENSE' as const })),
    ...deposits.map(d => ({ ...d, type: 'DEPOSIT' as const, reason: d.source }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 col-span-2">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/10 rounded-lg">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-gray-300 font-medium">Current Net Balance (হাতে আছে)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold tracking-tight">৳{currentBalance.toLocaleString()}</h2>
            <span className="text-sm text-gray-400">BDT</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Calculated from: (Deposits + Sales) - (Purchases + Expenses)
          </p>
        </div>

        {/* Total Expense Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-gray-600 font-medium">Total Expenses (মোট খরচ)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold tracking-tight text-red-600">৳{totalExpense.toLocaleString()}</h2>
            <span className="text-sm text-gray-400">BDT</span>
          </div>
           <p className="text-xs text-gray-400 mt-2">
            Lifetime total expenses recorded
          </p>
        </div>
      </div>

      {/* Daily Expenses Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Daily Expenses (প্রতিদিনের খরচ)</h3>
          </div>
          {allDailyExpenses.length > 6 && (
            <button 
              onClick={() => setShowAllDaily(!showAllDaily)}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
            >
              {showAllDaily ? (
                <>Show Less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>View All <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
        
        {displayedDailyExpenses.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No expenses recorded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {displayedDailyExpenses.map(([dateKey, amount]) => (
              <div key={dateKey} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center text-center hover:bg-purple-50 transition-colors cursor-default">
                <span className="text-xs font-medium text-gray-500 mb-1">{getDateLabel(dateKey)}</span>
                <span className="text-lg font-bold text-gray-900">৳{amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Cash Flow History (হিসাব বই)</h3>
        </div>
        
        {allItems.length === 0 ? (
           <div className="text-center py-12">
            <p className="text-gray-400">No records found.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Amount (BDT)</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                      <div className="text-xs text-gray-400">{new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.type === 'DEPOSIT'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                         {item.type === 'DEPOSIT' ? <ArrowDownCircle className="w-3 h-3" /> : <ArrowUpCircle className="w-3 h-3" />}
                         {item.type === 'DEPOSIT' ? 'IN' : 'OUT'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${item.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.type === 'DEPOSIT' ? '+' : '-'}৳{item.amountBDT.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => item.type === 'EXPENSE' ? onDeleteExpense(item.id) : onDeleteDeposit(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
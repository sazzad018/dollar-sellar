import React from 'react';
import { Expense, Deposit } from '../types';
import { Trash2, Wallet, ArrowDownCircle, ArrowUpCircle, TrendingDown } from 'lucide-react';

interface Props {
  expenses: Expense[];
  deposits: Deposit[];
  currentBalance: number;
  onDeleteExpense: (id: string) => void;
  onDeleteDeposit: (id: string) => void;
}

const ExpenseList: React.FC<Props> = ({ expenses, deposits, currentBalance, onDeleteExpense, onDeleteDeposit }) => {
  // Calculate total expense
  const totalExpense = expenses.reduce((sum, item) => sum + item.amountBDT, 0);

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
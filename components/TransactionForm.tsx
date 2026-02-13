import React, { useState } from 'react';
import { Plus, Minus, DollarSign, RefreshCcw } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface Props {
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

const TransactionForm: React.FC<Props> = ({ onAddTransaction }) => {
  const [type, setType] = useState<TransactionType>('BUY');
  const [amountUSD, setAmountUSD] = useState<string>('');
  const [rateBDT, setRateBDT] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountUSD || !rateBDT) return;

    const usd = parseFloat(amountUSD);
    const rate = parseFloat(rateBDT);

    onAddTransaction({
      type,
      amountUSD: usd,
      rateBDT: rate,
      totalBDT: usd * rate,
      date: new Date().toISOString(),
      note
    });

    setAmountUSD('');
    setRateBDT('');
    setNote('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <RefreshCcw className="w-5 h-5 text-blue-600" />
        New Transaction (নতুন লেনদেন)
      </h3>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setType('BUY')}
          className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            type === 'BUY' 
              ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Plus className="w-4 h-4" /> Buy (ক্রয়)
        </button>
        <button
          onClick={() => setType('SELL')}
          className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            type === 'SELL' 
              ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Minus className="w-4 h-4" /> Sell (বিক্রয়)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Amount (USD)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={amountUSD}
              onChange={(e) => setAmountUSD(e.target.value)}
              placeholder="e.g. 100"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Rate (BDT per USD)</label>
          <input
            type="number"
            step="0.01"
            value={rateBDT}
            onChange={(e) => setRateBDT(e.target.value)}
            placeholder="e.g. 110.50"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Note (Optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Client name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="pt-2">
           <div className="flex justify-between items-center text-sm text-gray-500 mb-4 px-1">
              <span>Total BDT:</span>
              <span className="font-bold text-gray-800">
                {amountUSD && rateBDT 
                  ? (parseFloat(amountUSD) * parseFloat(rateBDT)).toLocaleString() 
                  : '0'} ৳
              </span>
           </div>

          <button
            type="submit"
            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-md active:scale-95 ${
              type === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Confirm {type === 'BUY' ? 'Purchase' : 'Sale'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { ArrowDownLeft, ArrowUpRight, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, onDelete }) => {
  
  // Calculate historical profit per unit for SELL transactions using FIFO
  const profitData = useMemo(() => {
    // Sort chronologically (Oldest first)
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const profitMap = new Map<string, number>();
    
    // FIFO Inventory: { amount: number, rate: number }
    let inventory: { amount: number; rate: number }[] = [];

    sorted.forEach(tx => {
      if (tx.type === 'BUY') {
        // Add to inventory
        inventory.push({ amount: tx.amountUSD, rate: tx.rateBDT });
      } else {
        // SELL Logic (FIFO)
        let amountToSell = tx.amountUSD;
        let costBasisForThisSale = 0;
        
        // Create a temporary inventory copy to not mutate state if we were just calculating (but here we are iterating linearly so mutation is fine for this local scope)
        // actually we need to mutate 'inventory' as we progress through time
        
        // We need to handle the case where we might not have enough inventory (data error or short selling)
        // For calculation purposes, if inventory is empty, we assume cost basis = 0 (infinite profit) or handle gracefully.
        
        let tempAmountToSell = amountToSell;
        
        // Consume inventory
        while (tempAmountToSell > 0 && inventory.length > 0) {
          const currentLot = inventory[0];
          
          if (currentLot.amount <= tempAmountToSell) {
            // Consume entire lot
            costBasisForThisSale += currentLot.amount * currentLot.rate;
            tempAmountToSell -= currentLot.amount;
            inventory.shift(); // Remove empty lot
          } else {
            // Consume partial lot
            costBasisForThisSale += tempAmountToSell * currentLot.rate;
            currentLot.amount -= tempAmountToSell;
            tempAmountToSell = 0;
          }
        }
        
        // Calculate Profit
        const saleRevenue = tx.totalBDT;
        const totalProfit = saleRevenue - costBasisForThisSale;
        
        // Profit Per Unit = Total Profit / Amount Sold
        const profitPerUnit = totalProfit / tx.amountUSD;
        
        profitMap.set(tx.id, profitPerUnit);
      }
    });

    return profitMap;
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
        <p className="text-gray-400">No transactions yet. Start trading!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Transaction History (লেনদেন ইতিহাস)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount (USD)</th>
              <th className="px-6 py-4">Profit/USD</th>
              <th className="px-6 py-4">Rate (BDT)</th>
              <th className="px-6 py-4 text-right">Total (BDT)</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.slice().reverse().map((t) => {
              const profitPerUnit = profitData.get(t.id);
              const hasProfit = profitPerUnit !== undefined;
              const isProfit = (profitPerUnit || 0) >= 0;

              return (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      t.type === 'BUY' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {t.type === 'BUY' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(t.date).toLocaleDateString()}
                    <div className="text-xs text-gray-400">{new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">${t.amountUSD.toLocaleString()}</td>
                  
                  {/* Profit Per USD Column */}
                  <td className="px-6 py-4 text-sm">
                    {t.type === 'SELL' && hasProfit ? (
                      <div className={`flex items-center gap-1 font-medium ${isProfit ? 'text-green-600' : 'text-red-500'}`}>
                        {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isProfit ? '+' : ''}{profitPerUnit?.toFixed(2)} ৳
                      </div>
                    ) : (
                      <div className="text-gray-300 pl-2">
                        <Minus className="w-3 h-3" />
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">৳{t.rateBDT}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">৳{t.totalBDT.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
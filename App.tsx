import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, PortfolioStats } from './types';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Charts from './components/Charts';
import AIInsights from './components/AIInsights';
import { LayoutDashboard, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { supabase } from './services/supabaseClient';

const generateId = () => {
  // Safe ID generation that works in non-secure contexts (http) too
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Fetch transactions from Supabase on load
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    if (!supabase) {
      console.warn("Supabase client is not initialized. Check environment variables.");
      setIsOnline(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        setTransactions(data as Transaction[]);
        setIsOnline(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsOnline(false); // Assume connection issue or config missing
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    if (!supabase) {
      alert("Database configuration missing. Cannot save transaction.");
      return;
    }

    // Optimistic Update
    const tempId = generateId();
    const optimisticTx = { ...newTx, id: tempId };
    setTransactions(prev => [...prev, optimisticTx]);

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTx])
        .select();

      if (error) throw error;

      // Replace optimistic transaction with real one from DB
      if (data) {
        setTransactions(prev => prev.map(t => t.id === tempId ? data[0] as Transaction : t));
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to save to database. Check internet connection.");
      // Rollback
      setTransactions(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!supabase) {
      alert("Database configuration missing. Cannot delete transaction.");
      return;
    }

    // Optimistic Update
    const previousTransactions = [...transactions];
    setTransactions(prev => prev.filter(t => t.id !== id));

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete. Check internet connection.");
      // Rollback
      setTransactions(previousTransactions);
    }
  };

  // Complex business logic for weighted average calculation
  const stats = useMemo<PortfolioStats>(() => {
    let currentHoldingsUSD = 0;
    let totalInvestedBDT = 0; // For current holdings
    let totalSoldBDT = 0;
    let totalRealizedProfit = 0;

    // We iterate chronologically
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let totalCostBasisBDT = 0;

    sortedTx.forEach(tx => {
      if (tx.type === 'BUY') {
        currentHoldingsUSD += tx.amountUSD;
        totalCostBasisBDT += tx.totalBDT; 
      } else {
        // SELL
        let avgCost = 0;
        if (currentHoldingsUSD > 0) {
            avgCost = totalCostBasisBDT / currentHoldingsUSD;
        }

        const costOfSoldGoods = tx.amountUSD * avgCost;
        const revenue = tx.totalBDT;
        const profit = revenue - costOfSoldGoods;

        totalRealizedProfit += profit;
        totalSoldBDT += tx.totalBDT;
        
        // Reduce inventory
        currentHoldingsUSD -= tx.amountUSD;
        totalCostBasisBDT -= costOfSoldGoods; 
      }
    });

    if (currentHoldingsUSD < 0.01) {
        currentHoldingsUSD = 0;
        totalCostBasisBDT = 0;
    }

    return {
      currentHoldingsUSD,
      averageBuyCost: currentHoldingsUSD > 0 ? totalCostBasisBDT / currentHoldingsUSD : 0,
      totalRealizedProfit,
      totalInvestedBDT: totalCostBasisBDT, 
      totalSoldBDT
    };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dollar Tracker Pro</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Currency Trading Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {loading ? (
               <div className="flex items-center gap-1 text-xs text-blue-600">
                 <Loader2 className="w-4 h-4 animate-spin" /> Syncing...
               </div>
             ) : isOnline ? (
               <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                 <Cloud className="w-3 h-3" /> Online DB
               </div>
             ) : (
               <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                 <CloudOff className="w-3 h-3" /> DB Error
               </div>
             )}
             <div className="text-sm font-medium text-gray-900 border-l pl-3 border-gray-200">
               {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short'})}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard Stats */}
        <Dashboard stats={stats} />

        {/* AI Section */}
        <AIInsights transactions={transactions} stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <TransactionForm onAddTransaction={addTransaction} />
          </div>

          {/* Right Column: List & Charts */}
          <div className="lg:col-span-2 space-y-8">
            <Charts transactions={transactions} />
            <TransactionList transactions={transactions} onDelete={deleteTransaction} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
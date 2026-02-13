import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, PortfolioStats } from './types';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Charts from './components/Charts';
import { LayoutDashboard, Cloud, CloudOff, Loader2, HardDrive } from 'lucide-react';
import { supabase } from './services/supabaseClient';

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const LOCAL_STORAGE_KEY = 'dollar_tracker_transactions';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocalStorage, setIsLocalStorage] = useState(false);

  // Fetch transactions on load
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    // 1. If Supabase is not configured, load from LocalStorage immediately
    if (!supabase) {
      console.log("Supabase not configured. Using Local Storage.");
      loadFromLocal();
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      if (data) {
        setTransactions(data as Transaction[]);
        setIsLocalStorage(false);
      }
    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
      // Fallback to local storage if connection fails
      loadFromLocal();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocal = () => {
    setIsLocalStorage(true);
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse local storage", e);
    }
    setLoading(false);
  };

  const saveToLocal = (txs: Transaction[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(txs));
  };

  const addTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const tempId = generateId();
    const transaction = { ...newTx, id: tempId };
    
    // Optimistic Update
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);

    // If using local storage or no supabase
    if (isLocalStorage || !supabase) {
      saveToLocal(updatedTransactions);
      return;
    }

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
      console.error("Error adding transaction to Cloud:", error);
      // Fallback: switch to local mode and save
      setIsLocalStorage(true);
      saveToLocal(updatedTransactions);
      alert("Could not connect to database. Switched to Local Storage mode. Your data is safe locally.");
    }
  };

  const deleteTransaction = async (id: string) => {
    // Optimistic Update
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);

    if (isLocalStorage || !supabase) {
      saveToLocal(updatedTransactions);
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setIsLocalStorage(true);
      saveToLocal(updatedTransactions);
    }
  };

  // Weighted average calculation
  const stats = useMemo<PortfolioStats>(() => {
    let currentHoldingsUSD = 0;
    let totalInvestedBDT = 0;
    let totalSoldBDT = 0;
    let totalRealizedProfit = 0;

    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let totalCostBasisBDT = 0;

    sortedTx.forEach(tx => {
      if (tx.type === 'BUY') {
        currentHoldingsUSD += tx.amountUSD;
        totalCostBasisBDT += tx.totalBDT; 
      } else {
        let avgCost = 0;
        if (currentHoldingsUSD > 0) {
            avgCost = totalCostBasisBDT / currentHoldingsUSD;
        }
        const costOfSoldGoods = tx.amountUSD * avgCost;
        const profit = tx.totalBDT - costOfSoldGoods;

        totalRealizedProfit += profit;
        totalSoldBDT += tx.totalBDT;
        
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
                 <Loader2 className="w-4 h-4 animate-spin" /> Loading...
               </div>
             ) : isLocalStorage ? (
               <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200" title="Data is saved in your browser only">
                 <HardDrive className="w-3 h-3" /> Local Storage
               </div>
             ) : (
               <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                 <Cloud className="w-3 h-3" /> Cloud Sync
               </div>
             )}
             <div className="text-sm font-medium text-gray-900 border-l pl-3 border-gray-200">
               {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short'})}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TransactionForm onAddTransaction={addTransaction} />
          </div>

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
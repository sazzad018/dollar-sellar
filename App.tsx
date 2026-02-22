import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, PortfolioStats, Expense, Deposit } from './types';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Charts from './components/Charts';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import { LayoutDashboard, Cloud, Loader2, HardDrive, Receipt, ArrowRightLeft } from 'lucide-react';
import { supabase } from './services/supabaseClient';

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const LOCAL_STORAGE_KEY = 'dollar_tracker_transactions';
const LOCAL_STORAGE_EXPENSE_KEY = 'dollar_tracker_expenses';
const LOCAL_STORAGE_DEPOSIT_KEY = 'dollar_tracker_deposits';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trading' | 'expenses'>('trading');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocalStorage, setIsLocalStorage] = useState(false);

  // Fetch data on load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. If Supabase is not configured, load from LocalStorage immediately
    if (!supabase) {
      console.log("Supabase not configured. Using Local Storage.");
      loadFromLocal();
      return;
    }

    try {
      setLoading(true);
      
      // Fetch Transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: true });

      if (txError) throw txError;
      if (txData) setTransactions(txData as Transaction[]);

      // Fetch Expenses
      const { data: expData, error: expError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: true });

      if (expError) console.warn("Could not fetch expenses:", expError.message);
      else if (expData) setExpenses(expData as Expense[]);

      // Fetch Deposits
      const { data: depData, error: depError } = await supabase
        .from('deposits')
        .select('*')
        .order('date', { ascending: true });

      if (depError) console.warn("Could not fetch deposits (Table might be missing):", depError.message);
      else if (depData) setDeposits(depData as Deposit[]);

      setIsLocalStorage(false);
    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
      loadFromLocal();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocal = () => {
    setIsLocalStorage(true);
    try {
      const storedTx = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTx) setTransactions(JSON.parse(storedTx));

      const storedExp = localStorage.getItem(LOCAL_STORAGE_EXPENSE_KEY);
      if (storedExp) setExpenses(JSON.parse(storedExp));

      const storedDep = localStorage.getItem(LOCAL_STORAGE_DEPOSIT_KEY);
      if (storedDep) setDeposits(JSON.parse(storedDep));
    } catch (e) {
      console.error("Failed to parse local storage", e);
    }
    setLoading(false);
  };

  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // --- Transaction Logic ---
  const addTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const tempId = generateId();
    const transaction = { ...newTx, id: tempId };
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);

    if (isLocalStorage || !supabase) {
      saveToLocal(LOCAL_STORAGE_KEY, updatedTransactions);
      return;
    }

    try {
      const { data, error } = await supabase.from('transactions').insert([newTx]).select();
      if (error) throw error;
      if (data) setTransactions(prev => prev.map(t => t.id === tempId ? data[0] as Transaction : t));
    } catch (error) {
      console.error("Error adding transaction to Cloud:", error);
      setIsLocalStorage(true);
      saveToLocal(LOCAL_STORAGE_KEY, updatedTransactions);
      alert("Switched to Local Storage mode.");
    }
  };

  const deleteTransaction = async (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);

    if (isLocalStorage || !supabase) {
      saveToLocal(LOCAL_STORAGE_KEY, updatedTransactions);
      return;
    }

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      setIsLocalStorage(true);
      saveToLocal(LOCAL_STORAGE_KEY, updatedTransactions);
    }
  };

  // --- Expense Logic ---
  const addExpense = async (newExp: Omit<Expense, 'id'>) => {
    const tempId = generateId();
    const expense = { ...newExp, id: tempId };
    const updatedExpenses = [...expenses, expense];
    setExpenses(updatedExpenses);

    if (isLocalStorage || !supabase) {
      saveToLocal(LOCAL_STORAGE_EXPENSE_KEY, updatedExpenses);
      return;
    }

    try {
      const { data, error } = await supabase.from('expenses').insert([newExp]).select();
      if (error) throw error;
      if (data) setExpenses(prev => prev.map(e => e.id === tempId ? data[0] as Expense : e));
    } catch (error) {
      saveToLocal(LOCAL_STORAGE_EXPENSE_KEY, updatedExpenses);
    }
  };

  const deleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter(e => e.id !== id);
    setExpenses(updatedExpenses);

    if (isLocalStorage || !supabase) {
      saveToLocal(LOCAL_STORAGE_EXPENSE_KEY, updatedExpenses);
      return;
    }

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      saveToLocal(LOCAL_STORAGE_EXPENSE_KEY, updatedExpenses);
    }
  };

  // --- Deposit Logic ---
  const addDeposit = async (newDep: Omit<Deposit, 'id'>) => {
    const tempId = generateId();
    const deposit = { ...newDep, id: tempId };
    const updatedDeposits = [...deposits, deposit];
    setDeposits(updatedDeposits);

    if (isLocalStorage || !supabase) {
      saveToLocal(LOCAL_STORAGE_DEPOSIT_KEY, updatedDeposits);
      return;
    }

    try {
      const { data, error } = await supabase.from('deposits').insert([newDep]).select();
      if (error) throw error;
      if (data) setDeposits(prev => prev.map(d => d.id === tempId ? data[0] as Deposit : d));
    } catch (error) {
      saveToLocal(LOCAL_STORAGE_DEPOSIT_KEY, updatedDeposits);
    }
  };

  const deleteDeposit = async (id: string) => {
    const updatedDeposits = deposits.filter(d => d.id !== id);
    setDeposits(updatedDeposits);

    if (isLocalStorage || !supabase) {
      saveToLocal(LOCAL_STORAGE_DEPOSIT_KEY, updatedDeposits);
      return;
    }

    try {
      const { error } = await supabase.from('deposits').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      saveToLocal(LOCAL_STORAGE_DEPOSIT_KEY, updatedDeposits);
    }
  };

  // Stats Calculation
  const stats = useMemo<PortfolioStats>(() => {
    let currentHoldingsUSD = 0;
    let totalInvestedBDT = 0;
    let totalSoldBDT = 0;
    let totalRealizedProfit = 0;

    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let totalCostBasisBDT = 0;
    const dailyProfits: Record<string, number> = {};

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

        const dateKey = new Date(tx.date).toDateString();
        dailyProfits[dateKey] = (dailyProfits[dateKey] || 0) + profit;
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
      totalSoldBDT,
      dailyProfits
    };
  }, [transactions]);

  // Calculate Net Cash Balance
  const currentBalance = useMemo(() => {
    const totalDeposits = deposits.reduce((sum, d) => sum + d.amountBDT, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amountBDT, 0);
    
    // Trading Cash Flow: Sell = Inflow, Buy = Outflow
    let tradingInflow = 0;
    let tradingOutflow = 0;
    
    transactions.forEach(t => {
      if (t.type === 'SELL') tradingInflow += t.totalBDT;
      if (t.type === 'BUY') tradingOutflow += t.totalBDT;
    });

    return (totalDeposits + tradingInflow) - (tradingOutflow + totalExpenses);
  }, [deposits, expenses, transactions]);

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
                 <Loader2 className="w-4 h-4 animate-spin" />
               </div>
             ) : isLocalStorage ? (
               <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                 <HardDrive className="w-3 h-3" /> Local
               </div>
             ) : (
               <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                 <Cloud className="w-3 h-3" /> Cloud
               </div>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1 rounded-xl w-fit border border-gray-100 shadow-sm mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('trading')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'trading' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" /> Trading
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'expenses' 
              ? 'bg-purple-600 text-white shadow-md' 
              : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Receipt className="w-4 h-4" /> Cash & Expenses
          </button>
        </div>

        {activeTab === 'trading' ? (
          <>
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
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            <div className="lg:col-span-1">
               <ExpenseForm onAddExpense={addExpense} onAddDeposit={addDeposit} />
            </div>
            <div className="lg:col-span-2">
               <ExpenseList 
                 expenses={expenses} 
                 deposits={deposits}
                 currentBalance={currentBalance}
                 onDeleteExpense={deleteExpense} 
                 onDeleteDeposit={deleteDeposit} 
               />
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
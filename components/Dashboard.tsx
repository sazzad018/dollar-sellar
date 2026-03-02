import React, { useState } from 'react';
import { Wallet, TrendingUp, BarChart3, AlertCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { PortfolioStats } from '../types';

interface Props {
  stats: PortfolioStats;
}

const StatCard: React.FC<{
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  colorClass: string;
}> = ({ title, value, subValue, icon, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between transition-colors duration-200">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h4>
      {subValue && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subValue}</p>}
    </div>
    <div className={`p-3 rounded-xl ${colorClass}`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC<Props> = ({ stats }) => {
  const [showAll, setShowAll] = useState(false);

  const dailyProfits = Object.entries(stats.dailyProfits || {})
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

  const displayedProfits = showAll ? dailyProfits : dailyProfits.slice(0, 6);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today (আজ)';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday (গতকাল)';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current Holdings (USD)"
          value={`$${stats.currentHoldingsUSD.toLocaleString()}`}
          subValue="Dollar in hand / জমা ডলার"
          icon={<Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
          colorClass="bg-blue-50 dark:bg-blue-900/20"
        />
        
        <StatCard
          title="Avg. Buy Cost (BDT)"
          value={`৳${stats.averageBuyCost.toFixed(2)}`}
          subValue="Per USD / কেনা দাম (গড়)"
          icon={<BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
          colorClass="bg-purple-50 dark:bg-purple-900/20"
        />

        <StatCard
          title="Realized Profit (BDT)"
          value={`৳${stats.totalRealizedProfit.toLocaleString()}`}
          subValue="From sales / লাভ"
          icon={<TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />}
          colorClass="bg-green-50 dark:bg-green-900/20"
        />

        <StatCard
          title="Est. Unrealized Value"
          value={`৳${(stats.currentHoldingsUSD * stats.averageBuyCost).toLocaleString()}`}
          subValue="Value at cost / মজুদ মূল্য"
          icon={<AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />}
          colorClass="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      {/* Daily Profit Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Daily Profit (প্রতিদিনের লাভ)</h3>
          </div>
          {dailyProfits.length > 6 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium px-3 py-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
            >
              {showAll ? (
                <>Show Less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>View All <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
        
        {displayedProfits.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No profits recorded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {displayedProfits.map(([dateKey, amount]) => (
              <div key={dateKey} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-default">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{getDateLabel(dateKey)}</span>
                <span className={`text-lg font-bold ${amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {amount >= 0 ? '+' : ''}৳{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
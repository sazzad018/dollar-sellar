import React from 'react';
import { Wallet, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
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
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </div>
    <div className={`p-3 rounded-xl ${colorClass}`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Current Holdings (USD)"
        value={`$${stats.currentHoldingsUSD.toLocaleString()}`}
        subValue="Dollar in hand / জমা ডলার"
        icon={<Wallet className="w-6 h-6 text-blue-600" />}
        colorClass="bg-blue-50"
      />
      
      <StatCard
        title="Avg. Buy Cost (BDT)"
        value={`৳${stats.averageBuyCost.toFixed(2)}`}
        subValue="Per USD / কেনা দাম (গড়)"
        icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
        colorClass="bg-purple-50"
      />

      <StatCard
        title="Realized Profit (BDT)"
        value={`৳${stats.totalRealizedProfit.toLocaleString()}`}
        subValue="From sales / লাভ"
        icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        colorClass="bg-green-50"
      />

      <StatCard
        title="Est. Unrealized Value"
        value={`৳${(stats.currentHoldingsUSD * stats.averageBuyCost).toLocaleString()}`}
        subValue="Value at cost / মজুদ মূল্য"
        icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
        colorClass="bg-orange-50"
      />
    </div>
  );
};

export default Dashboard;
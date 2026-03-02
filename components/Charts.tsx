import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

const Charts: React.FC<Props> = ({ transactions }) => {
  // Process data for charts
  // We want to see volume over time and rate trends
  const data = transactions.slice(-20).map(t => ({
    date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    rate: t.rateBDT,
    amount: t.amountUSD,
    type: t.type
  }));

  if (transactions.length < 2) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Rate Trend Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-6">Rate Trend (BDT/USD)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="date" tick={{fontSize: 12}} stroke="var(--chart-text)" axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{fontSize: 12}} stroke="var(--chart-text)" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: 'var(--tooltip-bg)',
                  color: 'var(--tooltip-text)'
                }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
              />
              <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-6">Trade Volume (USD)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="date" tick={{fontSize: 12}} stroke="var(--chart-text)" axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12}} stroke="var(--chart-text)" axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: 'var(--chart-grid)'}} 
                contentStyle={{
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: 'var(--tooltip-bg)',
                  color: 'var(--tooltip-text)'
                }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
              />
              <Legend />
              <Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} name="Volume" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
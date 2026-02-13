import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { analyzeTradeHistory } from '../services/geminiService';
import { Transaction, PortfolioStats } from '../types';

interface Props {
  transactions: Transaction[];
  stats: PortfolioStats;
}

const AIInsights: React.FC<Props> = ({ transactions, stats }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeTradeHistory(transactions, stats);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            AI Business Advisor
          </h3>
          <p className="text-indigo-100 text-sm mt-1">Get insights in Bengali about your trading performance.</p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze Now'}
        </button>
      </div>

      {analysis && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 animate-fade-in">
          <p className="whitespace-pre-wrap leading-relaxed font-light text-sm md:text-base">
            {analysis}
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
export type TransactionType = 'BUY' | 'SELL';

export interface Transaction {
  id: string;
  type: TransactionType;
  amountUSD: number;
  rateBDT: number; // Price per 1 USD
  totalBDT: number;
  date: string; // ISO String
  note?: string;
}

export interface PortfolioStats {
  currentHoldingsUSD: number;
  averageBuyCost: number;
  totalRealizedProfit: number;
  totalInvestedBDT: number;
  totalSoldBDT: number;
}

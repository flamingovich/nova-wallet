
export type Currency = 'RUB' | 'USD' | 'EUR' | 'USDT';

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'exchange';
  amount: number;
  currency: Currency;
  category: string;
  merchant: string;
  date: string;
  icon: string;
  fee?: number;
  fromCurrency?: Currency;
  toCurrency?: Currency;
}

export interface Card {
  id: string;
  number: string;
  balance: number;
  currency: Currency;
  type: string;
  color: string;
  expiry: string;
}

export interface AppState {
  userName: string;
  cards: Card[];
  transactions: Transaction[];
}

export interface AIAnalysis {
  summary: string;
  tips: string[];
}

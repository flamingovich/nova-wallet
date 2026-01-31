
import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Transfers from './pages/Transfers';
import History from './pages/History';
import Exchange from './pages/Exchange';
import { AppState, Currency } from './types';

// Updated storage key to force reset to zero balances
const STORAGE_KEY = 'novabank_state_v4_zero';

const INITIAL_STATE: AppState = {
  userName: 'Алексей',
  cards: [
    {
      id: 'c1',
      number: '•••• 4251',
      balance: 0,
      currency: 'RUB',
      type: 'RUB MIR Card',
      color: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      expiry: '12/28'
    },
    {
      id: 'c4',
      number: 'TRC20 •••• 9921',
      balance: 0,
      currency: 'USDT',
      type: 'USDT Crypto Card',
      color: 'linear-gradient(135deg, #26A17B 0%, #1a7c5e 100%)',
      expiry: '∞'
    },
    {
      id: 'c2',
      number: '•••• 8820',
      balance: 0,
      currency: 'USD',
      type: 'USD Visa Card',
      color: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
      expiry: '05/27'
    },
    {
      id: 'c3',
      number: '•••• 1109',
      balance: 0,
      currency: 'EUR',
      type: 'EUR MasterCard Card',
      color: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      expiry: '09/26'
    }
  ],
  transactions: []
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [rates, setRates] = useState<Record<string, number>>({ RUB: 92, USD: 1, EUR: 0.92, USDT: 1 });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const fetchRates = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      if (data && data.rates) {
        setRates({ ...data.rates, USDT: 1 });
      }
    } catch (err) {
      console.error("Ошибка загрузки курсов:", err);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  const addBalance = useCallback((cardId: string, amount: number) => {
    setState(prev => {
      const card = prev.cards.find(c => c.id === cardId);
      if (!card) return prev;
      return {
        ...prev,
        cards: prev.cards.map(c => c.id === cardId ? { ...c, balance: c.balance + amount } : c),
        transactions: [
          {
            id: Date.now().toString(),
            type: 'income',
            amount,
            currency: card.currency,
            category: 'Пополнение',
            merchant: 'Пополнение счета',
            date: new Date().toISOString(),
            icon: 'plus'
          },
          ...prev.transactions
        ]
      };
    });
  }, []);

  const makeTransaction = useCallback((merchant: string, amount: number, currency: Currency, totalDebit: number, fee: number) => {
    setState(prev => {
      const card = prev.cards.find(c => c.currency === currency);
      if (!card || card.balance < totalDebit) return prev;
      return {
        ...prev,
        cards: prev.cards.map(c => c.id === card.id ? { ...c, balance: c.balance - totalDebit } : c),
        transactions: [
          {
            id: Date.now().toString(),
            type: 'expense',
            amount,
            currency,
            category: 'Перевод',
            merchant,
            date: new Date().toISOString(),
            icon: 'send',
            fee
          },
          ...prev.transactions
        ]
      };
    });
  }, []);

  const exchangeCurrency = useCallback((from: Currency, to: Currency, amountFrom: number) => {
    setState(prev => {
      const cardFrom = prev.cards.find(c => c.currency === from);
      const cardTo = prev.cards.find(c => c.currency === to);
      if (!cardFrom || !cardTo || cardFrom.balance < amountFrom) return prev;
      const rate = rates[to] / rates[from];
      const amountTo = amountFrom * rate;
      return {
        ...prev,
        cards: prev.cards.map(c => {
          if (c.id === cardFrom.id) return { ...c, balance: c.balance - amountFrom };
          if (c.id === cardTo.id) return { ...c, balance: c.balance + amountTo };
          return c;
        }),
        transactions: [
          {
            id: Date.now().toString(),
            type: 'exchange',
            amount: amountFrom,
            currency: from,
            category: 'Обмен',
            merchant: `Обмен ${from} на ${to}`,
            date: new Date().toISOString(),
            icon: 'swap',
            fromCurrency: from,
            toCurrency: to
          },
          ...prev.transactions
        ]
      };
    });
  }, [rates]);

  const setUserName = useCallback((name: string) => {
    setState(prev => ({ ...prev, userName: name }));
  }, []);

  const resetWallet = useCallback(() => {
    if (window.confirm('Вы уверены, что хотите сбросить кошелек?')) {
      localStorage.removeItem(STORAGE_KEY);
      setState(INITIAL_STATE);
    }
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={
          <Home 
            state={state} 
            onTopUp={addBalance} 
            rates={rates} 
            onExchange={exchangeCurrency}
            onSetName={setUserName}
            onResetWallet={resetWallet}
          />
        } />
        <Route path="/transfers" element={<Transfers onSend={makeTransaction} cards={state.cards} />} />
        <Route path="/exchange" element={<Exchange state={state} rates={rates} onExchange={exchangeCurrency} />} />
        <Route path="/history" element={<History transactions={state.transactions} />} />
      </Routes>
    </Layout>
  );
};

export default App;

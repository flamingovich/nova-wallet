
import React, { useState, useEffect } from 'react';
import { Transaction, Currency } from '../types';
import Icons from '../components/Icons';

interface HistoryProps {
  transactions: Transaction[];
}

const History: React.FC<HistoryProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    if (selectedTx) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    }
    return () => { 
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    };
  }, [selectedTx]);

  const filtered = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesSearch = t.merchant.toLowerCase().includes(search.toLowerCase()) || 
                          t.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCurrencySymbol = (cur: Currency) => {
    switch(cur) {
      case 'RUB': return '₽';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'USDT': return '₮';
      default: return cur;
    }
  };

  const getCategoryMeta = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('еда') || cat.includes('food')) {
      return { icon: 'coffee', color: 'bg-orange-50 text-orange-600 border-orange-100', grad: 'from-orange-400 to-orange-500' };
    }
    if (cat.includes('зарплата') || cat.includes('salary')) {
      return { icon: 'salary', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', grad: 'from-emerald-400 to-emerald-500' };
    }
    if (cat.includes('обмен') || cat.includes('crypto')) {
      return { icon: 'nova', color: 'bg-teal-50 text-teal-600 border-teal-100', grad: 'from-teal-400 to-teal-500' };
    }
    if (cat.includes('пополнение')) {
      return { icon: 'plus', color: 'bg-blue-50 text-blue-600 border-blue-100', grad: 'from-blue-400 to-blue-500' };
    }
    if (cat.includes('перевод')) {
      return { icon: 'send', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', grad: 'from-indigo-400 to-indigo-500' };
    }
    return { icon: 'bank', color: 'bg-slate-50 text-slate-400 border-slate-100', grad: 'from-slate-300 to-slate-400' };
  };

  return (
    <>
      <div className="space-y-5 pb-4 text-slate-800 animate-fluid-fade">
        <div className="flex flex-col space-y-3 mt-1 animate-fluid-down">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">История</h1>
          <div className="flex bg-slate-100/50 rounded-2xl p-0.5 border border-slate-100">
            {(['all', 'income', 'expense'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                {f === 'all' ? 'Все' : f === 'income' ? 'Доход' : 'Расход'}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-200">
            <Icons name="search" className="w-4 h-4" />
          </div>
          <input 
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold focus:outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((tx, idx) => {
            const meta = getCategoryMeta(tx.category);
            return (
              <div 
                key={tx.id} 
                onClick={() => setSelectedTx(tx)}
                className="bg-white rounded-[24px] p-3 flex items-center justify-between border border-slate-50 active:scale-[0.98] transition-all cursor-pointer animate-fluid-up"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${meta.color}`}>
                    <Icons name={meta.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[13px] tracking-tight text-slate-800">{tx.merchant}</h4>
                    <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">{tx.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-[14px] font-black ${tx.type === 'expense' ? 'text-slate-900' : 'text-emerald-500'}`}>
                    {tx.type === 'expense' ? '−' : '+'}{tx.amount.toLocaleString()} <span className="text-[10px] opacity-20">{getCurrencySymbol(tx.currency)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTx && (
        <div className="fixed inset-0 z-[10000] bg-white flex flex-col animate-fluid-up">
            <div className={`h-[30vh] w-full flex flex-col items-center justify-center bg-gradient-to-br ${getCategoryMeta(selectedTx.category).grad}`}>
               <button onClick={() => setSelectedTx(null)} className="absolute top-10 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                 <Icons name="qr" className="w-5 h-5 rotate-45" />
               </button>
               <div className="w-20 h-20 rounded-[28px] bg-white shadow-xl flex items-center justify-center border-2 border-white/50">
                  <div className={`${getCategoryMeta(selectedTx.category).color.split(' ')[1]}`}>
                    <Icons name={getCategoryMeta(selectedTx.category).icon} className="w-10 h-10" />
                  </div>
               </div>
            </div>

            <div className="flex-1 -mt-8 bg-white rounded-t-[40px] p-6 space-y-8 shadow-2xl overflow-y-auto">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedTx.merchant}</h3>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  {selectedTx.amount.toLocaleString()} <span className="text-xl opacity-20">{getCurrencySymbol(selectedTx.currency)}</span>
                </div>
                <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase">Успешно</div>
              </div>

              <div className="space-y-0.5 bg-slate-50 p-2 rounded-[28px]">
                {[
                    { label: 'Дата', value: new Date(selectedTx.date).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) },
                    { label: 'Комиссия', value: `${(selectedTx.fee || 0).toFixed(2)} ${getCurrencySymbol(selectedTx.currency)}` },
                    { label: 'Всего списано', value: `${((selectedTx.amount || 0) + (selectedTx.fee || 0)).toFixed(2)} ${getCurrencySymbol(selectedTx.currency)}` },
                    { label: 'ID платежа', value: selectedTx.id.slice(-8).toUpperCase() },
                ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center px-4 py-4 border-b border-white last:border-0">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{row.label}</span>
                        <span className="text-[12px] font-bold text-slate-700">{row.value}</span>
                    </div>
                ))}
              </div>

              <button onClick={() => setSelectedTx(null)} className="w-full bg-slate-900 text-white py-5 rounded-[22px] font-black text-xs uppercase">Закрыть</button>
            </div>
        </div>
      )}
    </>
  );
};

export default History;

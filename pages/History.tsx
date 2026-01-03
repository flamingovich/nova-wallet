
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

  // Блокируем скролл основного окна при открытой модалке
  useEffect(() => {
    if (selectedTx) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; // Дополнительная блокировка для iOS
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
    if (cat.includes('еда') || cat.includes('кафе') || cat.includes('food')) {
      return { icon: 'coffee', color: 'bg-orange-50 text-orange-600 border-orange-100', grad: 'from-orange-400 to-orange-500' };
    }
    if (cat.includes('зарплата') || cat.includes('salary') || cat.includes('доход')) {
      return { icon: 'salary', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', grad: 'from-emerald-400 to-emerald-500' };
    }
    if (cat.includes('развлечения') || cat.includes('кино') || cat.includes('fun')) {
      return { icon: 'star', color: 'bg-purple-50 text-purple-600 border-purple-100', grad: 'from-purple-400 to-purple-500' };
    }
    if (cat.includes('крипто') || cat.includes('обмен') || cat.includes('crypto')) {
      return { icon: 'nova', color: 'bg-teal-50 text-teal-600 border-teal-100', grad: 'from-teal-400 to-teal-500' };
    }
    if (cat.includes('пополнение') || cat.includes('topup')) {
      return { icon: 'plus', color: 'bg-blue-50 text-blue-600 border-blue-100', grad: 'from-blue-400 to-blue-500' };
    }
    if (cat.includes('перевод') || cat.includes('transfer')) {
      return { icon: 'send', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', grad: 'from-indigo-400 to-indigo-500' };
    }
    if (cat.includes('транспорт') || cat.includes('такси') || cat.includes('car')) {
      return { icon: 'car', color: 'bg-slate-100 text-slate-600 border-slate-200', grad: 'from-slate-400 to-slate-500' };
    }
    return { icon: 'bank', color: 'bg-slate-50 text-slate-400 border-slate-100', grad: 'from-slate-300 to-slate-400' };
  };

  return (
    <>
      {/* Контент страницы обернут в анимацию отдельно */}
      <div className="space-y-7 pb-4 text-slate-800 animate-fluid-fade">
        <div className="flex flex-col space-y-4 mt-2 animate-fluid-down">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">История</h1>
          <div className="flex bg-slate-100/50 rounded-[22px] p-1 border border-slate-100 overflow-hidden">
            {(['all', 'income', 'expense'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-4 py-3 rounded-[18px] text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {f === 'all' ? 'Все' : f === 'income' ? 'Доход' : 'Расход'}
              </button>
            ))}
          </div>
        </div>

        <div className="relative group" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors duration-300">
            <Icons name="search" className="w-5 h-5" />
          </div>
          <input 
            type="text"
            placeholder="Поиск по мерчантам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-[24px] py-4.5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-blue-300 focus:shadow-lg transition-all duration-300 placeholder:text-slate-200 text-slate-700 shadow-sm"
          />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icons name="search" className="w-10 h-10 text-slate-100" />
              </div>
              <p className="text-slate-300 text-sm font-black uppercase tracking-widest">Нет операций</p>
            </div>
          ) : (
            filtered.map((tx, idx) => {
              const meta = getCategoryMeta(tx.category);
              return (
                <div 
                  key={tx.id} 
                  onClick={() => setSelectedTx(tx)}
                  style={{ animationDelay: `${0.15 + idx * 0.04}s` }}
                  className="bg-white rounded-[32px] p-4 flex items-center justify-between border border-slate-50 group hover:border-blue-100 transition-all duration-500 shadow-sm active:scale-[0.98] cursor-pointer hover:shadow-lg animate-fluid-up will-change-gpu"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-[20px] border flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-active:scale-90 ${meta.color}`}>
                      <Icons name={meta.icon} className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-[15px] tracking-tight text-slate-800">{tx.merchant}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                            {tx.category}
                        </span>
                        <span className="text-[9px] text-slate-300 font-bold uppercase">
                            {new Date(tx.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className={`flex items-baseline gap-1 text-[16px] font-black tracking-tight block transition-colors duration-300 ${tx.type === 'expense' ? 'text-slate-900' : 'text-emerald-500'}`}>
                        <span>{tx.type === 'expense' ? '−' : tx.type === 'exchange' ? '⇌' : '+'}</span>
                        <span className="text-[10px] opacity-30">{getCurrencySymbol(tx.currency)}</span>
                        <span>{tx.amount.toLocaleString('ru-RU', { minimumFractionDigits: 0 })}</span>
                    </div>
                    <span className="text-[8px] text-slate-200 font-mono mt-0.5 block uppercase tracking-tighter">ID: {tx.id.slice(-6)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* МОДАЛКА ВЫНЕСЕНА НАРУЖУ - Это исправляет обрезку на iOS */}
      {selectedTx && (
        <div className="fixed inset-0 z-[10000] bg-white overflow-y-auto overscroll-none" style={{ touchAction: 'auto' }}>
          <div className="min-h-screen flex flex-col w-full bg-white animate-fluid-up">
            
            {/* Header Area */}
            <div className={`relative h-[38vh] min-h-[300px] w-full flex flex-col items-center justify-center bg-gradient-to-br ${getCategoryMeta(selectedTx.category).grad}`}>
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
               
               {/* Кнопка закрытия */}
               <button 
                onClick={() => setSelectedTx(null)}
                className="absolute top-14 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white active:scale-90 transition-all z-[101] border border-white/20 shadow-2xl"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12"/></svg>
               </button>

               <div className="w-24 h-24 rounded-[36px] bg-white shadow-2xl flex items-center justify-center relative z-10 animate-fluid-scale border-4 border-white/50">
                  <div className={`${getCategoryMeta(selectedTx.category).color.split(' ')[1]}`}>
                    <Icons name={getCategoryMeta(selectedTx.category).icon} className="w-12 h-12" />
                  </div>
               </div>
               
               <div className="mt-6 text-white/90 text-[11px] font-black uppercase tracking-[0.3em] relative z-10 px-5 py-2 bg-black/10 rounded-full backdrop-blur-md border border-white/10">
                 {selectedTx.category}
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 -mt-10 bg-white rounded-t-[50px] relative z-10 p-6 sm:p-8 pt-12 flex flex-col space-y-10 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,40px)]">
              
              <div className="text-center space-y-4">
                <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-tight px-4">{selectedTx.merchant}</h3>

                <div className="flex items-center justify-center gap-1.5 text-6xl font-black tracking-tighter text-slate-900 py-2">
                  <span className="text-slate-300 text-3xl mt-3">{selectedTx.type === 'expense' ? '−' : selectedTx.type === 'exchange' ? '⇌' : '+'}</span>
                  <span className="text-2xl text-slate-200 mt-4">{getCurrencySymbol(selectedTx.currency)}</span>
                  <span className="truncate">{selectedTx.amount.toLocaleString('ru-RU', { minimumFractionDigits: 0 })}</span>
                  <span className="text-2xl opacity-10 mt-5">,00</span>
                </div>

                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-emerald-100">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  Исполнено банком
                </div>
              </div>

              <div className="space-y-1 bg-slate-50/50 p-2 rounded-[40px] border border-slate-50 shadow-inner">
                {[
                    { label: 'Дата транзакции', value: new Date(selectedTx.date).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) },
                    { label: 'Тип операции', value: selectedTx.type === 'expense' ? 'Расход' : selectedTx.type === 'exchange' ? 'Конвертация' : 'Доход' },
                    { label: 'ID транзакции', value: selectedTx.id.toUpperCase().slice(-8), isMono: true },
                    { label: 'Комиссия', value: '0.00 ' + getCurrencySymbol(selectedTx.currency) },
                ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center px-6 py-5 border-b border-white last:border-0">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest shrink-0 mr-4">{row.label}</span>
                        <span className={`text-[13px] font-bold text-slate-700 text-right ${row.isMono ? 'font-mono text-slate-400 tracking-widest' : ''}`}>{row.value}</span>
                    </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button className="w-full bg-blue-600 text-white py-6 rounded-[30px] font-black text-[11px] uppercase tracking-widest active:scale-[0.97] shadow-2xl shadow-blue-100 transition-all hover:bg-blue-700 flex items-center justify-center gap-2">
                   <Icons name="send" className="w-5 h-5" />
                   Повторить платеж
                </button>
                <button className="w-full bg-slate-50 text-slate-400 py-6 rounded-[30px] font-black text-[11px] uppercase tracking-widest active:scale-[0.97] transition-all hover:bg-slate-100 flex items-center justify-center gap-2">
                   <Icons name="list" className="w-5 h-5" />
                   Квитанция об операции
                </button>
              </div>

              {/* Декоративная перфорация */}
              <div className="flex items-center justify-center gap-2 opacity-5 py-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-slate-900 rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default History;

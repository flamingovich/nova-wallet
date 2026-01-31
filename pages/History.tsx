
import React, { useState } from 'react';
import { Transaction, Currency } from '../types';
import Icons from '../components/Icons';

interface HistoryProps {
  transactions: Transaction[];
}

const History: React.FC<HistoryProps> = ({ transactions }) => {
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const getCurrencySymbol = (cur: Currency) => {
    switch(cur) {
      case 'RUB': return '₽';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'USDT': return '₮';
      default: return cur;
    }
  };

  const getIconBg = (tx: Transaction) => {
    if (tx.type === 'income') return 'bg-emerald-500 text-white';
    if (tx.merchant.toLowerCase().includes('santa')) return 'bg-blue-400 text-white';
    if (tx.category.toLowerCase().includes('перевод')) return 'bg-emerald-500 text-white';
    return 'bg-blue-500 text-white';
  };

  // Grouping by date
  const grouped = transactions.reduce((groups, tx) => {
    const date = new Date(tx.date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    if (date.toDateString() === today.toDateString()) dateStr = 'Сегодня, ' + dateStr;
    else if (date.toDateString() === yesterday.toDateString()) dateStr = 'Вчера, ' + dateStr;

    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-4 animate-fluid-fade">
      {/* Search and Filters Header */}
      <div className="flex items-center justify-between px-1">
         <h1 className="text-2xl font-black text-slate-800">История</h1>
         <Icons name="search" className="w-6 h-6 text-slate-400" />
      </div>

      <div className="flex gap-2 px-1 overflow-x-auto no-scrollbar pb-2">
         {['Период', 'Вид операции', 'Категория'].map((f) => (
           <div key={f} className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-full px-3 py-1.5 whitespace-nowrap text-[11px] font-bold text-slate-600 shadow-sm">
              {f} <Icons name="arrow-down" className="w-3 h-3 text-slate-300" />
           </div>
         ))}
      </div>

      {/* Summary Card REMOVED as requested */}

      {/* List grouped by dates */}
      <div className="space-y-6 px-1">
         {(Object.entries(grouped) as [string, Transaction[]][]).map(([date, items]) => (
           <div key={date} className="space-y-3">
              <h3 className="text-[15px] font-black text-slate-800 px-1">{date}</h3>
              <div className="space-y-0.5">
                 {items.map((tx) => (
                   <div 
                     key={tx.id} 
                     onClick={() => setSelectedTx(tx)}
                     className="bg-white p-4 first:rounded-t-[24px] last:rounded-b-[24px] flex items-center justify-between border-b border-slate-50 last:border-0 active:bg-slate-50 transition-colors cursor-pointer"
                   >
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBg(tx)}`}>
                           <Icons name={tx.icon === 'plus' ? 'plus' : 'swap'} className={`w-5 h-5 ${tx.type === 'expense' && tx.icon !== 'plus' ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[12px] font-black text-slate-800 uppercase leading-tight">{tx.merchant}</span>
                           <span className="text-[10px] font-bold text-slate-400">Карта *4242</span>
                           <span className="text-[10px] font-bold text-slate-300">{new Date(tx.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                     </div>
                     <div className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-800'}`}>
                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-[10px]">{getCurrencySymbol(tx.currency)}</span>
                     </div>
                   </div>
                 ))}
              </div>
           </div>
         ))}
      </div>

      {/* Detail View - Nova Style */}
      {selectedTx && (
        <div className="fixed inset-0 z-[2000] bg-white flex flex-col animate-fluid-up overflow-y-auto pb-10">
          <div className="h-12 flex items-center px-4 pt-10">
             <button onClick={() => setSelectedTx(null)} className="text-slate-800">
                <Icons name="arrow-up" className="w-6 h-6 -rotate-90" />
             </button>
             <div className="flex-1 flex justify-center">
                <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
                   <span className="text-blue-600 font-black">N</span> NOVABANK
                </div>
             </div>
          </div>

          <div className="flex flex-col items-center pt-8 space-y-4 px-6 text-center">
             <h2 className="text-[14px] font-black uppercase text-slate-800 tracking-tight leading-tight">
                {selectedTx.merchant}
             </h2>
             
             <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${getIconBg(selectedTx)}`}>
                <Icons name="swap" className={`w-10 h-10 ${selectedTx.type === 'expense' ? 'rotate-180' : ''}`} />
             </div>

             <div className={`text-3xl font-black ${selectedTx.type === 'income' ? 'text-emerald-500' : 'text-slate-800'}`}>
                {selectedTx.type === 'income' ? '+' : '-'}{selectedTx.amount.toLocaleString()} <span className="text-xl">{getCurrencySymbol(selectedTx.currency)}</span>
             </div>

             <div className="flex items-center gap-2 border-t border-slate-100 pt-4 w-full justify-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${getIconBg(selectedTx)}`}>
                  <Icons name="swap" className="w-3 h-3" />
                </div>
                <span className="text-sm font-bold text-slate-800">Переводы {selectedTx.type === 'income' ? 'от других людей' : ''}</span>
             </div>
          </div>

          <div className="mt-8 px-6 space-y-6">
             <div className="space-y-4">
                {[
                  { label: 'Дата и время операции', value: new Date(selectedTx.date).toLocaleString('ru-RU') },
                  { label: 'Статус операции', value: 'Исполнена' },
                  { label: 'Отражение операции по счету', value: new Date(selectedTx.date).toLocaleDateString('ru-RU') },
                  { label: 'Счет', value: '301431PPFW0010270' },
                  { label: 'Комиссия банка (5%)', value: `${(selectedTx.fee || 0).toFixed(2)} ${getCurrencySymbol(selectedTx.currency)}` },
                  { label: 'Дополнительная информация', value: `${selectedTx.merchant} Перевод между счетами физических лиц на основании эл. сообщ. от ${new Date(selectedTx.date).toLocaleDateString('ru-RU')}` },
                ].map((row) => (
                  <div key={row.label} className="space-y-1">
                     <p className="text-[12px] font-bold text-slate-400">{row.label}</p>
                     <p className="text-[14px] font-black text-slate-800 leading-tight">{row.value}</p>
                  </div>
                ))}
             </div>

             <div className="space-y-3 pt-4 border-t border-slate-50">
                <button className="w-full flex items-center gap-3 text-slate-800 font-bold py-2">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-blue-600">
                      <Icons name="list" className="w-5 h-5" />
                   </div>
                   Чек по операции
                </button>
                <button className="w-full flex items-center gap-3 text-slate-800 font-bold py-2">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-blue-500">
                      <Icons name="swap" className="w-5 h-5" />
                   </div>
                   Повторить
                </button>
                <button className="w-full flex items-center gap-3 text-slate-800 font-bold py-2">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-amber-500">
                      <Icons name="star" className="w-5 h-5" />
                   </div>
                   Добавить в шаблоны
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;

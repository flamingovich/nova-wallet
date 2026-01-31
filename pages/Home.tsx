
import React, { useState } from 'react';
import { AppState, Currency, Card } from '../types';
import Icons from '../components/Icons';

interface HomeProps {
  state: AppState;
  onTopUp: (cardId: string, amount: number) => void;
  rates: Record<string, number>;
  onExchange: (from: Currency, to: Currency, amountFrom: number) => void;
  onSetName: (name: string) => void;
  onResetWallet: () => void;
}

const Home: React.FC<HomeProps> = ({ state, onTopUp, rates, onExchange, onSetName, onResetWallet }) => {
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(state.cards[0]?.id || '');
  const [topUpAmount, setTopUpAmount] = useState('');

  const getCurrencySymbol = (cur: Currency) => {
    switch(cur) {
      case 'RUB': return '₽';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'USDT': return '₮';
      default: return cur;
    }
  };

  const getCardStyle = (card: Card) => {
    switch(card.currency) {
      case 'RUB': return 'bg-gradient-to-br from-slate-800 to-black text-white';
      case 'USD': return 'bg-gradient-to-br from-blue-700 to-blue-900 text-white';
      case 'EUR': return 'bg-gradient-to-br from-emerald-600 to-teal-900 text-white';
      case 'USDT': return 'bg-gradient-to-br from-cyan-600 to-blue-800 text-white';
      default: return 'bg-white text-slate-800';
    }
  };

  const handleTopUp = () => {
    const amt = parseFloat(topUpAmount);
    if (!isNaN(amt) && amt > 0 && selectedCardId) {
      onTopUp(selectedCardId, amt);
      setTopUpAmount('');
      setIsTopUpOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-4 animate-fluid-fade">
      {/* Header with profile */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl border-2 border-white shadow-sm">
            {state.userName.charAt(0)}
          </div>
          <div className="flex items-center gap-1.5 bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 text-[13px] font-bold">
            <span className="text-blue-600 font-black">N</span>
            <span className="uppercase tracking-widest text-[10px]">NOVABANK</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
           <Icons name="search" className="w-6 h-6" />
           <Icons name="qr" className="w-6 h-6" />
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-2 gap-3 px-1">
        {/* Special Platinum Tile */}
        <div className="col-span-1 h-36 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 rounded-[28px] p-4 flex flex-col justify-between text-slate-800 tile-shadow relative overflow-hidden group">
           <div className="absolute top-4 right-4 w-6 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm shadow-inner opacity-80"></div>
           <Icons name="star" className="w-8 h-8 opacity-80 text-blue-600" />
           <div>
             <p className="text-sm font-black">Nova Platinum</p>
             <p className="text-[10px] opacity-60 font-bold uppercase">Priority Pass</p>
           </div>
        </div>

        {/* Currency Accounts as Tiles */}
        {state.cards.map((card) => (
          <div 
            key={card.id}
            onClick={() => { setSelectedCardId(card.id); setIsTopUpOpen(true); }}
            className={`h-36 rounded-[28px] p-4 flex flex-col justify-between tile-shadow border border-white/10 active:scale-95 transition-all cursor-pointer relative overflow-hidden ${getCardStyle(card)}`}
          >
            {/* Real Card Elements */}
            <div className="absolute top-4 right-4 w-7 h-5 bg-gradient-to-br from-amber-200/50 to-amber-400/50 rounded shadow-inner border border-white/10"></div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="flex flex-col z-10">
               <span className="text-sm font-black tracking-widest leading-none">{card.currency}</span>
               <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">Current Account</span>
            </div>
            
            <div className="space-y-0.5 z-10">
               <p className="text-[9px] font-mono opacity-50 leading-tight tracking-wider">•••• {card.number.slice(-4)}</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-xl font-black tracking-tighter">
                   {card.balance.toLocaleString('ru-RU')}
                 </span>
                 <span className="text-xs font-black opacity-40">{getCurrencySymbol(card.currency)}</span>
               </div>
            </div>
          </div>
        ))}

        {/* Bonus Tile */}
        <div className="h-36 bg-white rounded-[28px] p-4 flex flex-col justify-between tile-shadow border border-slate-50 relative overflow-hidden">
           <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-blue-500/5 rounded-full blur-lg"></div>
           <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 relative">
              <Icons name="bell" className="w-4 h-4" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></div>
           </div>
           <div>
              <p className="text-sm font-black text-slate-800">Бонусы</p>
              <p className="text-[10px] text-slate-400 font-bold">1 240 баллов</p>
           </div>
        </div>
      </div>

      {/* Floating Action Hint */}
      <div className="px-1 pt-2">
         <div className="bg-slate-900 text-white rounded-[22px] p-4 flex items-center justify-between shadow-lg shadow-slate-200 overflow-hidden relative group cursor-pointer active:scale-95 transition-transform">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
            <div className="flex items-center gap-3 relative z-10">
               <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
                  <Icons name="nova" className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-xs font-black">Nova Credit</p>
                  <p className="text-[9px] opacity-80 font-bold uppercase tracking-widest">Лимит до 500 000 ₽</p>
               </div>
            </div>
            <Icons name="arrow-up" className="w-4 h-4 rotate-90 relative z-10" />
         </div>
      </div>

      {/* Quick Actions */}
      <section className="px-1 space-y-3">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Рекомендации</h2>
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white p-4 rounded-[24px] border border-slate-50 shadow-sm flex items-center gap-3 active:scale-95 transition-transform cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                 <Icons name="plus" className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black text-slate-800">Пополнить</span>
           </div>
           <div className="bg-white p-4 rounded-[24px] border border-slate-50 shadow-sm flex items-center gap-3 active:scale-95 transition-transform cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                 <Icons name="swap" className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black text-slate-800">Обменять</span>
           </div>
        </div>
      </section>

      {/* TopUp Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 pb-24">
          <div className="bg-white w-full max-w-sm rounded-[36px] p-6 space-y-6 animate-fluid-up">
            <div className="text-center">
               <h3 className="text-lg font-black text-slate-800">Пополнить счет</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Карта •••• {state.cards.find(c => c.id === selectedCardId)?.number.slice(-4)}</p>
            </div>
            <div className="space-y-4">
               <input 
                 autoFocus
                 type="number" 
                 value={topUpAmount} 
                 onChange={(e) => setTopUpAmount(e.target.value)} 
                 placeholder="Сумма" 
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center font-black text-2xl focus:outline-none text-slate-800" 
               />
               <button onClick={handleTopUp} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all">Подтвердить</button>
               <button onClick={() => setIsTopUpOpen(false)} className="w-full text-slate-300 font-black text-[10px] uppercase">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

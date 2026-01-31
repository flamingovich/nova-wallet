
import React, { useState, useRef } from 'react';
import { AppState, Currency } from '../types';
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
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(state.cards[0]?.id || '');
  const [topUpAmount, setTopUpAmount] = useState('');

  const [exchangeFrom, setExchangeFrom] = useState<Currency>('USDT');
  const [exchangeTo, setExchangeTo] = useState<Currency>('RUB');
  const [exchangeAmount, setExchangeAmount] = useState('');

  const [newName, setNewName] = useState(state.userName);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth * 0.7;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
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

  const handleExchange = () => {
    const amt = parseFloat(exchangeAmount);
    if (!isNaN(amt) && amt > 0) {
      onExchange(exchangeFrom, exchangeTo, amt);
      setExchangeAmount('');
      setIsExchangeOpen(false);
    }
  };

  const handleNameSave = () => {
    onSetName(newName);
    setIsProfileOpen(false);
  };

  const getCurrencySymbol = (cur: Currency) => {
    switch(cur) {
      case 'RUB': return '₽';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'USDT': return '₮';
      default: return cur;
    }
  };

  const getBrandLogo = (type: string) => {
    if (type.includes('MIR')) return <div className="text-[12px] font-black italic text-white">МИР</div>;
    if (type.includes('Visa')) return <div className="text-[14px] font-black italic text-white">VISA</div>;
    if (type.includes('MasterCard')) return (
      <div className="flex -space-x-1.5">
        <div className="w-4 h-4 rounded-full bg-[#EB001B]/80"></div>
        <div className="w-4 h-4 rounded-full bg-[#F79E1B]/80"></div>
      </div>
    );
    return <Icons name="nova" className="w-5 h-5 text-white/80" />;
  };

  const exchangeRateValue = rates[exchangeTo] / rates[exchangeFrom];

  return (
    <div className="space-y-5 pb-4 text-slate-900 will-change-gpu">
      {/* Шапка */}
      <div className="flex justify-between items-center pt-0 animate-fluid-down">
        <h1 className="text-xl font-black tracking-tight text-slate-800">Привет, {state.userName}</h1>
        <button onClick={() => { setNewName(state.userName); setIsProfileOpen(true); }} className="active:scale-90 transition-transform">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-md ring-1 ring-slate-100 p-0.5">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full rounded-[10px] bg-slate-50" />
          </div>
        </button>
      </div>

      {/* Счета и карты */}
      <section className="space-y-3 animate-fluid-up">
        <div className="flex justify-between items-end px-1">
          <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Мои счета</h2>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 pb-1"
        >
          {state.cards.map((card) => (
            <div 
              key={card.id}
              className="min-w-[80vw] sm:min-w-[300px] h-[180px] rounded-[24px] p-5 flex flex-col justify-between shadow-xl relative snap-center border-0 text-white transition-all overflow-hidden group will-change-gpu"
              style={{ background: card.color }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 opacity-60"></div>
              
              <div className="flex justify-between items-start z-10">
                <div className="w-8 h-6 rounded bg-gradient-to-br from-amber-300 to-amber-400 shadow-inner border border-amber-500/20"></div>
                <div className="flex flex-col items-end">
                   {getBrandLogo(card.type)}
                   <span className="text-[7px] font-black text-white/30 uppercase tracking-tighter mt-1">{card.type.split(' ')[0]}</span>
                </div>
              </div>

              <div className="z-10">
                <p className="text-[8px] font-black text-white/50 mb-0.5 uppercase tracking-widest">Баланс</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-black text-white/60">{getCurrencySymbol(card.currency)}</span>
                  <span className="text-3xl font-black tracking-tighter">{card.balance.toLocaleString('ru-RU')}</span>
                </div>
              </div>

              <div className="flex justify-between items-end z-10 pt-3 border-t border-white/10">
                <span className="text-[12px] font-mono tracking-[0.2em] text-white/90">{card.number}</span>
                <span className="text-[8px] font-bold text-white/60 uppercase">{card.expiry}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Быстрые действия */}
      <div className="bg-white/80 backdrop-blur-md p-1 rounded-[28px] flex justify-around border border-white shadow-lg animate-fluid-up">
        {[
          { label: 'Ввод', icon: 'plus', action: () => setIsTopUpOpen(true) },
          { label: 'Обмен', icon: 'swap', color: 'text-emerald-500', action: () => setIsExchangeOpen(true) },
          { label: 'Перевод', icon: 'send', color: 'text-blue-500' },
          { label: 'Еще', icon: 'star' }
        ].map((act, i) => (
          <button key={i} onClick={act.action} className="flex flex-col items-center gap-1.5 py-3 px-1 w-full rounded-[22px] active:bg-slate-50 transition-all">
            <div className={`w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-50 flex items-center justify-center ${act.color || 'text-slate-400'}`}>
              <Icons name={act.icon} className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{act.label}</span>
          </button>
        ))}
      </div>

      {/* Операции */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Последние операции</h2>
        </div>
        
        <div className="space-y-2">
          {state.transactions.slice(0, 4).map((tx) => (
            <div key={tx.id} className="p-3 bg-white rounded-[22px] flex items-center justify-between border border-slate-50 shadow-sm active:scale-[0.98] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Icons name={tx.icon} className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight text-slate-800">{tx.merchant}</h4>
                  <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">{tx.category}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-black ${tx.type === 'expense' ? 'text-slate-800' : 'text-emerald-500'}`}>
                  {tx.type === 'expense' ? '−' : '+'}{tx.amount.toLocaleString()} <span className="text-[9px] opacity-30">{getCurrencySymbol(tx.currency)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Модалки (упрощенные и компактные) */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fluid-fade">
          <div className="bg-white w-full max-w-xs rounded-[32px] p-6 space-y-6 shadow-2xl animate-fluid-scale">
            <h3 className="text-lg font-black text-center">Профиль</h3>
            <div className="space-y-4">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-50 rounded-xl p-3 text-center font-bold text-sm focus:outline-none" />
              <button onClick={handleNameSave} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm">Сохранить</button>
              <button onClick={() => { onResetWallet(); setIsProfileOpen(false); }} className="w-full text-rose-500 font-bold text-[9px] uppercase tracking-widest">Сброс данных</button>
            </div>
            <button onClick={() => setIsProfileOpen(false)} className="w-full text-slate-300 font-bold text-[9px] uppercase">Закрыть</button>
          </div>
        </div>
      )}

      {isExchangeOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fluid-fade">
          <div className="bg-white w-full max-w-xs rounded-[36px] p-6 space-y-6 shadow-2xl animate-fluid-scale">
            <div className="text-center space-y-1">
                <h3 className="text-xl font-black">Курсы валют</h3>
                <p className="text-[8px] font-black text-emerald-500 uppercase">1 {exchangeFrom} = {exchangeRateValue.toFixed(2)} {exchangeTo}</p>
            </div>
            <div className="space-y-4">
               <div className="relative">
                  <input type="number" value={exchangeAmount} onChange={(e) => setExchangeAmount(e.target.value)} placeholder="Сумма" className="w-full bg-slate-50 rounded-2xl p-4 text-center font-black text-2xl focus:outline-none" />
               </div>
               <div className="flex gap-2">
                  {(['RUB', 'USD', 'EUR'] as Currency[]).map(cur => (
                    <button key={cur} onClick={() => setExchangeTo(cur)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black ${exchangeTo === cur ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{cur}</button>
                  ))}
               </div>
               <button onClick={handleExchange} className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black text-sm shadow-lg shadow-emerald-100">Обменять</button>
            </div>
            <button onClick={() => setIsExchangeOpen(false)} className="w-full text-slate-300 font-bold text-[9px] uppercase">Отмена</button>
          </div>
        </div>
      )}

      {isTopUpOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fluid-fade">
          <div className="bg-white w-full max-w-xs rounded-[36px] p-6 space-y-6 shadow-2xl animate-fluid-scale">
            <h3 className="text-xl font-black text-center">Пополнение</h3>
            <div className="space-y-4">
               <input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 rounded-2xl p-4 text-center font-black text-2xl focus:outline-none" />
               <button onClick={handleTopUp} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm shadow-lg">Пополнить</button>
            </div>
            <button onClick={() => setIsTopUpOpen(false)} className="w-full text-slate-300 font-bold text-[9px] uppercase">Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;


import React, { useState } from 'react';
import { AppState, Currency, Card } from '../types';
import Icons from '../components/Icons';

interface ExchangeProps {
  state: AppState;
  rates: Record<string, number>;
  onExchange: (from: Currency, to: Currency, amountFrom: number) => void;
}

const Exchange: React.FC<ExchangeProps> = ({ state, rates, onExchange }) => {
  const [fromCard, setFromCard] = useState<Card>(state.cards[0]);
  const [toCard, setToCard] = useState<Card>(state.cards[1]);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Расчет курса: сколько единиц To за одну единицу From
  const currentRate = rates[toCard.currency] / rates[fromCard.currency];
  const resultAmount = amount ? (parseFloat(amount) * currentRate).toFixed(2) : '0.00';

  const handleSwap = () => {
    const temp = fromCard;
    setFromCard(toCard);
    setToCard(temp);
  };

  const executeExchange = () => {
    const amt = parseFloat(amount);
    if (!isNaN(amt) && amt > 0 && amt <= fromCard.balance) {
      setIsProcessing(true);
      setTimeout(() => {
        onExchange(fromCard.currency, toCard.currency, amt);
        setIsProcessing(false);
        setIsSuccess(true);
        setAmount('');
        setTimeout(() => setIsSuccess(false), 3000);
      }, 4500); // 4.5 секунды для имитации реальной обработки
    }
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

  const selectNextCard = (currentId: string, setter: (card: Card) => void) => {
    const idx = state.cards.findIndex(c => c.id === currentId);
    const nextIdx = (idx + 1) % state.cards.length;
    setter(state.cards[nextIdx]);
  };

  return (
    <div className="space-y-8 pb-4 text-slate-900 will-change-gpu">
      <div className="flex flex-col space-y-1 mt-2 animate-fluid-down">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Обмен валюты</h1>
      </div>

      <div className="bg-white rounded-[48px] p-6 sm:p-8 space-y-8 border border-slate-50 shadow-2xl relative overflow-hidden animate-fluid-scale">
        {/* Инфо о курсе */}
        <div className="flex justify-center">
          <div className="px-5 py-2 bg-slate-50 border border-slate-100 rounded-full animate-fluid-fade shadow-sm">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <span className="text-blue-500">1 {fromCard.currency}</span>
               <Icons name="swap" className="w-3 h-3 opacity-20" />
               <span className="text-emerald-500">{currentRate.toFixed(4)} {toCard.currency}</span>
             </p>
          </div>
        </div>

        <div className="space-y-3 relative">
          {/* ОТКУДА (From) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-4">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                СПИСАТЬ С
              </label>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Доступно: {fromCard.balance.toLocaleString()} {getCurrencySymbol(fromCard.currency)}</span>
            </div>
            
            <div className="bg-slate-50 rounded-[36px] p-5 flex flex-col gap-4 border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all group">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => selectNextCard(fromCard.id, setFromCard)}
                  className="flex items-center gap-3 bg-white p-2 pr-5 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-all hover:border-blue-200 group/btn"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0" style={{ background: fromCard.color }}>
                    <Icons name="credit-card" className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black text-slate-900 leading-none">{fromCard.type}</p>
                    <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase">{fromCard.currency}</p>
                  </div>
                  <Icons name="arrow-down" className="w-3 h-3 text-slate-200 group-hover/btn:text-blue-400 transition-colors" />
                </button>
                
                <div className="flex-1 text-right pl-4">
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-3xl font-black focus:outline-none placeholder:text-slate-200 text-slate-900 text-right"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Кнопка реверса (Swap) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <button 
              onClick={handleSwap}
              className="w-14 h-14 bg-white rounded-full shadow-2xl border-4 border-white flex items-center justify-center text-blue-500 active:rotate-180 transition-all duration-700 active:scale-90 group"
            >
              <div className="absolute inset-0 bg-blue-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              <Icons name="swap" className="w-6 h-6 rotate-90 relative z-10" />
            </button>
          </div>

          {/* КУДА (To) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-4 pt-4">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                ЗАЧИСЛИТЬ НА
              </label>
            </div>
            
            <div className="bg-slate-50 rounded-[36px] p-5 flex flex-col gap-4 border border-transparent transition-all">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => selectNextCard(toCard.id, setToCard)}
                  className="flex items-center gap-3 bg-white p-2 pr-5 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-all hover:border-emerald-200 group/btn"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0" style={{ background: toCard.color }}>
                    <Icons name="credit-card" className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black text-slate-900 leading-none">{toCard.type}</p>
                    <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase">{toCard.currency}</p>
                  </div>
                  <Icons name="arrow-down" className="w-3 h-3 text-slate-200 group-hover/btn:text-emerald-400 transition-colors" />
                </button>
                
                <div className="flex-1 text-right pl-4">
                  <span className={`text-3xl font-black ${amount ? 'text-emerald-600' : 'text-slate-200'} transition-colors`}>
                    {resultAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isSuccess && (
          <div className="bg-emerald-50 text-emerald-600 p-5 rounded-3xl border border-emerald-100 flex items-center gap-4 animate-fluid-scale shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <Icons name="nova" className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Успешно</p>
              <p className="text-xs font-bold text-emerald-700/70">Валюта зачислена на счет</p>
            </div>
          </div>
        )}

        <button 
          disabled={isProcessing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > fromCard.balance || fromCard.currency === toCard.currency}
          onClick={executeExchange}
          className="w-full bg-slate-900 text-white rounded-[32px] py-6 font-black text-lg active:scale-[0.98] transition-all shadow-xl disabled:bg-slate-50 disabled:text-slate-300 flex items-center justify-center gap-3 group overflow-hidden relative"
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <Icons name="swap" className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Обменять валюту</span>
            </>
          )}
        </button>

        <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">
          Безопасный моментальный обмен Nova
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 animate-fluid-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white rounded-[32px] p-6 border border-slate-50 shadow-sm space-y-2 group hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icons name="salary" className="w-5 h-5" />
            </div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest pt-2">Комиссия</p>
            <p className="text-xl font-black text-slate-900">0.0%</p>
        </div>
        <div className="bg-white rounded-[32px] p-6 border border-slate-50 shadow-sm space-y-2 group hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icons name="nova" className="w-5 h-5" />
            </div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest pt-2">Скорость</p>
            <p className="text-xl font-black text-slate-900">Мгновенно</p>
        </div>
      </div>
    </div>
  );
};

export default Exchange;

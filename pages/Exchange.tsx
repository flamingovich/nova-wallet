
import React, { useState, useMemo } from 'react';
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

  const currentRate = useMemo(() => {
    return rates[toCard.currency] / rates[fromCard.currency];
  }, [rates, fromCard.currency, toCard.currency]);

  const resultValue = useMemo(() => {
    const amt = parseFloat(amount);
    return isNaN(amt) ? 0 : amt * currentRate;
  }, [amount, currentRate]);

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
      }, 1500);
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

  const getCardBg = (cur: Currency) => {
    switch(cur) {
      case 'RUB': return 'bg-slate-900';
      case 'USD': return 'bg-blue-600';
      case 'EUR': return 'bg-emerald-600';
      case 'USDT': return 'bg-cyan-600';
      default: return 'bg-slate-100';
    }
  };

  const selectNextCard = (currentId: string, setter: (card: Card) => void) => {
    const idx = state.cards.findIndex(c => c.id === currentId);
    const nextIdx = (idx + 1) % state.cards.length;
    setter(state.cards[nextIdx]);
  };

  return (
    <div className="space-y-6 pb-10 animate-fluid-fade">
      <div className="flex justify-between items-center px-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-800 mt-1">Обмен валют</h1>
        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          Выгодный курс
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-6 border border-slate-50 shadow-xl relative animate-fluid-scale space-y-8">
        
        {/* Exchange Calculator Flow */}
        <div className="space-y-4">
          
          {/* FROM */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Продаю</span>
              <span className="text-[10px] font-bold text-slate-400">Доступно: {fromCard.balance.toLocaleString()} {getCurrencySymbol(fromCard.currency)}</span>
            </div>
            
            <div className="bg-slate-50 rounded-[28px] p-4 flex items-center justify-between border border-slate-100 group focus-within:bg-white focus-within:border-blue-200 transition-all">
               <button 
                onClick={() => selectNextCard(fromCard.id, setFromCard)}
                className="flex items-center gap-3 active:scale-95 transition-transform"
               >
                  <div className={`w-10 h-7 rounded-lg ${getCardBg(fromCard.currency)} flex items-center justify-center text-[10px] font-black text-white shadow-md`}>
                    {fromCard.currency}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-slate-800">{fromCard.type.split(' ')[0]}</span>
                    <span className="text-[9px] font-bold text-slate-400 italic">•••• {fromCard.number.slice(-4)}</span>
                  </div>
                  <Icons name="arrow-down" className="w-3 h-3 text-slate-300" />
               </button>

               <div className="flex-1 text-right ml-4">
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-right font-black text-2xl focus:outline-none text-slate-900 placeholder:text-slate-200"
                  />
               </div>
            </div>
          </div>

          {/* SWAP MIDDLE */}
          <div className="flex items-center gap-4">
            <div className="h-px bg-slate-100 flex-1"></div>
            <button 
              onClick={handleSwap}
              className="w-12 h-12 bg-white rounded-full shadow-lg border border-slate-50 flex items-center justify-center text-blue-600 active:rotate-180 transition-all duration-500"
            >
              <Icons name="swap" className="w-5 h-5 rotate-90" />
            </button>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          {/* TO */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Покупаю</span>
              <span className="text-[10px] font-bold text-blue-500 italic">Курс: 1 {fromCard.currency} = {currentRate.toFixed(4)} {toCard.currency}</span>
            </div>
            
            <div className="bg-slate-50 rounded-[28px] p-4 flex items-center justify-between border border-slate-100">
               <button 
                onClick={() => selectNextCard(toCard.id, setToCard)}
                className="flex items-center gap-3 active:scale-95 transition-transform"
               >
                  <div className={`w-10 h-7 rounded-lg ${getCardBg(toCard.currency)} flex items-center justify-center text-[10px] font-black text-white shadow-md`}>
                    {toCard.currency}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-slate-800">{toCard.type.split(' ')[0]}</span>
                    <span className="text-[9px] font-bold text-slate-400 italic">•••• {toCard.number.slice(-4)}</span>
                  </div>
                  <Icons name="arrow-down" className="w-3 h-3 text-slate-300" />
               </button>

               <div className="flex-1 text-right ml-4">
                  <span className={`text-2xl font-black ${resultValue > 0 ? 'text-emerald-500' : 'text-slate-200'}`}>
                    {resultValue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
               </div>
            </div>
          </div>
        </div>

        {isSuccess && (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-fluid-scale">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
               <Icons name="plus" className="w-5 h-5 rotate-45" />
            </div>
            <div>
               <p className="text-[11px] font-black uppercase tracking-widest">Обмен совершен</p>
               <p className="text-[9px] font-bold opacity-70">Средства уже зачислены на ваш счет</p>
            </div>
          </div>
        )}

        <button 
          disabled={isProcessing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > fromCard.balance}
          onClick={executeExchange}
          className="w-full bg-slate-900 text-white rounded-[24px] py-5 font-black text-sm active:scale-98 transition-all disabled:opacity-20 flex items-center justify-center gap-3 shadow-xl"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
               <Icons name="swap" className="w-5 h-5" />
               <span>Подтвердить обмен</span>
            </>
          )}
        </button>
      </div>

      {/* Info Card */}
      <div className="px-1">
         <div className="bg-blue-50/50 p-4 rounded-[28px] border border-blue-100 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
               <Icons name="nova" className="w-5 h-5" />
            </div>
            <div>
               <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Без скрытых комиссий</p>
               <p className="text-[10px] font-bold text-slate-400 leading-snug mt-0.5">NovaBank использует прямой рыночный курс для вашего удобства.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Exchange;

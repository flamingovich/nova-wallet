
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

  const resultFormatted = useMemo(() => {
    return resultValue.toLocaleString('ru-RU', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }, [resultValue]);

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
      }, 2000);
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
    <div className="space-y-5 pb-10 animate-fluid-fade">
      <h1 className="text-2xl font-black tracking-tight text-[#0f172a] mt-1">Обмен</h1>

      <div className="bg-white rounded-[40px] p-6 border border-slate-50 shadow-xl relative animate-fluid-scale overflow-hidden">
        
        <div className="flex justify-center mb-6">
          <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full flex items-center gap-2">
             <span className="text-[10px] font-black text-blue-600">1 {fromCard.currency}</span>
             <Icons name="swap" className="w-3 h-3 text-slate-200" />
             <span className="text-[10px] font-black text-emerald-500">{currentRate.toFixed(4)} {toCard.currency}</span>
          </div>
        </div>

        <div className="space-y-4 relative">
          
          <div className="space-y-2">
            <div className="flex justify-between items-center px-3">
              <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Откуда</label>
              <span className="text-[8px] font-black text-slate-300 uppercase">Баланс: {fromCard.balance.toLocaleString()}</span>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => selectNextCard(fromCard.id, setFromCard)}
                className="w-full flex items-center gap-3 bg-slate-50 p-3 rounded-[20px] border border-slate-100 active:scale-[0.98] transition-all"
              >
                <div className="w-9 h-7 rounded-lg flex items-center justify-center text-white shadow-md" style={{ background: fromCard.color }}>
                  <Icons name="credit-card" className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[12px] font-black text-[#0f172a] leading-tight">{fromCard.type}</p>
                </div>
                <Icons name="arrow-down" className="w-3 h-3 text-slate-300" />
              </button>
              
              <div className="bg-slate-50/50 rounded-[20px] p-3 border border-transparent focus-within:bg-white focus-within:border-blue-100">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent font-black focus:outline-none text-[#0f172a] text-center text-2xl placeholder:text-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-3 relative z-10">
            <button 
              onClick={handleSwap}
              className="w-10 h-10 bg-white rounded-full shadow-md border-[3px] border-white flex items-center justify-center text-blue-500 active:rotate-180 transition-all duration-500"
            >
              <Icons name="swap" className="w-4 h-4 rotate-90" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-3">Куда</label>
            
            <div className="space-y-2">
              <button 
                onClick={() => selectNextCard(toCard.id, setToCard)}
                className="w-full flex items-center gap-3 bg-slate-50 p-3 rounded-[20px] border border-slate-100 active:scale-[0.98] transition-all"
              >
                <div className="w-9 h-7 rounded-lg flex items-center justify-center text-white shadow-md" style={{ background: toCard.color }}>
                  <Icons name="credit-card" className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[12px] font-black text-[#0f172a] leading-tight">{toCard.type}</p>
                </div>
                <Icons name="arrow-down" className="w-3 h-3 text-slate-300" />
              </button>
              
              <div className="bg-slate-50/50 rounded-[20px] p-3">
                <div className={`w-full text-center font-black text-2xl ${amount ? 'text-emerald-500' : 'text-slate-200'}`}>
                  {resultFormatted}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isSuccess && (
          <div className="mt-4 bg-emerald-50 text-emerald-600 p-3 rounded-2xl border border-emerald-100 flex items-center gap-2 animate-fluid-scale">
            <Icons name="plus" className="w-4 h-4 rotate-45" />
            <p className="text-[9px] font-black uppercase">Обмен завершен</p>
          </div>
        )}

        <button 
          disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          onClick={executeExchange}
          className="w-full mt-6 bg-[#0f172a] text-white rounded-[22px] py-4.5 font-black text-sm active:scale-[0.98] transition-all disabled:opacity-30"
        >
          {isProcessing ? 'Обработка...' : 'Подтвердить'}
        </button>
      </div>
    </div>
  );
};

export default Exchange;

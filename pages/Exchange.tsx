
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

  // Курс обмена
  const currentRate = useMemo(() => {
    return rates[toCard.currency] / rates[fromCard.currency];
  }, [rates, fromCard.currency, toCard.currency]);

  // Расчет результата
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
      }, 3500);
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

  // Адаптивный шрифт для суммы (уменьшен)
  const getDynamicFontSize = (text: string) => {
    const length = text.length;
    if (length > 18) return 'text-[16px] sm:text-[18px]';
    if (length > 14) return 'text-[20px] sm:text-[24px]';
    if (length > 10) return 'text-[24px] sm:text-[28px]';
    return 'text-[28px] sm:text-[34px]';
  };

  return (
    <div className="space-y-6 pb-20 animate-fluid-fade">
      <div className="flex flex-col mt-2 animate-fluid-down">
        <h1 className="text-[34px] font-black tracking-tight text-[#0f172a]">Обмен валюты</h1>
      </div>

      <div className="bg-white rounded-[50px] p-6 sm:p-10 border border-slate-50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative animate-fluid-scale overflow-hidden">
        
        {/* Индикатор курса */}
        <div className="flex justify-center mb-8">
          <div className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-full flex items-center gap-3">
             <span className="text-[11px] font-black text-blue-600">1 {fromCard.currency}</span>
             <Icons name="swap" className="w-3 h-3 text-slate-200" />
             <span className="text-[11px] font-black text-emerald-500">{currentRate.toFixed(4)} {toCard.currency}</span>
          </div>
        </div>

        <div className="space-y-6 relative">
          
          {/* Блок ОТКУДА */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">СПИСАТЬ С</label>
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                ДОСТУПНО: {fromCard.balance.toLocaleString('ru-RU')} {getCurrencySymbol(fromCard.currency)}
              </span>
            </div>
            
            <div className="space-y-3">
              {/* Кнопка выбора карты */}
              <button 
                onClick={() => selectNextCard(fromCard.id, setFromCard)}
                className="w-full flex items-center gap-4 bg-[#f8fafc]/80 p-3.5 rounded-[26px] border border-slate-100 active:scale-[0.98] transition-all hover:bg-slate-50"
              >
                <div className="w-10 h-8 rounded-lg flex items-center justify-center text-white shadow-lg shrink-0" style={{ background: fromCard.color }}>
                  <Icons name="credit-card" className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[13px] font-black text-[#0f172a] leading-none">{fromCard.type}</p>
                </div>
                <Icons name="arrow-down" className="w-3.5 h-3.5 text-slate-300 mr-1" />
              </button>
              
              {/* Поле ввода суммы */}
              <div className="bg-slate-50/50 rounded-[28px] p-4.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all border border-transparent focus-within:border-blue-50">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full bg-transparent font-black focus:outline-none placeholder:text-slate-200 text-[#0f172a] text-center leading-none transition-all ${getDynamicFontSize(amount || '0')}`}
                />
              </div>
            </div>
          </div>

          {/* Кнопка инверсии */}
          <div className="flex justify-center -my-3 relative z-10">
            <button 
              onClick={handleSwap}
              className="w-12 h-12 bg-white rounded-full shadow-lg border-[4px] border-white flex items-center justify-center text-blue-500 active:rotate-180 transition-all duration-500 active:scale-90"
            >
              <Icons name="swap" className="w-5 h-5 rotate-90" />
            </button>
          </div>

          {/* Блок КУДА */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-4">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ЗАЧИСЛИТЬ НА</label>
            </div>
            
            <div className="space-y-3">
              {/* Кнопка выбора карты */}
              <button 
                onClick={() => selectNextCard(toCard.id, setToCard)}
                className="w-full flex items-center gap-4 bg-[#f8fafc]/80 p-3.5 rounded-[26px] border border-slate-100 active:scale-[0.98] transition-all hover:bg-slate-50"
              >
                <div className="w-10 h-8 rounded-lg flex items-center justify-center text-white shadow-lg shrink-0" style={{ background: toCard.color }}>
                  <Icons name="credit-card" className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[13px] font-black text-[#0f172a] leading-none">{toCard.type}</p>
                </div>
                <Icons name="arrow-down" className="w-3.5 h-3.5 text-slate-300 mr-1" />
              </button>
              
              {/* Поле результата */}
              <div className="bg-slate-50/50 rounded-[28px] p-4.5 border border-transparent">
                <div className={`w-full text-center font-black tracking-tight leading-none ${amount ? 'text-emerald-500' : 'text-slate-200'} transition-all ${getDynamicFontSize(resultFormatted)}`}>
                  {resultFormatted}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isSuccess && (
          <div className="mt-6 bg-emerald-50 text-emerald-600 p-4 rounded-[24px] border border-emerald-100 flex items-center gap-3 animate-fluid-scale shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
              <Icons name="nova" className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Готово!</p>
              <p className="text-[10px] font-bold opacity-70 leading-none">Обмен выполнен успешно</p>
            </div>
          </div>
        )}

        {/* Кнопка подтверждения */}
        <div className="mt-8">
          <button 
            disabled={isProcessing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > fromCard.balance || fromCard.currency === toCard.currency}
            onClick={executeExchange}
            className="w-full bg-[#0f172a] text-white rounded-[28px] py-6 font-black text-lg active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(15,23,42,0.15)] disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
                <span className="uppercase tracking-[0.2em] text-[12px] opacity-60">Обработка...</span>
              </>
            ) : (
              <>
                <Icons name="swap" className="w-5 h-5" />
                <span>Подтвердить обмен</span>
              </>
            )}
          </button>
        </div>

        <p className="mt-8 text-center text-[8px] text-slate-300 font-black uppercase tracking-[0.4em] opacity-60">
          БЕЗОПАСНЫЙ МОМЕНТАЛЬНЫЙ ОБМЕН NOVA
        </p>
      </div>
    </div>
  );
};

export default Exchange;

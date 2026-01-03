
import React, { useState } from 'react';
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

  const formatCardNumber = (num: string) => {
    const clean = num.replace(/\s/g, '').replace(/[^\d•]/g, '');
    return clean.match(/.{1,4}/g)?.join(' ') || num;
  };

  const usdtRate = rates[exchangeTo] || 1;

  return (
    <div className="space-y-7 pb-2 text-slate-900 will-change-gpu">
      {/* Шапка */}
      <div className="flex justify-between items-center pt-1 animate-fluid-down">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Привет, {state.userName}</h1>
        </div>
        <button 
          onClick={() => { setNewName(state.userName); setIsProfileOpen(true); }}
          className="relative active:scale-90 transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-2xl overflow-hidden p-[1px] bg-white shadow-xl ring-1 ring-slate-100">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Аватар" className="w-full h-full object-cover rounded-[18px] bg-slate-50" />
          </div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>
        </button>
      </div>

      {/* Счета и карты */}
      <section className="space-y-4 animate-fluid-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex justify-between items-end px-1">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Мои счета</h2>
          <button className="text-[10px] font-black text-blue-500 active:opacity-60 transition-opacity">ВСЕ</button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-6 px-6 pb-2">
          {state.cards.map((card) => (
            <div 
              key={card.id}
              className="min-w-[85vw] sm:min-w-[320px] h-[190px] rounded-[36px] p-7 flex flex-col justify-between shadow-2xl relative snap-center border-0 text-white transition-all hover:scale-[1.01] active:scale-[0.98] duration-500 cursor-pointer overflow-hidden group will-change-gpu"
              style={{ background: card.color }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-white/5 to-white/20 opacity-50 transition-opacity group-hover:opacity-70"></div>
              
              <div className="flex justify-between items-start z-10">
                <span className="text-[9px] font-black tracking-[0.2em] opacity-80 uppercase italic">{card.type}</span>
                <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center gap-2">
                   {card.currency === 'USDT' && <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>}
                   <div className="text-[10px] font-black text-white">{card.currency}</div>
                </div>
              </div>

              <div className="z-10">
                <p className="label-caps !text-white/60 !text-[8px] mb-1 tracking-widest">БАЛАНС</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black text-white/50">{getCurrencySymbol(card.currency)}</span>
                  <span className="text-3xl font-black tracking-tighter drop-shadow-lg">
                    {card.balance.toLocaleString('ru-RU', { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-lg font-medium opacity-40">
                    .{((card.balance % 1) * 100).toFixed(0).padStart(2, '0').slice(0, 2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end z-10">
                <span className="text-[12px] font-mono tracking-[0.2em] text-white/70">{formatCardNumber(card.number)}</span>
                <span className="text-[9px] font-black text-white/40 tracking-wider uppercase">{card.expiry}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Быстрые действия */}
      <div className="liquid-glass p-1.5 rounded-[32px] flex justify-around border border-white shadow-xl animate-fluid-up" style={{ animationDelay: '0.1s' }}>
        {[
          { label: 'Пополнить', icon: 'plus', action: () => setIsTopUpOpen(true) },
          { label: 'Обмен', icon: 'nova', color: 'text-emerald-500', action: () => setIsExchangeOpen(true) },
          { label: 'Перевести', icon: 'send', color: 'text-blue-500' },
          { label: 'Еще', icon: 'star' }
        ].map((act, i) => (
          <button 
            key={i} 
            onClick={act.action}
            className="flex flex-col items-center gap-2 py-4 px-1 group rounded-[26px] active:bg-slate-100/60 transition-all duration-300 w-full"
          >
            <div className={`w-12 h-12 rounded-[22px] bg-white shadow-sm border border-slate-50 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all duration-500 ${act.color || 'text-slate-500'}`}>
              <Icons name={act.icon} className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{act.label}</span>
          </button>
        ))}
      </div>

      {/* Операции */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1 animate-fluid-fade" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Последние операции</h2>
          <button className="text-[10px] font-black text-blue-500 active:opacity-60 transition-opacity">ИСТОРИЯ</button>
        </div>
        
        <div className="space-y-3">
          {state.transactions.length === 0 ? (
            <div className="py-10 text-center animate-fluid-up">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">История пуста</p>
            </div>
          ) : (
            state.transactions.slice(0, 4).map((tx, idx) => (
              <div 
                key={tx.id} 
                style={{ animationDelay: `${0.2 + idx * 0.04}s` }}
                className="p-4 bg-white rounded-[28px] flex items-center justify-between group active:scale-[0.98] transition-all duration-500 cursor-pointer border border-slate-50 shadow-sm hover:shadow-md animate-fluid-up will-change-gpu"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${tx.type === 'exchange' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50'}`}>
                    <Icons name={tx.icon} className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-[15px] tracking-tight text-slate-800">{tx.merchant}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tx.category}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className={`flex items-baseline gap-1 text-[16px] font-black ${tx.type === 'expense' ? 'text-slate-800' : tx.type === 'exchange' ? 'text-blue-600' : 'text-emerald-500'}`}>
                    <span>{tx.type === 'expense' ? '−' : tx.type === 'exchange' ? '⇌' : '+'}</span>
                    <span className="text-[11px] opacity-40">{getCurrencySymbol(tx.currency)}</span>
                    <span>{tx.amount.toFixed(0)}</span>
                  </div>
                  <div className="text-[8px] text-slate-200 font-mono mt-0.5 uppercase tracking-tighter">{tx.id.slice(-4)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Модалка Профиля */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fluid-fade">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setIsProfileOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[44px] p-8 space-y-10 relative border border-white shadow-2xl animate-fluid-scale">
            <div className="flex justify-center">
               <div className="w-12 h-1 bg-slate-100 rounded-full"></div>
            </div>
            
            <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-[32px] overflow-hidden p-[2px] bg-slate-100 mx-auto shadow-2xl border-4 border-white">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Аватар" className="w-full h-full object-cover rounded-[28px]" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900">Настройки профиля</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                 <p className="label-caps text-slate-400 ml-1 uppercase">Ваше имя</p>
                 <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-[24px] px-6 transition-all focus-within:border-blue-400 focus-within:bg-white">
                    <input 
                      autoFocus
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Введите имя..."
                      className="w-full bg-transparent py-5 text-xl font-black text-center focus:outline-none text-slate-900 placeholder:text-slate-200"
                    />
                 </div>
              </div>

              <div className="space-y-2 pt-4">
                <button 
                  onClick={handleNameSave}
                  className="w-full bg-blue-600 text-white rounded-[24px] py-5 font-black text-md active:scale-[0.97] transition-all shadow-xl shadow-blue-100"
                >
                  Сохранить
                </button>
                <button 
                  onClick={() => { onResetWallet(); setIsProfileOpen(false); }}
                  className="w-full bg-rose-50 text-rose-600 rounded-[24px] py-5 font-black text-[11px] uppercase tracking-widest active:scale-[0.97] transition-all border border-rose-100"
                >
                  Сбросить кошелек
                </button>
              </div>
            </div>

            <button 
              onClick={() => setIsProfileOpen(false)}
              className="w-full text-slate-300 font-black text-[10px] uppercase tracking-widest hover:text-slate-500"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Модалка обмена USDT */}
      {isExchangeOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fluid-fade">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setIsExchangeOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[44px] p-8 space-y-8 relative border border-white shadow-2xl animate-fluid-scale">
            <div className="flex justify-center">
               <div className="w-12 h-1 bg-slate-100 rounded-full"></div>
            </div>
            
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-slate-900">Крипто Обмен</h3>
                <div className="inline-block px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                   <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">1 USDT ≈ {usdtRate.toFixed(2)} {exchangeTo}</p>
                </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                 <p className="label-caps text-slate-400 ml-1">ОТДАЕТЕ USDT</p>
                 <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-[28px] px-8 transition-all focus-within:border-emerald-400 focus-within:bg-white group">
                    <input 
                      autoFocus
                      type="number" 
                      value={exchangeAmount}
                      onChange={(e) => setExchangeAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent py-7 text-4xl font-black text-center focus:outline-none text-slate-900 placeholder:text-slate-200"
                    />
                    <span className="text-2xl font-black text-slate-300 group-focus-within:text-emerald-400 ml-2 transition-colors">₮</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <p className="label-caps text-slate-400 ml-1">ПОЛУЧАЕТЕ В</p>
                 <div className="flex gap-2">
                    {(['RUB', 'USD', 'EUR'] as Currency[]).map(cur => (
                      <button 
                        key={cur}
                        onClick={() => setExchangeTo(cur)}
                        className={`flex-1 py-4 rounded-2xl border-2 font-black text-xs transition-all duration-300 active:scale-95 ${exchangeTo === cur ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                      >
                        {cur}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-[32px] flex justify-between items-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] relative z-10">К ПОЛУЧЕНИЮ</span>
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="text-sm font-black text-emerald-500">{getCurrencySymbol(exchangeTo)}</span>
                    <span className="text-2xl font-black text-white">
                      {(parseFloat(exchangeAmount || '0') * usdtRate).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs font-black text-white/30">.00</span>
                  </div>
              </div>
            </div>

            <button 
              onClick={handleExchange}
              className="w-full bg-emerald-500 text-white rounded-[28px] py-6 font-black text-lg active:scale-[0.97] transition-all duration-500 shadow-xl shadow-emerald-100 hover:bg-emerald-600"
            >
              Обменять USDT
            </button>
          </div>
        </div>
      )}

      {/* Модалка пополнения */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fluid-fade">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setIsTopUpOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[44px] p-8 space-y-8 relative border border-white shadow-2xl animate-fluid-scale">
            <div className="flex justify-center">
               <div className="w-12 h-1 bg-slate-100 rounded-full"></div>
            </div>
            
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-slate-900">Пополнение</h3>
                <p className="label-caps text-slate-400">ВЫБЕРИТЕ СУММУ</p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {state.cards.map(card => (
                  <button 
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`flex-1 min-w-[100px] p-4 rounded-2xl border-2 transition-all duration-300 text-left active:scale-95 ${selectedCardId === card.id ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                  >
                    <p className="text-[10px] font-black text-blue-600 opacity-60 uppercase mb-1">{card.currency}</p>
                    <p className="text-sm font-black text-slate-900">{card.balance.toLocaleString()}</p>
                  </button>
                ))}
              </div>

              <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-[28px] px-8 transition-all focus-within:border-blue-400 focus-within:bg-white group">
                <input 
                  autoFocus
                  type="number" 
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent py-7 text-4xl font-black text-center focus:outline-none text-slate-900 placeholder:text-slate-200"
                />
                <span className="text-2xl font-black text-slate-300 group-focus-within:text-blue-500 ml-2 transition-colors">
                  {getCurrencySymbol(state.cards.find(c => c.id === selectedCardId)?.currency || 'RUB')}
                </span>
              </div>
            </div>

            <button 
              onClick={handleTopUp}
              className="w-full bg-blue-600 text-white rounded-[28px] py-6 font-black text-lg active:scale-[0.97] transition-all duration-300 shadow-xl shadow-blue-100 hover:bg-blue-700"
            >
              Подтвердить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

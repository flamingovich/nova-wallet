
import React, { useState } from 'react';
import { AppState, Currency, Card } from '../types';
import Icons from '../components/Icons';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  state: AppState;
  onTopUp: (cardId: string, amount: number) => void;
  rates: Record<string, number>;
  onExchange: (from: Currency, to: Currency, amountFrom: number) => void;
  onSetName: (name: string) => void;
  onResetWallet: () => void;
}

const Home: React.FC<HomeProps> = ({ state, onTopUp, rates, onExchange, onSetName, onResetWallet }) => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
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

  const getCardBrandName = (type: string) => {
    if (type.includes('MIR')) return 'МИР';
    if (type.includes('Visa')) return 'VISA';
    if (type.includes('MasterCard')) return 'MasterCard';
    return 'NOVA';
  };

  const getCardBrandColor = (type: string) => {
    if (type.includes('MIR')) return 'bg-[#1c2e4a]';
    if (type.includes('Visa')) return 'bg-[#1a1f71]';
    if (type.includes('MasterCard')) return 'bg-[#eb001b]';
    if (type.includes('USDT')) return 'bg-[#26A17B]';
    return 'bg-blue-600';
  };

  const handleTopUpFromModal = () => {
    const amt = parseFloat(topUpAmount);
    if (!isNaN(amt) && amt > 0 && selectedCard) {
      onTopUp(selectedCard.id, amt);
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
        <div className="col-span-1 h-36 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 rounded-[28px] p-4 flex flex-col justify-between text-slate-800 tile-shadow relative overflow-hidden group">
           <div className="absolute top-4 right-4 w-7 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm shadow-inner opacity-80"></div>
           <Icons name="star" className="w-8 h-8 opacity-80 text-blue-600" />
           <div>
             <p className="text-sm font-black">Nova Platinum</p>
             <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Priority Pass</p>
           </div>
        </div>

        {state.cards.map((card) => (
          <div 
            key={card.id}
            onClick={() => setSelectedCard(card)}
            style={{ background: card.color }}
            className="h-36 rounded-[28px] p-4 flex flex-col justify-between tile-shadow border border-white/10 active:scale-95 transition-all cursor-pointer relative overflow-hidden text-white"
          >
            <div className={`absolute top-4 right-4 w-8 h-5 ${getCardBrandColor(card.type)} rounded shadow-inner border border-white/20 flex items-center justify-center text-[6px] font-black uppercase`}>
              {getCardBrandName(card.type)}
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="flex flex-col z-10">
               <span className="text-sm font-black tracking-widest leading-none">{card.currency}</span>
               <span className="text-[8px] font-bold opacity-50 uppercase tracking-tighter">Current Account</span>
            </div>
            
            <div className="space-y-0.5 z-10">
               <p className="text-[10px] font-mono opacity-50 leading-tight tracking-wider">•••• {card.number.slice(-4)}</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-xl font-black tracking-tighter">
                   {card.balance.toLocaleString('ru-RU')}
                 </span>
                 <span className="text-xs font-black opacity-40">{getCurrencySymbol(card.currency)}</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Card View - Compacted version */}
      {selectedCard && (
        <div className="fixed inset-0 z-[2000] bg-white flex flex-col animate-fluid-up overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Dark Header - Compacted */}
            <div className="bg-[#1c1c1e] text-white pt-8 pb-10 px-6 rounded-b-[40px] shadow-2xl relative shrink-0">
               <div className="flex justify-between items-center mb-6">
                  <button onClick={() => setSelectedCard(null)} className="p-2 -ml-2">
                     <Icons name="arrow-up" className="w-6 h-6 -rotate-90" />
                  </button>
                  <h2 className="text-base font-black tracking-tight">Счёт</h2>
                  <button className="p-2 -mr-2 opacity-60">
                     <Icons name="chat" className="w-6 h-6" />
                  </button>
               </div>

               <div className="flex flex-col items-center text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Текущий остаток</p>
                  <div className="flex items-baseline gap-1.5 mb-6">
                     <span className="text-4xl font-black tracking-tighter">{selectedCard.balance.toLocaleString('ru-RU')}</span>
                     <span className="text-xl font-bold opacity-60">{getCurrencySymbol(selectedCard.currency)}</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-14 h-9 bg-amber-400 rounded-lg shadow-xl flex flex-col items-center justify-center text-[9px] font-black text-white relative">
                        <span className="text-[5px] absolute top-1 right-2 opacity-50">4242</span>
                        <span className="mt-0.5">{getCardBrandName(selectedCard.type)}</span>
                     </div>
                  </div>
               </div>

               {/* Overlapping Action Buttons - Compact */}
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[88%] grid grid-cols-3 gap-2.5 z-[2010]">
                  <button 
                    onClick={() => setIsTopUpOpen(true)}
                    className="bg-white py-4 rounded-[22px] shadow-xl flex flex-col items-center gap-1 active:scale-95 transition-all border border-slate-50"
                  >
                     <Icons name="plus" className="w-5 h-5 text-slate-800" />
                     <span className="text-[10px] font-black text-slate-800">Пополнить</span>
                  </button>
                  <button 
                    onClick={() => { setSelectedCard(null); navigate('/transfers'); }}
                    className="bg-white py-4 rounded-[22px] shadow-xl flex flex-col items-center gap-1 active:scale-95 transition-all border border-slate-50"
                  >
                     <Icons name="send" className="w-5 h-5 text-slate-800 rotate-180" />
                     <span className="text-[10px] font-black text-slate-800">Перевести</span>
                  </button>
                  <button 
                    onClick={() => { setSelectedCard(null); navigate('/history'); }}
                    className="bg-white py-4 rounded-[22px] shadow-xl flex flex-col items-center gap-1 active:scale-95 transition-all border border-slate-50"
                  >
                     <Icons name="clock" className="w-5 h-5 text-slate-800" />
                     <span className="text-[10px] font-black text-slate-800">История</span>
                  </button>
               </div>
            </div>

            {/* List Content - Compact padding */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-14 px-5 pb-32">
               <div className="space-y-0.5">
                 {[
                   { icon: 'list', label: 'Выписка по счету', color: 'text-indigo-500 bg-indigo-50' },
                   { icon: 'nova', label: 'Отображать виджет на Главной', toggle: true, color: 'text-blue-500 bg-blue-50', active: true },
                   { icon: 'nova', label: 'Отображать сумму на виджете', toggle: true, color: 'text-blue-500 bg-blue-50', active: true },
                   { icon: 'credit-card', label: 'Реквизиты счёта', color: 'text-purple-500 bg-purple-50' },
                   { icon: 'list', label: 'Справка для посольства', color: 'text-indigo-500 bg-indigo-50' },
                   { icon: 'chat', label: 'Получать переводы на этот счёт', toggle: true, sub: 'Для переводов по номеру телефона', color: 'text-blue-500 bg-blue-50', active: true },
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3.5">
                         <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                            <Icons name={item.icon} className="w-4.5 h-4.5" />
                         </div>
                         <div>
                            <p className="text-[14px] font-black text-slate-800 leading-tight">{item.label}</p>
                            {item.sub && <p className="text-[9px] text-slate-400 font-bold mt-0.5">{item.sub}</p>}
                         </div>
                      </div>
                      {item.toggle ? (
                        <div className={`w-10 h-6 ${item.active ? 'bg-blue-600' : 'bg-slate-200'} rounded-full flex items-center px-0.5 shadow-inner transition-colors`}>
                           <div className={`w-4.5 h-4.5 bg-white rounded-full ${item.active ? 'ml-auto' : 'mr-auto'} shadow-md`}></div>
                        </div>
                      ) : null}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* TopUp Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-[3000] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 pb-24">
          <div className="bg-white w-full max-w-sm rounded-[36px] p-8 space-y-6 animate-fluid-up">
            <div className="text-center">
               <h3 className="text-xl font-black text-slate-800">Пополнить</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">
                 {selectedCard?.type} •••• {selectedCard?.number.slice(-4)}
               </p>
            </div>
            <div className="space-y-4">
               <div className="relative">
                  <input 
                    autoFocus
                    type="number" 
                    value={topUpAmount} 
                    onChange={(e) => setTopUpAmount(e.target.value)} 
                    placeholder="0" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-5 text-center font-black text-3xl focus:outline-none text-slate-800 placeholder:text-slate-200" 
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300">
                    {getCurrencySymbol(selectedCard?.currency || 'RUB')}
                  </span>
               </div>
               <button onClick={handleTopUpFromModal} className="w-full bg-blue-600 text-white py-4.5 rounded-[20px] font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all">Подтвердить</button>
               <button onClick={() => setIsTopUpOpen(false)} className="w-full text-slate-300 font-black text-[11px] uppercase tracking-widest py-2">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

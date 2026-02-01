
import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';
import { Card, Currency } from '../types';
import { useNavigate } from 'react-router-dom';

interface TransfersProps {
  onSend: (merchant: string, amount: number, currency: Currency, totalDebit: number, fee: number) => void;
  cards: Card[];
}

type TransferStep = 'select-card' | 'select-type' | 'enter-details' | 'processing' | 'success';

const SURNAMES = [
  'Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Федоров',
  'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семенов', 'Егоров', 'Павлов', 'Козлов', 'Степанов', 'Николаев'
];

const INITIALS_LETTERS = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ';

const generateRandomName = () => {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const i1 = INITIALS_LETTERS[Math.floor(Math.random() * INITIALS_LETTERS.length)];
  const i2 = INITIALS_LETTERS[Math.floor(Math.random() * INITIALS_LETTERS.length)];
  return `${surname} ${i1}. ${i2}.`;
};

const getCardBrandName = (number: string) => {
  const clean = number.replace(/\s/g, '');
  if (clean.startsWith('4')) return 'VISA';
  if (clean.startsWith('220')) return 'МИР';
  if (/^5[1-5]/.test(clean)) return 'MasterCard';
  return 'NOVA';
};

const getCardBrandColorClass = (type: string) => {
  if (type.includes('MIR')) return 'bg-[#1c2e4a]';
  if (type.includes('Visa')) return 'bg-[#1a1f71]';
  if (type.includes('MasterCard')) return 'bg-[#eb001b]';
  if (type.includes('USDT')) return 'bg-[#26A17B]';
  return 'bg-blue-600';
};

const Transfers: React.FC<TransfersProps> = ({ onSend, cards }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<TransferStep>('select-card');
  const [selectedCard, setSelectedCard] = useState<Card | null>(cards[0] || null);
  const [selectedType, setSelectedType] = useState<any | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const FEE_PERCENT = 0.05;
  const getFee = (amt: number) => amt * FEE_PERCENT;

  useEffect(() => {
    const cleanNum = recipient.replace(/\s/g, '');
    if (cleanNum.length === 16) {
      setIsVerifying(true);
      setVerifiedName('');
      const timer = setTimeout(() => {
        setIsVerifying(false);
        setVerifiedName(generateRandomName());
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsVerifying(false);
      setVerifiedName('');
    }
  }, [recipient]);

  const handleSend = () => {
    const amt = parseFloat(amount);
    if (selectedCard && amt > 0) {
      const fee = getFee(amt);
      const totalDebit = amt + fee;
      setStep('processing');
      setTimeout(() => {
        onSend(verifiedName || recipient || selectedType?.label || 'Перевод', amt, selectedCard.currency, totalDebit, fee);
        setStep('success');
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

  const renderStep = () => {
    switch (step) {
      case 'select-card':
        return (
          <div className="space-y-4 animate-fluid-fade">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Выберите карту для списания</h2>
            <div className="space-y-3">
              {cards.map((card) => (
                <button 
                  key={card.id}
                  onClick={() => { setSelectedCard(card); setStep('select-type'); }}
                  style={{ background: card.color }}
                  className="w-full p-6 rounded-[32px] flex items-center justify-between shadow-xl active:scale-[0.98] transition-all relative overflow-hidden text-white border border-white/10"
                >
                  <div className="absolute top-0 right-0 w-32 h-full bg-white/5 blur-xl -skew-x-12 translate-x-1/2"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-8 ${getCardBrandColorClass(card.type)} rounded shadow-md border border-white/20 flex items-center justify-center text-[8px] font-black text-white uppercase`}>
                      {getCardBrandName(card.type)}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-[16px] leading-tight tracking-tight">{card.currency} Account</p>
                      <p className="text-[10px] font-bold opacity-60">•••• {card.number.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="font-black text-[22px] tracking-tighter">{card.balance.toLocaleString()} {getCurrencySymbol(card.currency)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'select-type':
        return (
          <div className="space-y-4 animate-fluid-fade">
             <button onClick={() => setStep('select-card')} className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 uppercase px-1">
               <Icons name="arrow-up" className="w-3 h-3 -rotate-90" /> Назад
            </button>
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Способ перевода</h2>
            <div className="space-y-3">
              {[
                { id: 'card', label: 'По номеру карты', icon: 'credit-card', color: 'text-blue-500 bg-blue-50' },
                { id: 'phone', label: 'По номеру телефона', icon: 'user', color: 'text-emerald-500 bg-emerald-50' },
                { id: 'internal', label: 'Между счетами', icon: 'swap', color: 'text-indigo-500 bg-indigo-50' }
              ].map((type) => (
                <button 
                  key={type.id}
                  onClick={() => { setSelectedType(type); setStep('enter-details'); }}
                  className="w-full bg-white p-6 rounded-[32px] border border-slate-50 flex items-center gap-5 shadow-xl shadow-slate-200/40 active:scale-[0.98] transition-all"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${type.color}`}>
                    <Icons name={type.icon} className="w-6 h-6" />
                  </div>
                  <span className="font-black text-slate-800 text-base">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'enter-details':
        const curAmt = parseFloat(amount) || 0;
        const total = curAmt * 1.05;
        const feeAmt = curAmt * 0.05;
        const symbol = getCurrencySymbol(selectedCard?.currency || 'RUB');

        return (
          <div className="space-y-4 animate-fluid-fade max-w-lg mx-auto">
             <div className="flex items-center gap-3 px-1 py-1">
                <button onClick={() => setStep('select-type')}>
                  <Icons name="arrow-up" className="w-6 h-6 -rotate-90 text-slate-800" />
                </button>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Перевод</h3>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 italic">С карты</p>
                   <button 
                    onClick={() => setStep('select-card')}
                    style={{ background: selectedCard?.color }}
                    className="w-full p-5 rounded-[32px] flex items-center justify-between shadow-lg text-white active:scale-[0.99] transition-all relative overflow-hidden"
                   >
                      <div className="flex items-center gap-4 relative z-10">
                         <div className={`w-12 h-8 ${getCardBrandColorClass(selectedCard?.type || '')} rounded shadow-sm border border-white/20 flex items-center justify-center text-[8px] font-black text-white relative`}>
                            {getCardBrandName(selectedCard?.type || '')}
                         </div>
                         <div className="text-left">
                            <p className="font-black text-[17px] leading-tight">{selectedCard?.balance.toLocaleString()} {symbol}</p>
                            <p className="text-[10px] font-bold opacity-60 italic">•••• {selectedCard?.number.slice(-4)}</p>
                         </div>
                      </div>
                      <Icons name="arrow-up" className="w-4 h-4 rotate-90 opacity-60 relative z-10" />
                   </button>
                </div>

                <div className="space-y-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 italic">Получатель</p>
                   <div className="bg-slate-50 p-6 rounded-[32px] border border-dashed border-slate-200 flex flex-col items-center justify-between group focus-within:bg-white focus-within:border-blue-500 transition-all">
                      <div className="flex items-center gap-4 w-full">
                         <input 
                            type="text" 
                            value={recipient} 
                            onChange={(e) => {
                               let v = e.target.value.replace(/\D/g, '').slice(0, 16);
                               setRecipient(v.match(/.{1,4}/g)?.join(' ') || v);
                            }}
                            placeholder="Номер карты"
                            className="bg-transparent text-[16px] font-bold text-slate-800 focus:outline-none w-full placeholder:text-slate-400"
                         />
                         <Icons name="qr" className="w-6 h-6 text-slate-300" />
                      </div>
                   </div>
                   
                   {isVerifying && (
                     <div className="flex items-center justify-center gap-2 text-slate-400 py-1">
                       <div className="w-2.5 h-2.5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                       <span className="text-[9px] font-black uppercase tracking-widest">Проверка</span>
                     </div>
                   )}
                   {verifiedName && (
                     <div className="bg-emerald-50 py-2 px-4 rounded-full border border-emerald-100 flex items-center justify-center gap-2 animate-fluid-fade">
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{verifiedName}</p>
                     </div>
                   )}
                </div>

                <div className="flex items-center justify-between px-2">
                   <span className="text-[14px] font-bold text-slate-500">Сохранить</span>
                   <div 
                    onClick={() => setSaveCard(!saveCard)}
                    className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors shadow-inner ${saveCard ? 'bg-emerald-500' : 'bg-slate-200'}`}
                   >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${saveCard ? 'translate-x-5' : 'translate-x-0'}`}></div>
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 italic">Сумма</p>
                   <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col items-center">
                      <div className="flex items-baseline gap-2">
                         <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="bg-transparent text-center font-black text-5xl focus:outline-none w-full text-slate-800 placeholder:text-slate-200 tracking-tighter" 
                         />
                         <span className="text-2xl font-bold text-slate-400">{symbol}</span>
                      </div>
                   </div>
                </div>

                <button 
                   disabled={!amount || parseFloat(amount) <= 0 || total > (selectedCard?.balance || 0)}
                   onClick={handleSend}
                   className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black text-lg shadow-2xl active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale mt-2"
                >
                   Перевести
                </button>
             </div>
          </div>
        );

      case 'processing':
        return (
          <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center">
             <div className="w-14 h-14 border-4 border-slate-50 border-t-blue-600 rounded-full animate-spin"></div>
             <p className="mt-6 text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Обработка...</p>
          </div>
        );

      case 'success':
        return (
          <div className="fixed inset-0 z-[2000] bg-white flex flex-col animate-fluid-up overflow-hidden items-center justify-center px-8 text-center space-y-10">
              <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner animate-fluid-scale">
                  <Icons name="swap" className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Перевод выполнен</h2>
              <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black text-base active:scale-95 transition-all shadow-xl">
                  Закрыть
              </button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 pt-1">
      {renderStep()}
    </div>
  );
};

export default Transfers;

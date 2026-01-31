
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
  'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семенов', 'Егоров', 'Павлов', 'Козлов', 'Степанов', 'Николаев',
  'Орлов', 'Андреев', 'Макаров', 'Никитин', 'Захаров', 'Зайцев', 'Соловьев', 'Борисов', 'Яковлев', 'Григорьев'
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
  if (type.includes('RUB') || type.includes('МИР')) return 'bg-amber-500';
  if (type.includes('USDT')) return 'bg-emerald-500';
  if (type.includes('USD') || type.includes('Visa')) return 'bg-blue-600';
  if (type.includes('EUR') || type.includes('MasterCard')) return 'bg-orange-600';
  return 'bg-amber-400';
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

  // Verification Logic with 2s delay
  useEffect(() => {
    const cleanNum = recipient.replace(/\s/g, '');
    if (cleanNum.length === 16) {
      setIsVerifying(true);
      setVerifiedName('');
      const timer = setTimeout(() => {
        setIsVerifying(false);
        setVerifiedName(generateRandomName());
      }, 2000);
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

  const renderStep = () => {
    switch (step) {
      case 'select-card':
        return (
          <div className="space-y-3 animate-fluid-fade">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Выберите карту для списания</h2>
            <div className="space-y-2.5">
              {cards.map((card) => (
                <button 
                  key={card.id}
                  onClick={() => { setSelectedCard(card); setStep('select-type'); }}
                  className="w-full bg-white p-4.5 rounded-[28px] border border-slate-50 flex items-center justify-between shadow-md shadow-slate-200/40 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-7.5 ${getCardBrandColorClass(card.type)} rounded shadow-inner flex items-center justify-center text-[7px] font-black text-white uppercase`}>
                      {card.type.includes('MIR') ? 'МИР' : card.type.includes('Master') ? 'Master' : 'VISA'}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-800 text-[15px] leading-tight">{card.type.split(' ')[0]}</p>
                      <p className="text-[10px] font-bold text-slate-300">•••• {card.number.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-[17px]">{card.balance.toLocaleString()} {getCurrencySymbol(card.currency)}</p>
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
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Способ перевода</h2>
            <div className="space-y-2.5">
              {[
                { id: 'card', label: 'По номеру карты', icon: 'credit-card', color: 'text-blue-500 bg-blue-50' },
                { id: 'phone', label: 'По номеру телефона', icon: 'user', color: 'text-emerald-500 bg-emerald-50' },
                { id: 'internal', label: 'Между счетами', icon: 'swap', color: 'text-indigo-500 bg-indigo-50' }
              ].map((type) => (
                <button 
                  key={type.id}
                  onClick={() => { setSelectedType(type); setStep('enter-details'); }}
                  className="w-full bg-white p-5 rounded-[28px] border border-slate-50 flex items-center gap-4 shadow-md shadow-slate-200/40 active:scale-[0.98] transition-all"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${type.color}`}>
                    <Icons name={type.icon} className="w-5 h-5" />
                  </div>
                  <span className="font-black text-slate-800 text-[15px]">{type.label}</span>
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
             <div className="flex items-center gap-3 px-1 py-1.5">
                <button onClick={() => setStep('select-type')}>
                  <Icons name="arrow-up" className="w-5.5 h-5.5 -rotate-90 text-slate-800" />
                </button>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Перевод</h3>
             </div>

             <div className="space-y-6">
                {/* FROM CARD SECTION - Compact */}
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 italic">С карты</p>
                   <button 
                    onClick={() => setStep('select-card')}
                    className="w-full bg-white p-4.5 rounded-[28px] border border-slate-50 flex items-center justify-between shadow-md active:scale-[0.99] transition-all"
                   >
                      <div className="flex items-center gap-3.5">
                         <div className={`w-12 h-8 ${getCardBrandColorClass(selectedCard?.type || '')} rounded shadow-sm flex items-center justify-center text-[8px] font-black text-white relative`}>
                            {selectedCard?.type.includes('MIR') ? 'МИР' : selectedCard?.type.includes('Master') ? 'Master' : 'VISA'}
                            <span className="absolute bottom-1 right-2 text-[4px] opacity-40">GOLD</span>
                         </div>
                         <div className="text-left">
                            <p className="font-black text-slate-800 text-[15px] leading-tight">{selectedCard?.balance.toLocaleString()} {symbol}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 italic">•••• {selectedCard?.number.slice(-4)}</p>
                         </div>
                      </div>
                      <Icons name="arrow-up" className="w-4 h-4 rotate-90 text-slate-300" />
                   </button>
                </div>

                {/* RECIPIENT CARD - Compact */}
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 italic">Получатель</p>
                   <div className="bg-slate-50 p-5 rounded-[28px] border border-dashed border-slate-200 flex flex-col items-center justify-between group focus-within:bg-white focus-within:border-blue-500 transition-all">
                      <div className="flex items-center gap-4 w-full">
                         <div className="w-12 h-8 bg-slate-200 rounded shrink-0 flex items-center justify-center text-[7px] font-black text-slate-400 uppercase">
                           {recipient.length >= 4 ? getCardBrandName(recipient) : ''}
                         </div>
                         <input 
                            type="text" 
                            value={recipient} 
                            onChange={(e) => {
                               let v = e.target.value.replace(/\D/g, '').slice(0, 16);
                               setRecipient(v.match(/.{1,4}/g)?.join(' ') || v);
                            }}
                            placeholder="Номер карты"
                            className="bg-transparent text-[15px] font-bold text-slate-800 focus:outline-none w-full placeholder:text-slate-400"
                         />
                         <Icons name="qr" className="w-5 h-5 text-slate-300" />
                      </div>
                   </div>
                   
                   {isVerifying && (
                     <div className="flex items-center justify-center gap-1.5 text-slate-400 py-0.5">
                       <div className="w-2.5 h-2.5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                       <span className="text-[9px] font-black uppercase tracking-widest">Проверка</span>
                     </div>
                   )}
                   {verifiedName && (
                     <div className="bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-100 flex items-center justify-center gap-2 animate-fluid-fade">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{verifiedName}</p>
                     </div>
                   )}
                </div>

                <div className="flex items-center justify-between px-2">
                   <span className="text-[13px] font-bold text-slate-500">Сохранить</span>
                   <div 
                    onClick={() => setSaveCard(!saveCard)}
                    className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors shadow-inner ${saveCard ? 'bg-emerald-500' : 'bg-slate-200'}`}
                   >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transition-transform ${saveCard ? 'translate-x-4' : 'translate-x-0'}`}></div>
                   </div>
                </div>

                {/* AMOUNT SECTION - Compact */}
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 italic">Сумма</p>
                   <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 flex flex-col items-center">
                      <div className="flex items-baseline gap-2">
                         <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="bg-transparent text-center font-black text-4xl focus:outline-none w-full text-slate-800 placeholder:text-slate-200 tracking-tighter" 
                         />
                         <span className="text-2xl font-bold text-slate-400">{symbol}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-2 px-1 pt-2">
                   <div className="flex justify-between items-center text-[12px] font-bold text-slate-500">
                      <span>Комиссия</span>
                      <span className="text-slate-800 font-black">{feeAmt.toFixed(2)} {symbol}</span>
                   </div>
                   <div className="flex justify-between items-center text-[16px] font-black text-slate-800">
                      <span>Итого к оплате</span>
                      <span className="text-2xl tracking-tighter">{(total || 0).toFixed(2)} {symbol}</span>
                   </div>
                </div>

                <button 
                   disabled={!amount || parseFloat(amount) <= 0 || total > (selectedCard?.balance || 0)}
                   onClick={handleSend}
                   className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-base shadow-xl active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale mt-2"
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
             <p className="mt-6 text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Обработка запроса...</p>
          </div>
        );

      case 'success':
        const finalAmt = parseFloat(amount);
        const finalFee = getFee(finalAmt);
        const s = getCurrencySymbol(selectedCard?.currency || 'RUB');
        return (
          <div className="fixed inset-0 z-[2000] bg-white flex flex-col animate-fluid-up overflow-hidden">
             <div className="h-[42vh] bg-gradient-to-b from-emerald-500 via-teal-500 to-white flex flex-col items-center justify-center text-white px-6">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/30 animate-fluid-scale">
                   <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-lg">
                      <Icons name="swap" className="w-9 h-9" />
                   </div>
                </div>
                <h2 className="text-3xl font-black mt-8 tracking-tighter">Готово!</h2>
                <div className="mt-3 flex items-center gap-2 px-5 py-1.5 bg-black/10 rounded-full backdrop-blur-sm">
                   <Icons name="nova" className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">NovaBank Success</span>
                </div>
             </div>

             <div className="flex-1 bg-white px-8 pt-6 flex flex-col items-center">
                <div className="text-center">
                   <p className="text-5xl font-black text-slate-900 tracking-tighter">{finalAmt.toLocaleString()} {s}</p>
                   <p className="text-base font-bold text-slate-400 uppercase tracking-widest mt-2 italic">{verifiedName || recipient}</p>
                </div>

                <div className="w-full bg-slate-50 rounded-[36px] p-6 border border-slate-100 space-y-4 mt-6">
                   <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Комиссия банка (5%)</span>
                      <span className="text-sm font-black text-slate-800">+{finalFee.toFixed(2)} {s}</span>
                   </div>
                   <div className="h-px bg-slate-200/50"></div>
                   <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Всего списано</span>
                      <span className="text-xl font-black text-emerald-600">{(finalAmt + finalFee).toFixed(2)} {s}</span>
                   </div>
                </div>

                <div className="w-full mt-auto mb-10">
                   <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-sm active:scale-95 transition-all shadow-xl">
                      На главную
                   </button>
                </div>
             </div>
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


import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';
import { Card, Currency } from '../types';
import { useNavigate } from 'react-router-dom';

interface TransfersProps {
  onSend: (merchant: string, amount: number, currency: Currency) => void;
  cards: Card[];
}

type TransferStep = 'select-card' | 'select-type' | 'enter-details' | 'processing' | 'success';

// Обширная база фамилий для генерации
const SURNAMES = [
  // Славянские
  'Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Федоров',
  'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семенов', 'Егоров', 'Павлов', 'Козлов', 'Степанов', 'Николаев',
  'Орлов', 'Андреев', 'Макаров', 'Никитин', 'Захаров', 'Зайцев', 'Соловьев', 'Борисов', 'Яковлев', 'Григорьев',
  'Романов', 'Воробьев', 'Сергеев', 'Кузьмин', 'Фролов', 'Александров', 'Дмитриев', 'Королев', 'Пономарев', 'Пантелеев',
  'Антонов', 'Тарасов', 'Белов', 'Игнатов', 'Мельников', 'Денисов', 'Гаврилов', 'Тихонов', 'Абрамов', 'Щербаков',
  // Кавказские и Азиатские
  'Ахмедов', 'Намазов', 'Мамедов', 'Алиев', 'Гасанов', 'Абдуллаев', 'Ибрагимов', 'Султанов', 'Касимов', 'Рустамов',
  'Умаров', 'Шарипов', 'Исмаилов', 'Джабраилов', 'Юсупов', 'Каримов', 'Мансуров', 'Бакиров', 'Гаджиев', 'Магомедов',
  'Саидов', 'Азизов', 'Хасанов', 'Мурадов', 'Рахимов', 'Османов', 'Курбанов', 'Аскеров', 'Багиров', 'Гамидов',
  'Джафаров', 'Заидов', 'Мусаев', 'Набиев', 'Пашаев', 'Рамазанов', 'Тагиев', 'Усубов', 'Халилов', 'Шахмаров',
  // Другие
  'Басак', 'Громов', 'Звягинцев', 'Милославский', 'Разумовский', 'Верещагин', 'Славянский', 'Беляев', 'Костин',
  'Лазарев', 'Медведев', 'Ершов', 'Коновалов', 'Дроздов', 'Дементьев', 'Савельев', 'Родионов', 'Бирюков', 'Ефремов'
];

const INITIALS_LETTERS = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ';

const generateRandomName = () => {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const i1 = INITIALS_LETTERS[Math.floor(Math.random() * INITIALS_LETTERS.length)];
  const i2 = INITIALS_LETTERS[Math.floor(Math.random() * INITIALS_LETTERS.length)];
  
  // Добавляем окончание для женских фамилий случайным образом (если славянская)
  const isFemale = Math.random() > 0.5;
  let finalSurname = surname;
  
  if (isFemale && (surname.endsWith('ов') || surname.endsWith('ев') || surname.endsWith('ин'))) {
    finalSurname += 'а';
  } else if (isFemale && surname.endsWith('ий')) {
    finalSurname = surname.replace('ий', 'ая');
  }

  return `${finalSurname} ${i1}. ${i2}.`;
};

const TRANSFER_TYPES = [
  { id: 'services', label: 'Оплата услуг', desc: 'ЖКХ, интернет, связь', icon: 'list', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { id: 'exchange', label: 'Обмен валют', desc: 'Конвертация USDT/RUB', icon: 'swap', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { id: 'internal', label: 'Между своими', desc: 'С карты на карту Nova', icon: 'credit-card', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { id: 'card', label: 'По номеру карты', desc: 'На любую карту мира', icon: 'credit-card', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { id: 'account', label: 'По номеру счета', desc: 'Банковские реквизиты', icon: 'hash', color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

const Transfers: React.FC<TransfersProps> = ({ onSend, cards }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<TransferStep>('select-card');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedType, setSelectedType] = useState<typeof TRANSFER_TYPES[0] | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');

  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setRecipient(formatted);
    
    if (value.length === 16 && selectedType?.id === 'card') {
      setIsVerifying(true);
      setVerifiedName('');
      setTimeout(() => {
        setIsVerifying(false);
        setVerifiedName(generateRandomName());
      }, 1200);
    } else {
      setVerifiedName('');
      setIsVerifying(false);
    }
  };

  const handleSend = () => {
    const amt = parseFloat(amount);
    if (selectedCard && amt > 0) {
      setStep('processing');
      setTimeout(() => {
        onSend(verifiedName || recipient || selectedType?.label || 'Перевод', amt, selectedCard.currency);
        setStep('success');
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

  const renderStep = () => {
    switch (step) {
      case 'select-card':
        return (
          <div className="space-y-6 animate-fluid-fade">
            <div className="px-1">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">ВЫБЕРИТЕ СЧЕТ СПИСАНИЯ</h2>
              <div className="space-y-3">
                {cards.map((card, idx) => (
                  <button 
                    key={card.id}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                    onClick={() => { setSelectedCard(card); setStep('select-type'); }}
                    className="w-full bg-white p-5 rounded-[30px] border border-slate-100 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all group hover:border-blue-300 animate-fluid-up"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: card.color }}>
                        <Icons name="credit-card" className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 text-[15px]">{card.type}</p>
                        <p className="text-[10px] font-bold text-slate-300 tracking-wider italic">{card.number.match(/.{1,4}/g)?.join(' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 text-[16px]">{getCurrencySymbol(card.currency)} {card.balance.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'select-type':
        return (
          <div className="space-y-6 animate-fluid-fade">
            <div className="px-1">
              <div className="flex items-center gap-3 mb-6 animate-fluid-down">
                <button onClick={() => setStep('select-card')} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-blue-500 active:scale-90 transition-transform shadow-sm">
                   <Icons name="arrow-up" className="w-5 h-5 -rotate-90" />
                </button>
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Назад</span>
              </div>
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">ЧТО ПЕРЕВОДИМ?</h2>
              <div className="space-y-3">
                {TRANSFER_TYPES.map((type, idx) => (
                  <button 
                    key={type.id}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => { setSelectedType(type); setStep('enter-details'); }}
                    className="w-full bg-white p-5 rounded-[30px] border border-slate-100 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all group hover:border-blue-200 animate-fluid-up"
                  >
                    <div className={`w-12 h-12 rounded-[22px] ${type.color.split(' ')[0]} ${type.color.split(' ')[1]} border flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <Icons name={type.icon} className="w-6 h-6" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-slate-800 text-[15px]">{type.label}</p>
                      <p className="text-[11px] font-bold text-slate-300 uppercase">{type.desc}</p>
                    </div>
                    <Icons name="arrow-up" className="w-4 h-4 rotate-90 text-slate-100 group-hover:text-blue-200 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'enter-details':
        return (
          <div className="space-y-6 animate-fluid-fade">
            <div className="px-1">
              <div className="flex items-center gap-3 mb-6 animate-fluid-down">
                <button onClick={() => setStep('select-type')} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-blue-500 active:scale-90 transition-transform shadow-sm">
                   <Icons name="arrow-up" className="w-5 h-5 -rotate-90" />
                </button>
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Тип платежа</span>
              </div>
              
              <div className="bg-white p-8 rounded-[44px] border border-slate-50 shadow-2xl space-y-10 animate-fluid-scale">
                <div className="text-center space-y-2">
                   <div className={`w-20 h-20 rounded-[30px] ${selectedType?.color.split(' ')[0]} ${selectedType?.color.split(' ')[1]} flex items-center justify-center mx-auto mb-4 border-2 border-white shadow-xl`}>
                      <Icons name={selectedType?.icon || 'send'} className="w-10 h-10" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedType?.label}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">С {selectedCard?.currency} СЧЕТА</p>
                </div>

                <div className="space-y-7">
                  {selectedType?.id !== 'internal' && selectedType?.id !== 'exchange' && (
                    <div className="space-y-3 relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">РЕКВИЗИТЫ</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={recipient}
                          onChange={handleCardInput}
                          placeholder={selectedType?.id === 'card' ? '0000 0000 0000 0000' : 'Номер договора или телефона'}
                          className={`w-full bg-slate-50 border rounded-[28px] p-6 text-sm font-black focus:outline-none transition-all text-slate-800 placeholder:text-slate-200 ${isVerifying ? 'border-blue-200' : verifiedName ? 'border-emerald-200' : 'border-slate-100 focus:border-blue-400 focus:bg-white'}`}
                        />
                        {isVerifying && (
                          <div className="absolute right-6 top-1/2 -translate-y-1/2">
                             <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      
                      {verifiedName && (
                        <div className="mt-2 px-6 py-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-fluid-scale">
                           <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                           <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Получатель: {verifiedName}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">СУММА</label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-[30px] px-8 focus-within:border-blue-400 focus-within:bg-white transition-all group">
                      <input 
                        autoFocus
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-transparent py-7 text-4xl font-black text-center focus:outline-none text-slate-900 placeholder:text-slate-200"
                      />
                      <span className="text-2xl font-black text-slate-300 ml-4 group-focus-within:text-blue-500 transition-colors">
                        {getCurrencySymbol(selectedCard?.currency || 'RUB')}
                      </span>
                    </div>
                    <p className="text-center text-[10px] font-black text-slate-300 mt-2 uppercase tracking-widest">Доступно: {selectedCard?.balance.toLocaleString()} {getCurrencySymbol(selectedCard?.currency || 'RUB')}</p>
                  </div>
                </div>

                <button 
                  disabled={!amount || parseFloat(amount) <= 0 || (selectedType?.id === 'card' && !verifiedName) || (selectedType?.id === 'account' && !recipient)}
                  onClick={handleSend}
                  className="w-full bg-blue-600 text-white disabled:bg-slate-50 disabled:text-slate-200 rounded-[28px] py-6 font-black text-lg active:scale-[0.97] transition-all shadow-xl shadow-blue-100 hover:bg-blue-700"
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-fluid-fade">
             <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border-[6px] border-slate-50 rounded-full"></div>
                <div className="absolute inset-0 border-[6px] border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <Icons name="nova" className="w-10 h-10 text-blue-500 animate-pulse" />
             </div>
             <p className="mt-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Выполняем операцию...</p>
          </div>
        );

      case 'success':
        return (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-fluid-up overflow-y-auto no-scrollbar pb-10">
            <div className="absolute top-0 left-0 right-0 h-[45vh] bg-gradient-to-b from-emerald-50 to-white -z-10"></div>
            
            <div className="p-8 flex justify-end">
              <button onClick={() => navigate('/')} className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all active:scale-90 border border-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="flex flex-col items-center space-y-8 pt-4 pb-12">
               <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
                  <div className="w-28 h-28 rounded-[40px] bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-200 relative animate-fluid-scale">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17L4 12" /></svg>
                  </div>
               </div>
               
               <div className="text-center space-y-4 px-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-[0.2em] animate-fluid-fade">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                     Операция успешна
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-6xl font-black text-slate-900 tracking-tighter animate-fluid-up">
                    <span className="text-2xl text-slate-200 mt-3">{getCurrencySymbol(selectedCard?.currency || 'RUB')}</span>
                    <span>{parseFloat(amount).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}</span>
                    <span className="text-2xl opacity-5 mt-5">,00</span>
                  </div>
                  <div className="animate-fluid-fade" style={{ animationDelay: '0.2s' }}>
                    <p className="text-slate-800 font-black text-2xl tracking-tight leading-none">{verifiedName || recipient || selectedType?.label}</p>
                  </div>
               </div>
            </div>

            <div className="px-6 space-y-2 animate-fluid-up" style={{ animationDelay: '0.3s' }}>
              <div className="bg-white p-2 rounded-[36px] border border-slate-100 shadow-sm space-y-1">
                {[
                  { label: 'Счет списания', value: selectedCard?.type, icon: 'credit-card' },
                  { label: 'Когда', value: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }), icon: 'salary' },
                  { label: 'Комиссия', value: '0.00 ' + getCurrencySymbol(selectedCard?.currency || 'RUB'), icon: 'plus' },
                  { label: 'ID платежа', value: Math.random().toString(36).substring(7).toUpperCase(), icon: 'hash' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 last:border-0 border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                          <Icons name={item.icon} className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-[12px] font-bold text-slate-800 tracking-tight">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 mt-6 animate-fluid-up" style={{ animationDelay: '0.4s' }}>
               <button 
                onClick={() => navigate('/')}
                className="w-full bg-slate-900 text-white rounded-[28px] py-6 font-black text-lg shadow-2xl active:scale-[0.98] transition-all hover:bg-slate-800 shadow-slate-200"
               >
                На главную
               </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fluid-fade text-slate-800">
      <div className="flex flex-col space-y-1 mt-2 animate-fluid-down">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Платежи</h1>
      </div>

      {renderStep()}
    </div>
  );
};

export default Transfers;

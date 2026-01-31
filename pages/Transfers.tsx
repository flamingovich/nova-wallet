
import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';
import { Card, Currency } from '../types';
import { useNavigate } from 'react-router-dom';

interface TransfersProps {
  onSend: (merchant: string, amount: number, currency: Currency, totalDebit: number, fee: number) => void;
  cards: Card[];
}

type TransferStep = 'select-card' | 'select-type' | 'enter-details' | 'processing' | 'success';

// ОГРОМНАЯ БАЗА ТОЛЬКО МУЖСКИХ СЛАВЯНСКИХ ФАМИЛИЙ
const SURNAMES = [
  'Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Федоров',
  'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семенов', 'Егоров', 'Павлов', 'Козлов', 'Степанов', 'Николаев',
  'Орлов', 'Андреев', 'Макаров', 'Никитин', 'Захаров', 'Зайцев', 'Соловьев', 'Борисов', 'Яковлев', 'Григорьев',
  'Воробьев', 'Сергеев', 'Кузьмин', 'Касьянов', 'Фролов', 'Александров', 'Дмитриев', 'Королев', 'Гусев', 'Киселев',
  'Ильин', 'Максимов', 'Поляков', 'Сорокин', 'Фомин', 'Данилов', 'Жуков', 'Титов', 'Кудрявцев', 'Баранов', 'Куликов',
  'Анисимов', 'Ефимов', 'Тихонов', 'Медведев', 'Антонов', 'Тарасов', 'Белов', 'Комаров', 'Осипов', 'Матвеев',
  'Виноградов', 'Мартынов', 'Еремин', 'Герасимов', 'Бирюков', 'Филиппов', 'Абрамов', 'Дроздов', 'Шарапов', 'Ахмедов',
  'Громов', 'Белозерский', 'Волконский', 'Оболенский', 'Трубецкой', 'Голицын', 'Шереметьев', 'Юсупов', 'Меншиков',
  'Строганов', 'Воронцов', 'Лопухин', 'Романов', 'Разумовский', 'Толстой', 'Достоевский', 'Чехов', 'Пушкин',
  'Лермонтов', 'Ахматов', 'Цветаев', 'Бродский', 'Пастернак', 'Булгаков', 'Пелевин', 'Сорокин', 'Хабибуллин', 
  'Сафин', 'Дасаев', 'Яшин', 'Черенков', 'Аршавин', 'Кержаков', 'Дзюба', 'Головин', 'Миранчук', 'Смолов', 
  'Акинфеев', 'Игнашевич', 'Березуцкий', 'Жирков', 'Павлюченко', 'Погребняк', 'Абрамович', 'Авдеев', 'Агапов', 
  'Азаров', 'Аксёнов', 'Акулов', 'Алёхин', 'Алмазов', 'Алфёров', 'Амелин', 'Амиров', 'Ананьев', 'Андрианов',
  'Андропов', 'Аничков', 'Анненков', 'Антипов', 'Антропов', 'Ануфриев', 'Апарин', 'Апраксин', 'Аракчеев', 'Арбузов', 
  'Арефьев', 'Аристархов', 'Аристов', 'Арсеньев', 'Артёмов', 'Артемьев', 'Архипов', 'Аршинников', 'Астафьев', 
  'Астахов', 'Афанасьев', 'Афонин', 'Ахматов', 'Ахметов', 'Бабиков', 'Бабичев', 'Бабкин', 'Бабушкин', 'Багров', 
  'Бажанов', 'Базаров', 'Базин', 'Бакланов', 'Бакунин', 'Балакирев', 'Балашов', 'Балдин', 'Балкашин', 'Барановский', 
  'Баратов', 'Барков', 'Бармин', 'Барсуков', 'Барышников', 'Басов', 'Баталов', 'Батищев', 'Батурин', 'Батюшков', 
  'Бахметьев', 'Бахрушин', 'Башарин', 'Безбородов', 'Безруков', 'Безухов', 'Бекетов', 'Белинский', 'Белоглазов', 
  'Белозёрцев', 'Белоконь', 'Белокуров', 'Беломестных', 'Белоногов', 'Белосельский', 'Белоусов', 'Беляев', 'Беляков', 
  'Бердяев', 'Береговой', 'Бережной', 'Березин', 'Берёзов', 'Березовский', 'Бесчастных', 'Бестужев', 'Бехтерев', 
  'Бирюков', 'Благов', 'Блинов', 'Блохин', 'Бобров', 'Бобылёв', 'Богатов', 'Богатырёв', 'Богданов', 'Боголюбов', 
  'Богомолов', 'Бодров', 'Бойцов', 'Бокарев', 'Болдин', 'Болотников', 'Болтунов', 'Бондарев', 'Борзенков', 'Боровков', 
  'Бородин', 'Борцов', 'Бочаров', 'Бояринцев', 'Брагин', 'Братцев', 'Бредихин', 'Брежнев', 'Бриллиантов', 'Брюллов', 
  'Брюсов', 'Брызгалов', 'Буданов', 'Будённый', 'Бузин', 'Буков', 'Булавин', 'Буланов', 'Булатников', 'Булатов', 
  'Булыгин', 'Бунин', 'Бурков', 'Бурмакин', 'Буров', 'Бурцев', 'Бутусов', 'Бутурлин', 'Бухарин', 'Бушуев', 'Быков', 
  'Быковский', 'Бычков', 'Вавилов', 'Вагин', 'Вайцеховский', 'Вакулов', 'Вакутин', 'Валуев', 'Варенников', 
  'Варламов', 'Варфоломеев', 'Василевский', 'Васнецов', 'Ватутин', 'Вахрушев', 'Вахтин', 'Введенский', 'Веденеев', 
  'Веденин', 'Верещагин', 'Веселов', 'Ветров', 'Винокуров', 'Вислоухов', 'Витте', 'Вицин', 'Вишняков', 'Владимиров', 
  'Власов', 'Водников', 'Водянов', 'Вознесенский', 'Войков', 'Володин', 'Волочков', 'Волошин', 'Вольнов', 'Воробьёв', 
  'Воронин', 'Воронов', 'Воротынский', 'Ворошилов', 'Воскресенский', 'Востросаблин', 'Востряков', 'Вырыпаев', 
  'Вяземский', 'Гагарин', 'Гаврилов', 'Гаганов', 'Гайдар', 'Галактионов', 'Галицкий', 'Галкин', 'Гальцев', 'Ганичев', 
  'Ганнушкин', 'Гарин', 'Гарифуллин', 'Гаркалин', 'Гафт', 'Гвоздёв', 'Гедеонов', 'Герман', 'Герцен', 'Гиляровский', 
  'Гладков', 'Глазунов', 'Глебов', 'Глинка', 'Глухарёв', 'Глушков', 'Гнедич', 'Говоров', 'Гоголь', 'Годунов', 
  'Голенищев', 'Голованов', 'Головкин', 'Голосов', 'Голубев', 'Голубинский', 'Голубов', 'Голунов', 'Гольцев', 
  'Голышев', 'Гончаров', 'Горбачёв', 'Горбунов', 'Гордеев', 'Горелов', 'Горин', 'Горлов', 'Горский', 'Горюнов', 
  'Горячев', 'Гостищев', 'Готовцев', 'Градов', 'Грамматиков', 'Гранин', 'Грачёв', 'Гребенщиков', 'Греков', 'Гречко', 
  'Грибоедов', 'Гришин', 'Громыко', 'Груздев', 'Грушевой', 'Грязнов', 'Губанов', 'Губерман', 'Гудков', 'Гуляев', 
  'Гурвич', 'Гурченко', 'Гурьев', 'Гусаков', 'Гусаров', 'Гущин', 'Давыдов', 'Данилин', 'Дашков', 'Дворников', 
  'Дегтярёв', 'Дементьев', 'Демидов', 'Демьянов', 'Денисов', 'Державин', 'Десницкий', 'Дёмин', 'Дибич', 'Дивногорцев', 
  'Диков', 'Дикуль', 'Добрынин', 'Довлатов', 'Докучаев', 'Долгоруков', 'Долин', 'Дольский', 'Домогаров', 'Доронин', 
  'Дорофеев', 'Дорохов', 'Драгомиров', 'Драгунов', 'Дружинин', 'Друнин', 'Дубинин', 'Дубов', 'Дубровин', 'Дудин', 
  'Дунаевский', 'Дуров', 'Дурново', 'Дыховичный', 'Дьяков', 'Дьяконов', 'Дьяченко', 'Дюжев', 'Евдокимов', 'Евстигнеев', 
  'Евтушенко', 'Ежов', 'Елагин', 'Елизаров', 'Елисеев', 'Ельцин', 'Емельянов', 'Енин', 'Епанчин', 'Епифанцев', 
  'Еремеев', 'Ерёмин', 'Ермолов', 'Ерофеев', 'Ершов', 'Есенин', 'Ефремов', 'Жаров', 'Жданов', 'Жеглов', 'Жемчужников', 
  'Жигунов', 'Жидков', 'Жиров', 'Забелин', 'Заболотный', 'Забусов', 'Завьялов', 'Загоскин', 'Задорнов', 'Залесский', 
  'Залыгин', 'Замятин', 'Запашный', 'Зарубин', 'Заславский', 'Засулич', 'Звягинцев', 'Зеленин', 'Зеленский', 'Зелинский', 
  'Зимин', 'Зиновьев', 'Златоустов', 'Зотов', 'Зощенко', 'Зубов', 'Зудин', 'Зуев', 'Зыков', 'Зырянов', 'Зюганов'
];

const INITIALS_LETTERS = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ';

const generateRandomName = () => {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const i1 = INITIALS_LETTERS[Math.floor(Math.random() * INITIALS_LETTERS.length)];
  const i2 = INITIALS_LETTERS[Math.floor(Math.random() * INITIALS_LETTERS.length)];
  // Only male names as requested
  return `${surname} ${i1}. ${i2}.`;
};

const getCardBrand = (number: string) => {
  const clean = number.replace(/\s/g, '');
  if (!clean) return null;
  if (clean.startsWith('4')) return 'Visa';
  if (clean.startsWith('2')) {
      if (clean.startsWith('220')) return 'МИР';
      if (/^2(22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(clean)) return 'MasterCard';
      return null;
  }
  if (/^5[1-5]/.test(clean)) return 'MasterCard';
  if (clean.startsWith('6')) return 'Maestro';
  return null;
};

const STANDARD_TYPES = [
  { id: 'internal', label: 'Свои счета', desc: 'Внутри Nova', icon: 'credit-card', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { id: 'card', label: 'На карту', desc: 'В любой банк', icon: 'credit-card', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { id: 'services', label: 'Услуги', desc: 'ЖКХ, связь', icon: 'list', color: 'bg-orange-50 text-orange-600 border-orange-100' },
];

const USDT_TYPES = [
  { id: 'send-usdt', label: 'USDT (TRC20)', desc: 'Внешний адрес', icon: 'nova', color: 'bg-teal-50 text-teal-600 border-teal-100' },
  { id: 'exchange-usdt', label: 'Обмен', desc: 'RUB/USD/EUR', icon: 'swap', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
];

const Transfers: React.FC<TransfersProps> = ({ onSend, cards }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<TransferStep>('select-card');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedType, setSelectedType] = useState<any | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [detectedBrand, setDetectedBrand] = useState<string | null>(null);

  const currentTypes = selectedCard?.currency === 'USDT' ? USDT_TYPES : STANDARD_TYPES;

  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');
    const isCardType = selectedType?.id === 'card';
    
    if (isCardType) {
       value = value.replace(/\D/g, '');
       if (value.length > 16) value = value.slice(0, 16);
       setDetectedBrand(getCardBrand(value));
       const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
       setRecipient(formatted);
       
       if (value.length === 16) {
         setIsVerifying(true);
         setVerifiedName('');
         setTimeout(() => {
           setIsVerifying(false);
           setVerifiedName(generateRandomName());
         }, 800);
       } else {
         setVerifiedName('');
         setIsVerifying(false);
       }
    } else {
       setRecipient(e.target.value);
    }
  };

  const FEE_PERCENT = 0.05; // 5%
  const getFee = (amt: number) => amt * FEE_PERCENT;

  const handleSend = () => {
    const amt = parseFloat(amount);
    if (selectedCard && amt > 0) {
      if (selectedType?.id === 'exchange-usdt') {
        navigate('/exchange');
        return;
      }
      
      const fee = getFee(amt);
      const totalDebit = amt + fee;

      setStep('processing');
      setTimeout(() => {
        onSend(verifiedName || recipient || selectedType?.label || 'Перевод', amt, selectedCard.currency, totalDebit, fee);
        setStep('success');
      }, 2500);
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
            <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Выберите счет</h2>
            <div className="space-y-2">
              {cards.map((card) => (
                <button 
                  key={card.id}
                  onClick={() => { setSelectedCard(card); setStep('select-type'); }}
                  className="w-full bg-white p-4 rounded-[24px] border border-slate-100 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all animate-fluid-up"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0" style={{ background: card.color }}>
                      <Icons name="credit-card" className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800 text-sm leading-tight">{card.type}</p>
                      <p className="text-[9px] font-bold text-slate-300 tracking-wider">{card.number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-[14px]">{getCurrencySymbol(card.currency)} {card.balance.toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'select-type':
        return (
          <div className="space-y-4 animate-fluid-fade">
            <button onClick={() => setStep('select-card')} className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">
               <Icons name="arrow-up" className="w-3 h-3 -rotate-90" /> Назад
            </button>
            <div className="space-y-2">
              {currentTypes.map((type) => (
                <button 
                  key={type.id}
                  onClick={() => { setSelectedType(type); setStep('enter-details'); }}
                  className="w-full bg-white p-4 rounded-[24px] border border-slate-100 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-all animate-fluid-up"
                >
                  <div className={`w-10 h-10 rounded-xl ${type.color.split(' ')[0]} ${type.color.split(' ')[1]} border flex items-center justify-center shrink-0`}>
                    <Icons name={type.icon} className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-slate-800 text-sm leading-tight">{type.label}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase leading-tight">{type.desc}</p>
                  </div>
                  <Icons name="arrow-up" className="w-3 h-3 rotate-90 text-slate-200" />
                </button>
              ))}
            </div>
          </div>
        );

      case 'enter-details':
        const currentAmount = parseFloat(amount) || 0;
        const currentFee = getFee(currentAmount);
        const totalAmount = currentAmount + currentFee;

        return (
          <div className="space-y-4 animate-fluid-fade">
            <button onClick={() => setStep('select-type')} className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">
               <Icons name="arrow-up" className="w-3 h-3 -rotate-90" /> Назад
            </button>
            
            <div className="bg-white p-6 rounded-[36px] border border-slate-50 shadow-xl space-y-6 animate-fluid-scale">
              <div className="text-center space-y-1">
                 <h3 className="text-xl font-black text-slate-800">{selectedType?.label}</h3>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">С {selectedCard?.currency} счета</p>
              </div>

              <div className="space-y-5">
                {selectedType?.id !== 'internal' && selectedType?.id !== 'exchange-usdt' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Реквизиты</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={recipient}
                        onChange={handleCardInput}
                        placeholder={selectedType?.id === 'card' ? '0000 0000 0000 0000' : 'Адрес кошелька'}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-4 text-sm font-black focus:outline-none transition-all text-slate-800 placeholder:text-slate-200"
                      />
                      {detectedBrand && (
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-white border border-slate-100 rounded text-[8px] font-black text-blue-600 uppercase">
                            {detectedBrand}
                         </div>
                      )}
                    </div>
                    {verifiedName && (
                      <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 animate-fluid-scale">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                         <p className="text-[9px] font-black text-emerald-700 uppercase">{verifiedName}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Сумма перевода</label>
                  <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-[24px] px-6 focus-within:border-blue-300 focus-within:bg-white transition-all">
                    <input 
                      autoFocus
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent py-4 text-3xl font-black text-center focus:outline-none text-slate-900 placeholder:text-slate-200"
                    />
                    <span className="text-xl font-black text-slate-300 ml-2">{getCurrencySymbol(selectedCard?.currency || 'RUB')}</span>
                  </div>

                  {currentAmount > 0 && (
                    <div className="p-3 bg-slate-50 rounded-[20px] border border-slate-100 space-y-1 animate-fluid-up">
                       <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                          <span>Комиссия (5%):</span>
                          <span className="text-slate-600">+{currentFee.toFixed(2)} {getCurrencySymbol(selectedCard?.currency || 'RUB')}</span>
                       </div>
                       <div className="flex justify-between items-center text-[11px] font-black text-slate-800 uppercase pt-1 border-t border-white">
                          <span>Итого списание:</span>
                          <span className="text-blue-600">{totalAmount.toFixed(2)} {getCurrencySymbol(selectedCard?.currency || 'RUB')}</span>
                       </div>
                    </div>
                  )}
                </div>
              </div>

              <button 
                disabled={!amount || parseFloat(amount) <= 0 || totalAmount > (selectedCard?.balance || 0)}
                onClick={handleSend}
                className="w-full bg-blue-600 text-white disabled:bg-slate-100 disabled:text-slate-300 rounded-[22px] py-4 font-black text-sm active:scale-[0.97] transition-all shadow-lg hover:bg-blue-700"
              >
                Отправить
              </button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
             <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
             <p className="mt-6 text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Обработка...</p>
          </div>
        );

      case 'success':
        const finalAmt = parseFloat(amount);
        const finalFee = getFee(finalAmt);
        return (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-fluid-up overflow-y-auto pb-10">
            <div className="p-6 flex justify-end">
              <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90">
                <Icons name="qr" className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col items-center space-y-6 pt-2 pb-10">
               <div className="w-20 h-20 rounded-[30px] bg-emerald-500 flex items-center justify-center text-white shadow-xl animate-fluid-scale">
                 <Icons name="plus" className="w-10 h-10 rotate-45" />
               </div>
               <div className="text-center px-8">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Успешно отправлено</p>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter">
                    {finalAmt.toLocaleString('ru-RU')} <span className="text-2xl opacity-20">{getCurrencySymbol(selectedCard?.currency || 'RUB')}</span>
                  </div>
                  <p className="mt-4 text-slate-800 font-black text-lg">{verifiedName || recipient}</p>
               </div>
            </div>
            <div className="px-6 space-y-3">
              <div className="bg-slate-50 p-4 rounded-[28px] border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-300 uppercase">Комиссия банка (5%)</span>
                    <span className="text-slate-800">{finalFee.toFixed(2)} {getCurrencySymbol(selectedCard?.currency || 'RUB')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-black pt-2 border-t border-white">
                    <span className="text-slate-400 uppercase">Всего списано</span>
                    <span className="text-slate-900">{(finalAmt + finalFee).toFixed(2)} {getCurrencySymbol(selectedCard?.currency || 'RUB')}</span>
                  </div>
              </div>
              <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white rounded-[22px] py-4 font-black text-sm active:scale-[0.98]">
                На главную
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 animate-fluid-fade">
      <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">Платежи</h1>
      {renderStep()}
    </div>
  );
};

export default Transfers;

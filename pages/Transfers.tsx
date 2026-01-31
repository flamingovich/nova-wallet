
import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';
import { Card, Currency } from '../types';
import { useNavigate } from 'react-router-dom';

interface TransfersProps {
  onSend: (merchant: string, amount: number, currency: Currency, totalDebit: number, fee: number) => void;
  cards: Card[];
}

type TransferStep = 'select-card' | 'select-type' | 'enter-details' | 'processing' | 'success';

// ОГРОМНЫЙ СПИСОК МУЖСКИХ СЛАВЯНСКИХ ФАМИЛИЙ
const SURNAMES = [
  'Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Федоров',
  'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семенов', 'Егоров', 'Павлов', 'Козлов', 'Степанов', 'Николаев',
  'Орлов', 'Андреев', 'Макаров', 'Никитин', 'Захаров', 'Зайцев', 'Соловьев', 'Борисов', 'Яковлев', 'Григорьев',
  'Воробьев', 'Сергеев', 'Кузьмин', 'Касьянов', 'Фролов', 'Александров', 'Дмитриев', 'Королев', 'Гусев', 'Киселев',
  'Ильин', 'Максимов', 'Поляков', 'Сорокин', 'Фомин', 'Данилов', 'Жуков', 'Титов', 'Кудрявцев', 'Баранов', 'Куликов',
  'Анисимов', 'Ефимов', 'Тихонов', 'Медведев', 'Антонов', 'Тарасов', 'Белов', 'Комаров', 'Осипов', 'Матвеев',
  'Виноградов', 'Мартынов', 'Еремин', 'Герасимов', 'Бирюков', 'Филиппов', 'Абрамов', 'Дроздов', 'Шарапов', 'Ахмедов',
  'Громов', 'Белозерский', 'Волконский', 'Оболенский', 'Трубецкой', 'Голицын', 'Шереметьев', 'Юсупов', 'Меншиков',
  'Строганов', 'Воронцов', 'Лопухин', 'Романов', 'Рюрикович', 'Кантемир', 'Разумовский', 'Толстой', 'Достоевский',
  'Чехов', 'Пушкин', 'Лермонтов', 'Ахматов', 'Цветаев', 'Бродский', 'Пастернак', 'Булгаков', 'Пелевин', 'Сорокин',
  'Хабибуллин', 'Сафин', 'Дасаев', 'Яшин', 'Черенков', 'Аршавин', 'Кержаков', 'Дзюба', 'Головин', 'Миранчук', 'Смолов',
  'Акинфеев', 'Игнашевич', 'Березуцкий', 'Жирков', 'Павлюченко', 'Погребняк', 'Абрамович', 'Авдеев', 'Агапов', 'Азаров',
  'Аксёнов', 'Акулов', 'Александров', 'Алёхин', 'Алмазов', 'Алфёров', 'Амелин', 'Амиров', 'Ананьев', 'Андрианов',
  'Андропов', 'Аничков', 'Анненков', 'Антипов', 'Антропов', 'Ануфриев', 'Апарин', 'Апраксин', 'Аракчеев', 'Арбузов',
  'Арефьев', 'Аристархов', 'Аристов', 'Арсеньев', 'Артёмов', 'Артемьев', 'Архипов', 'Аршинников', 'Астафьев', 'Астахов',
  'Афанасьев', 'Афонин', 'Ахметов', 'Бабиков', 'Бабичев', 'Бабкин', 'Бабушкин', 'Багров', 'Бажанов', 'Базаров', 'Базин',
  'Бакланов', 'Бакунин', 'Балакирев', 'Балашов', 'Балдин', 'Балкашин', 'Барановский', 'Баратов', 'Барков', 'Бармин',
  'Барсуков', 'Барышников', 'Басов', 'Баталов', 'Батищев', 'Батурин', 'Батюшков', 'Бахметьев', 'Бахрушин', 'Башарин',
  'Безбородов', 'Безруков', 'Безухов', 'Бекетов', 'Белинский', 'Белоглазов', 'Белозёрцев', 'Белоконь', 'Белокуров',
  'Беломестных', 'Белоногов', 'Белосельский', 'Белоусов', 'Беляев', 'Беляков', 'Бердяев', 'Береговой', 'Бережной',
  'Березин', 'Берёзов', 'Березовский', 'Бесчастных', 'Бестужев', 'Бехтерев', 'Благов', 'Блинов', 'Блохин', 'Бобров',
  'Бобылёв', 'Богатов', 'Богатырёв', 'Богданов', 'Боголюбов', 'Богомолов', 'Бодров', 'Бойко', 'Бойцов', 'Бокарев',
  'Болдин', 'Болотников', 'Болтунов', 'Бондарев', 'Бондаренко', 'Борзенков', 'Боровков', 'Бородин', 'Борцов', 'Бочаров',
  'Бояринцев', 'Брагин', 'Братцев', 'Бредихин', 'Брежнев', 'Бриллиантов', 'Брюллов', 'Брюсов', 'Брызгалов', 'Буданов',
  'Будённый', 'Бузин', 'Буков', 'Булавин', 'Буланов', 'Булатников', 'Булатов', 'Булыгин', 'Бунин', 'Бурков', 'Бурмакин',
  'Буров', 'Бурцев', 'Бутусов', 'Бутурлин', 'Бухарин', 'Бушуев', 'Быков', 'Быковский', 'Бычков', 'Вавилов', 'Вагин',
  'Вайцеховский', 'Вакулов', 'Вакутин', 'Валуев', 'Варенников', 'Варламов', 'Варфоломеев', 'Василевский', 'Васильев',
  'Васнецов', 'Ватутин', 'Вахрушев', 'Вахтин', 'Введенский', 'Веденеев', 'Веденин', 'Верещагин', 'Веселов', 'Ветров',
  'Виноградов', 'Винокуров', 'Вислоухов', 'Витте', 'Вицин', 'Вишняков', 'Владимиров', 'Власов', 'Водников', 'Водянов',
  'Вознесенский', 'Войков', 'Володин', 'Волочков', 'Волошин', 'Вольнов', 'Воробьёв', 'Воронин', 'Воронов', 'Воротынский',
  'Ворошилов', 'Воскресенский', 'Востросаблин', 'Востряков', 'Вырыпаев', 'Вяземский', 'Гагарин', 'Гаврилов', 'Гаганов',
  'Гайдар', 'Галактионов', 'Галицкий', 'Галкин', 'Гальцев', 'Ганичев', 'Ганнушкин', 'Гарин', 'Гарифуллин', 'Гаркалин',
  'Гафт', 'Гвоздёв', 'Гедеонов', 'Герасимов', 'Герман', 'Герцен', 'Гиляровский', 'Гладков', 'Глазунов', 'Глебов', 'Глинка',
  'Глухарёв', 'Глушков', 'Гнедич', 'Говоров', 'Гоголь', 'Годунов', 'Голенищев', 'Голицын', 'Голованов', 'Головин',
  'Головкин', 'Голосов', 'Голубев', 'Голубинский', 'Голубов', 'Голунов', 'Гольцев', 'Голышев', 'Гончаров', 'Горбачёв',
  'Горбунов', 'Гордеев', 'Гордон', 'Горелов', 'Горин', 'Горлов', 'Горский', 'Горький', 'Горюнов', 'Горячев', 'Гостищев',
  'Готовцев', 'Градов', 'Грамматиков', 'Гранин', 'Грачёв', 'Гребенщиков', 'Греков', 'Гречко', 'Грибоедов', 'Гришин',
  'Громов', 'Громыко', 'Груздев', 'Грушевой', 'Грязнов', 'Губанов', 'Губерман', 'Гудков', 'Гуляев', 'Гурвич', 'Гурченко',
  'Гурьев', 'Гусаков', 'Гусаров', 'Гусев', 'Гущин', 'Давыдов', 'Данилин', 'Дашков', 'Дворников', 'Дегтярёв', 'Дементьев',
  'Демидов', 'Демьянов', 'Денисов', 'Державин', 'Десницкий', 'Дёмин', 'Дибич', 'Дивногорцев', 'Диков', 'Дикуль', 'Дмитриев',
  'Добрынин', 'Довлатов', 'Докучаев', 'Долгоруков', 'Долин', 'Дольский', 'Домогаров', 'Доронин', 'Дорофеев', 'Дорохов',
  'Достоевский', 'Драгомиров', 'Драгунов', 'Дружинин', 'Друнин', 'Дубинин', 'Дубов', 'Дубровин', 'Дудин', 'Дунаевский',
  'Дуров', 'Дурново', 'Дыховичный', 'Дьяков', 'Дьяконов', 'Дьяченко', 'Дюжев', 'Евдокимов', 'Евстигнеев', 'Евтушенко',
  'Егоров', 'Ежов', 'Елагин', 'Елизаров', 'Елисеев', 'Ельцин', 'Емельянов', 'Енин', 'Епанчин', 'Епифанцев', 'Еремеев',
  'Ерёмин', 'Ермолов', 'Ерофеев', 'Ершов', 'Есенин', 'Ефремов', 'Жаров', 'Жданов', 'Жеглов', 'Жемчужников', 'Жигунов',
  'Жидков', 'Жиров', 'Забелин', 'Заболотный', 'Забусов', 'Завьялов', 'Загоскин', 'Задорнов', 'Залесский', 'Залыгин',
  'Замятин', 'Запашный', 'Зарубин', 'Заславский', 'Засулич', 'Звягинцев', 'Зеленин', 'Зеленский', 'Зелинский', 'Зимин',
  'Зиновьев', 'Златоустов', 'Зотов', 'Зощенко', 'Зубов', 'Зудин', 'Зуев', 'Зыков', 'Зырянов', 'Зюганов'
];

const INITIALS_LETTERS = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ';

const generateRandomName = () => {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const i1 = INITIALS_LETTERS[Math.floor(Math.random() * INITIALS_LETTERS.length)];
  const i2 = INITIALS_LETTERS[Math.floor(Math.random() * INITIALS_LETTERS.length)];
  return `${surname} ${i1}. ${i2}.`;
};

const getCardBrand = (number: string) => {
  const clean = number.replace(/\s/g, '');
  if (clean.startsWith('4')) return 'Visa';
  if (clean.startsWith('220')) return 'МИР';
  if (/^5[1-5]/.test(clean)) return 'MasterCard';
  return null;
};

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

  const FEE_PERCENT = 0.05; // 5% как просили
  const getFee = (amt: number) => amt * FEE_PERCENT;

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
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Откуда переводим</h2>
            <div className="space-y-2">
              {cards.map((card) => (
                <button 
                  key={card.id}
                  onClick={() => { setSelectedCard(card); setStep('select-type'); }}
                  className="w-full bg-white p-4 rounded-[24px] border border-slate-100 flex items-center justify-between tile-shadow active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <Icons name="credit-card" className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-800 text-sm leading-tight">{card.type}</p>
                      <p className="text-[10px] font-bold text-slate-300 tracking-wider italic">•••• {card.number.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-[14px]">{card.balance.toLocaleString()} {getCurrencySymbol(card.currency)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'select-type':
        return (
          <div className="space-y-3 animate-fluid-fade">
             <button onClick={() => setStep('select-card')} className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase px-1">
               <Icons name="arrow-up" className="w-3 h-3 -rotate-90" /> Назад
            </button>
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Выберите способ</h2>
            <div className="space-y-2">
              {[
                { id: 'card', label: 'По номеру карты', icon: 'credit-card', color: 'text-blue-500 bg-blue-50' },
                { id: 'phone', label: 'По номеру телефона', icon: 'user', color: 'text-emerald-500 bg-emerald-50' },
                { id: 'internal', label: 'Между счетами', icon: 'swap', color: 'text-indigo-500 bg-indigo-50' }
              ].map((type) => (
                <button 
                  key={type.id}
                  onClick={() => { setSelectedType(type); setStep('enter-details'); }}
                  className="w-full bg-white p-4 rounded-[24px] border border-slate-100 flex items-center gap-3 tile-shadow active:scale-[0.98] transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type.color}`}>
                    <Icons name={type.icon} className="w-5 h-5" />
                  </div>
                  <span className="font-black text-slate-800 text-sm">{type.label}</span>
                  <Icons name="arrow-up" className="w-3 h-3 rotate-90 text-slate-200 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        );

      case 'enter-details':
        const curAmt = parseFloat(amount) || 0;
        const total = curAmt * 1.05;
        const feeAmt = curAmt * 0.05;

        return (
          <div className="space-y-4 animate-fluid-fade">
             <button onClick={() => setStep('select-type')} className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase px-1">
               <Icons name="arrow-up" className="w-3 h-3 -rotate-90" /> Назад
            </button>
            <div className="bg-white p-6 rounded-[32px] tile-shadow border border-slate-50 space-y-6">
               <div className="text-center">
                  <h3 className="text-lg font-black text-slate-800">{selectedType?.label}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">Карта •••• {selectedCard?.number.slice(-4)}</p>
               </div>

               <div className="space-y-4">
                  {selectedType?.id === 'card' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-300 uppercase px-2">Номер карты</label>
                      <input 
                        type="text" 
                        value={recipient} 
                        onChange={(e) => {
                           let v = e.target.value.replace(/\D/g, '').slice(0, 16);
                           setRecipient(v.match(/.{1,4}/g)?.join(' ') || v);
                           setDetectedBrand(getCardBrand(v));
                           if (v.length === 16) { 
                             setIsVerifying(true); 
                             setTimeout(() => { 
                               setIsVerifying(false); 
                               setVerifiedName(generateRandomName()); 
                             }, 800); 
                           } else setVerifiedName('');
                        }}
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-center font-black text-lg focus:outline-none" 
                      />
                      {detectedBrand && <p className="text-[9px] font-black text-blue-600 text-center uppercase tracking-widest mt-1">{detectedBrand}</p>}
                      {verifiedName && <p className="text-[10px] font-black text-emerald-500 text-center uppercase tracking-widest mt-2">{verifiedName}</p>}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-300 uppercase px-2">Сумма</label>
                    <div className="relative">
                       <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center font-black text-3xl focus:outline-none" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-black">{getCurrencySymbol(selectedCard?.currency || 'RUB')}</span>
                    </div>
                  </div>

                  {curAmt > 0 && (
                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 space-y-1 animate-fluid-up">
                       <div className="flex justify-between text-[9px] font-bold text-blue-400 uppercase">
                          <span>Комиссия (5%):</span>
                          <span>+{feeAmt.toFixed(2)} {getCurrencySymbol(selectedCard?.currency || 'RUB')}</span>
                       </div>
                       <div className="flex justify-between text-[11px] font-black text-blue-600 uppercase pt-1 border-t border-blue-100/50">
                          <span>Всего к списанию:</span>
                          <span>{total.toFixed(2)} {getCurrencySymbol(selectedCard?.currency || 'RUB')}</span>
                       </div>
                    </div>
                  )}
               </div>

               <button 
                 disabled={!amount || parseFloat(amount) <= 0 || total > (selectedCard?.balance || 0)}
                 onClick={handleSend}
                 className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-30"
               >
                 Перевести
               </button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center">
             <div className="w-12 h-12 border-4 border-slate-100 border-t-red-500 rounded-full animate-spin"></div>
             <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Выполняем...</p>
          </div>
        );

      case 'success':
        const finalAmt = parseFloat(amount);
        const finalFee = getFee(finalAmt);
        const symbol = getCurrencySymbol(selectedCard?.currency || 'RUB');
        return (
          <div className="fixed inset-0 z-[2000] bg-white flex flex-col animate-fluid-up">
             {/* Beautiful Success Gradient Header */}
             <div className="h-[40vh] bg-gradient-to-b from-emerald-500 via-teal-500 to-white flex flex-col items-center justify-center text-white relative px-6">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/30 animate-fluid-scale">
                   <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-emerald-500">
                      <Icons name="swap" className="w-8 h-8" />
                   </div>
                </div>
                <h2 className="text-2xl font-black mt-6 tracking-tight">Перевод выполнен</h2>
                <div className="mt-2 flex items-center gap-1 opacity-80">
                   <Icons name="nova" className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em]">NovaBank Success</span>
                </div>
             </div>

             <div className="flex-1 bg-white px-8 pt-8 space-y-6 flex flex-col items-center">
                <div className="text-center space-y-1">
                   <p className="text-4xl font-black text-slate-900 tracking-tighter">{finalAmt.toLocaleString()} {symbol}</p>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{verifiedName || recipient}</p>
                </div>

                <div className="w-full bg-slate-50 rounded-[28px] p-5 border border-slate-100 space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Комиссия (5%)</span>
                      <span className="text-[12px] font-black text-slate-800">+{finalFee.toFixed(2)} {symbol}</span>
                   </div>
                   <div className="h-px bg-slate-200/50"></div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Всего списано</span>
                      <span className="text-[14px] font-black text-emerald-600">{(finalAmt + finalFee).toFixed(2)} {symbol}</span>
                   </div>
                </div>

                <div className="w-full space-y-3 mt-auto mb-8">
                   <button className="w-full bg-blue-50 text-blue-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all">
                      <Icons name="list" className="w-5 h-5" />
                      Посмотреть чек
                   </button>
                   <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all">
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

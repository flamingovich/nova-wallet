
import React, { useState } from 'react';
import { Transaction, Asset, Language } from '../types';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, X, ExternalLink, Repeat, History, Check, Star, Share, Info, CheckCircle2 } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  assets: Asset[];
  onBack: () => void;
  t: any;
  language: Language;
  formatPrice: (usd: number) => string;
}

const formatValue = (val: number, maxDecimals: number = 4) => {
  return val.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
};

// Экспортируемый компонент элемента списка для повторного использования
export const TransactionItem: React.FC<{
  tx: Transaction;
  assets: Asset[];
  language: Language;
  formatPrice: (usd: number) => string;
  onClick: (tx: Transaction) => void;
}> = ({ tx, assets, language, formatPrice, onClick }) => {
  const getSymbolById = (id: string) => {
    const found = assets.find(a => a.id === id);
    return found ? found.symbol : id.split('-')[0].toUpperCase();
  };

  const isSend = tx.type === 'send';
  const isReceive = tx.type === 'receive';
  const isSwap = tx.type === 'swap';
  
  const fromSymbol = getSymbolById(tx.assetId);
  const toSymbol = isSwap ? getSymbolById(tx.toAssetId || '') : '';

  let subtitle = '';
  if (isSwap) {
    subtitle = `${fromSymbol} → ${toSymbol}`;
  } else if (tx.address) {
    subtitle = `${tx.address.slice(0, 8)}...${tx.address.slice(-4)}`;
  } else {
    subtitle = language === 'ru' ? 'Завершен' : 'Confirmed';
  }

  return (
    <div 
      className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900/40 rounded-[24px] border border-zinc-100 dark:border-white/5 active:bg-zinc-50 dark:active:bg-zinc-800/60 transition-all cursor-pointer btn-press"
      onClick={() => onClick(tx)}
    >
      <div className="flex items-center space-x-4 min-w-0">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm border transition-transform group-hover:scale-105 ${isSwap ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' : isSend ? 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-white/5 text-zinc-500' : 'bg-green-500/10 border-green-500/10 text-green-600'}`}>
          {isSwap ? <Repeat size={20} strokeWidth={2.5} /> : isSend ? <ArrowUpRight size={22} strokeWidth={2.5} /> : <ArrowDownLeft size={22} strokeWidth={2.5} />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5">
            <h4 className="font-bold text-[15px] text-[#1A1C1E] dark:text-white leading-none">
              {isSwap ? (language === 'ru' ? 'Обмен' : 'Swap') : isSend ? (language === 'ru' ? 'Отправлено' : 'Sent') : (language === 'ru' ? 'Получено' : 'Received')}
            </h4>
            <div className="w-3.5 h-3.5 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check size={10} strokeWidth={4} className="text-green-500" />
            </div>
          </div>
          <p className="text-[12px] text-zinc-400 font-bold truncate max-w-[140px] tracking-tight mt-1">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-extrabold text-[16px] tracking-tight ${isReceive ? 'text-green-500' : 'text-[#1A1C1E] dark:text-white'}`}>
          {isReceive ? '+' : '-'}{formatValue(tx.amount)} {fromSymbol}
        </p>
        <p className="text-[12px] text-zinc-400 font-bold mt-0.5 opacity-60">
          {formatPrice(tx.amount * (assets.find(a => a.id === tx.assetId)?.priceUsd || 0))}
        </p>
      </div>
    </div>
  );
};

const HistoryView: React.FC<Props> = ({ transactions, assets, onBack, t, language, formatPrice }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const formatDateLabel = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return language === 'ru' ? 'Сегодня' : 'Today';
    return d.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' });
  };

  const groupedTransactions = transactions.reduce((groups: any, tx) => {
    const dateLabel = formatDateLabel(tx.timestamp);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(tx);
    return groups;
  }, {});

  const getSymbol = (id: string) => assets.find(a => a.id === id)?.symbol || '';

  return (
    <div className="h-full bg-white dark:bg-black text-[#1A1C1E] dark:text-white flex flex-col animate-ios-slide-in relative transition-colors duration-300 md:items-center">
      <div className="w-full max-w-2xl px-5 md:px-8 pt-6 pb-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="p-2.5 text-[#1A1C1E] dark:text-white bg-zinc-100 dark:bg-zinc-900 rounded-full btn-press">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <div className="text-center">
          <h2 className="text-[17px] font-bold leading-tight">{t.history}</h2>
          <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5 opacity-50">{t.mainWallet}</p>
        </div>
        <button className="p-2.5 text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-full">
          <Star size={20} />
        </button>
      </div>

      <div className="flex-1 w-full max-w-2xl overflow-y-auto no-scrollbar pb-20 px-5">
        {transactions.length === 0 ? (
          <div className="py-24 text-center opacity-40">
             <History className="mx-auto mb-4" size={48} />
             <p className="font-bold">{language === 'ru' ? 'История пуста' : 'History is empty'}</p>
          </div>
        ) : (
          Object.keys(groupedTransactions).map((dateLabel) => (
            <div key={dateLabel} className="mb-8">
              <h3 className="py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                {dateLabel}
              </h3>
              <div className="space-y-2">
                {groupedTransactions[dateLabel].map((tx: Transaction) => (
                  <TransactionItem 
                    key={tx.id} 
                    tx={tx} 
                    assets={assets} 
                    language={language} 
                    formatPrice={formatPrice} 
                    onClick={setSelectedTx} 
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transaction Details Modal - Redesigned to match Screenshot 1:1 */}
      {selectedTx && (
        <div className="fixed inset-0 z-[1000] bg-white dark:bg-black animate-ios-slide-in flex flex-col">
          {/* Header */}
          <header className="px-4 pt-safe pb-4 flex items-center justify-between bg-white dark:bg-black z-10">
            <button 
              onClick={() => setSelectedTx(null)} 
              className="p-2 text-zinc-800 dark:text-white hover:opacity-60 transition-opacity"
            >
              <ChevronLeft size={28} strokeWidth={2} />
            </button>
            <h2 className="text-[17px] font-bold tracking-tight">
              {selectedTx.type === 'send' ? (language === 'ru' ? 'Отправка' : 'Sending') : (language === 'ru' ? 'Получение' : 'Receiving')} {getSymbol(selectedTx.assetId)}
            </h2>
            <button className="p-2 text-zinc-800 dark:text-white hover:opacity-60 transition-opacity">
              <Share size={24} strokeWidth={1.5} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto bg-[#F9FAFB] dark:bg-zinc-950 px-5 pt-8 no-scrollbar pb-12">
            {/* Amount Section */}
            <div className="flex flex-col items-center mb-10">
              {/* Detailed success indicator above amount */}
              <div className="mb-6 flex flex-col items-center">
                 <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border-4 border-green-500/20 shadow-lg shadow-green-500/5 animate-scale-in">
                    <CheckCircle2 size={40} className="text-green-500" strokeWidth={2.5} fill="currentColor" fillOpacity={0.1} />
                 </div>
              </div>

              <div className="relative">
                <h1 className={`text-[36px] font-extrabold tracking-tight text-center leading-none ${selectedTx.type === 'receive' ? 'text-green-500' : 'text-black dark:text-white'}`}>
                  {selectedTx.type === 'send' ? '-' : '+'}{formatValue(selectedTx.amount)} {getSymbol(selectedTx.assetId)}
                </h1>
              </div>
              <p className="text-[#8E8E93] dark:text-zinc-500 font-bold text-lg mt-2">
                {formatPrice(selectedTx.amount * (assets.find(a => a.id === selectedTx.assetId)?.priceUsd || 0))}
              </p>
            </div>

            {/* Details Card */}
            <div className="bg-white dark:bg-dark-surface rounded-[24px] overflow-hidden border border-zinc-100 dark:border-dark-border shadow-sm mb-4">
              <div className="p-5 space-y-5">
                {/* Date */}
                <div className="flex justify-between items-center text-[15px] font-bold">
                  <span className="text-[#8E8E93] dark:text-zinc-500">{language === 'ru' ? 'Дата' : 'Date'}</span>
                  <span className="text-black dark:text-white">
                    {new Date(selectedTx.timestamp).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })}
                  </span>
                </div>

                {/* Status */}
                <div className="flex justify-between items-center text-[15px] font-bold border-t border-zinc-50 dark:border-zinc-900 pt-5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#8E8E93] dark:text-zinc-500">{language === 'ru' ? 'Статус' : 'Status'}</span>
                    <Info size={16} className="text-[#0500FF] fill-[#0500FF]/10" />
                  </div>
                  <div className="flex items-center space-x-1.5 text-black dark:text-white">
                     <span>{language === 'ru' ? 'Выполнено' : 'Success'}</span>
                     <CheckCircle2 size={16} className="text-green-500" fill="currentColor" fillOpacity={0.1} />
                  </div>
                </div>

                {/* Recipient / From */}
                <div className="flex justify-between items-start text-[15px] font-bold border-t border-zinc-50 dark:border-zinc-900 pt-5">
                  <span className="text-[#8E8E93] dark:text-zinc-500 mt-0.5">
                    {selectedTx.type === 'send' ? (language === 'ru' ? 'Получатель' : 'Recipient') : (language === 'ru' ? 'Отправитель' : 'Sender')}
                  </span>
                  <div className="text-right pl-10">
                    <p className="text-black dark:text-white font-mono text-[14px] break-all leading-tight">
                      {selectedTx.address || '0x' + Math.random().toString(16).slice(2, 42)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Card */}
            <div className="bg-white dark:bg-dark-surface rounded-[24px] overflow-hidden border border-zinc-100 dark:border-dark-border shadow-sm mb-10">
              <div className="p-5 flex justify-between items-center text-[15px] font-bold">
                <div className="flex items-center space-x-2">
                  <span className="text-[#8E8E93] dark:text-zinc-500">{language === 'ru' ? 'Комиссия сети' : 'Network fee'}</span>
                  <Info size={16} className="text-[#0500FF] fill-[#0500FF]/10" />
                </div>
                <span className="text-black dark:text-white">
                   {selectedTx.networkFee || `0 TRX (${formatPrice(0)})`}
                </span>
              </div>
            </div>

            {/* Explorer Button */}
            <button className="w-full py-4.5 bg-white dark:bg-dark-surface border border-zinc-100 dark:border-dark-border rounded-[20px] text-[#0500FF] font-bold text-[16px] btn-press transition-all hover:bg-zinc-50">
              {language === 'ru' ? 'Просмотр в обозревателе блоков' : 'View in block explorer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;

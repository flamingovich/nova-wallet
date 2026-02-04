
import React, { useState, useEffect } from 'react';
import { Asset, Transaction, Language, View } from '../types';
import { ChevronLeft, ArrowUpRight, Plus, Repeat, Info, X, ExternalLink, Check, ArrowDownLeft, Share, CheckCircle2 } from 'lucide-react';
import { TransactionItem } from './HistoryView';

interface Props {
  asset: Asset | undefined;
  transactions: Transaction[];
  onBack: () => void;
  onAction: (view: View) => void;
  formatPrice: (usd: number) => string;
  t: any;
  language: Language;
  allAssets?: Asset[];
}

const formatVal = (val: number) => {
  return val.toLocaleString('ru-RU', { maximumFractionDigits: 6 });
};

const AssetDetailView: React.FC<Props> = ({ asset, transactions = [], onBack, onAction, formatPrice, t, language, allAssets = [] }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!asset) onBack();
  }, [asset, onBack]);

  if (!asset) return <div className="h-full bg-white dark:bg-dark-bg" />;

  const price = asset?.priceUsd || 0;
  const priceChange = asset?.change24h || 0;

  const getSymbol = (id: string) => allAssets.find(a => a.id === id)?.symbol || '';

  return (
    <div className="h-full bg-white dark:bg-black text-black dark:text-white flex flex-col animate-ios-slide-in relative transition-colors duration-300">
      {/* Header */}
      <div className="px-5 pt-safe pb-4 flex items-center justify-between shrink-0 mt-2">
        <button onClick={onBack} className="p-2.5 bg-zinc-50 dark:bg-dark-surface rounded-full flex items-center justify-center btn-press">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h2 className="text-[18px] font-bold">{asset?.name}</h2>
        <button className="p-2.5 bg-zinc-50 dark:bg-dark-surface rounded-full">
          <Info size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center py-10 px-6">
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center bg-zinc-50 dark:bg-dark-surface p-0 mb-6">
            <img src={asset?.logoUrl} alt="" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="text-[36px] font-extrabold tracking-tight mb-2 text-center leading-none">
            {formatVal(asset.balance)} {asset?.symbol}
          </h1>
          <p className="text-[#8E8E93] dark:text-zinc-500 font-bold text-lg">≈ {formatPrice(asset.balance * price)}</p>
          <div className={`mt-4 px-3.5 py-1 rounded-full text-[13px] font-extrabold ${priceChange >= 0 ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
        </div>

        <div className="flex justify-center space-x-8 px-6 mb-12">
          {[
            { id: 'send', label: t.send, icon: <ArrowUpRight size={28} />, bg: 'bg-[#0500FF] text-white' },
            { id: 'receive', label: t.receive, icon: <Plus size={28} />, bg: 'bg-zinc-50 dark:bg-dark-surface text-black dark:text-white' },
            { id: 'swap', label: t.swap, icon: <Repeat size={28} />, bg: 'bg-zinc-50 dark:bg-dark-surface text-black dark:text-white' }
          ].map((action) => (
            <div key={action.id} className="flex flex-col items-center space-y-2">
              <button onClick={() => onAction(action.id as View)} className={`w-[64px] h-[64px] ${action.bg} rounded-full flex items-center justify-center btn-press shadow-sm`}>
                {action.icon}
              </button>
              <span className="text-[13px] font-bold text-[#8E8E93] dark:text-zinc-500 lowercase tracking-tight">{action.label}</span>
            </div>
          ))}
        </div>

        <div className="px-5 pb-20">
          <h3 className="text-[#8E8E93] dark:text-zinc-500 text-[12px] font-bold uppercase tracking-widest mb-4">
            {t.history}
          </h3>
          <div className="space-y-1">
            {transactions.length > 0 ? (
              transactions.map(tx => (
                <TransactionItem 
                  key={tx.id} 
                  tx={tx} 
                  assets={allAssets} 
                  language={language} 
                  formatPrice={formatPrice} 
                  onClick={setSelectedTx} 
                />
              ))
            ) : (
              <div className="py-12 text-center opacity-40">
                <p className="font-bold text-sm">Нет транзакций</p>
              </div>
            )}
          </div>
        </div>
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
                  {selectedTx.type === 'send' ? '-' : '+'}{formatVal(selectedTx.amount)} {getSymbol(selectedTx.assetId)}
                </h1>
              </div>
              <p className="text-[#8E8E93] dark:text-zinc-500 font-bold text-lg mt-2">
                {formatPrice(selectedTx.amount * (allAssets.find(a => a.id === selectedTx.assetId)?.priceUsd || 0))}
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

export default AssetDetailView;


import React, { useState, useEffect } from 'react';
import { AppState, AIAnalysis } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import Icons from '../components/Icons';

interface AIAssistantProps {
  state: AppState;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ state }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // Для анализа Gemini передаем суммарный баланс в RUB для простоты примера
  const totalInRub = state.cards.reduce((acc, c) => acc + (c.currency === 'RUB' ? c.balance : c.balance * 90), 0);

  const fetchAnalysis = async () => {
    setLoading(true);
    const data = await getFinancialAdvice(totalInRub, state.transactions);
    setAnalysis(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 text-slate-800">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Icons name="nova" className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Nova Intelligence</h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">Financial AI v3.0</p>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-8 space-y-6 relative overflow-hidden border border-slate-100 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 blur-3xl rounded-full"></div>
        
        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Анализ в реальном времени</span>
            </div>
            {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
        </div>

        {loading ? (
          <div className="space-y-6 py-4">
            <div className="h-4 bg-slate-50 rounded-full w-4/5 animate-pulse"></div>
            <div className="h-4 bg-slate-50 rounded-full w-3/4 animate-pulse"></div>
            <div className="grid grid-cols-1 gap-3 pt-2">
              <div className="h-14 bg-slate-50 rounded-3xl w-full animate-pulse"></div>
              <div className="h-14 bg-slate-50 rounded-3xl w-full animate-pulse"></div>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            <p className="text-[15px] leading-relaxed text-slate-600 font-medium italic">
              «{analysis.summary}»
            </p>
            
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Стратегические советы</h4>
              <div className="space-y-2.5">
                {analysis.tips.map((tip, i) => (
                  <div key={i} className="flex gap-4 bg-slate-50 rounded-[28px] p-5 border border-slate-100 hover:border-blue-100 transition-all">
                    <div className="w-7 h-7 min-w-[28px] rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[11px] font-black">
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-snug flex-1">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-400 mb-4 text-sm">Соединение с Nova Core потеряно.</p>
            <button onClick={fetchAnalysis} className="text-blue-500 font-bold uppercase text-[10px] tracking-widest px-8 py-4 bg-blue-50 rounded-full">Переподключить</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm space-y-1">
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Рост активов</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-emerald-600">+12.4%</span>
            </div>
        </div>
        <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm space-y-1">
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Риск-профиль</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-blue-600">Стабильный</span>
            </div>
        </div>
      </div>

      <button 
        onClick={fetchAnalysis}
        disabled={loading}
        className="w-full bg-slate-900 text-white rounded-[24px] py-6 font-extrabold text-sm active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-3"
      >
        <Icons name="nova" className="w-4 h-4" />
        <span>Обновить финансовый прогноз</span>
      </button>
    </div>
  );
};

export default AIAssistant;

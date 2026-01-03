
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Icons from './Icons';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-slate-900 selection:bg-blue-100">
      {/* Safe Area Top */}
      <div className="h-[env(safe-area-inset-top,20px)] w-full bg-transparent sticky top-0 z-[60]"></div>

      <main 
        className="flex-1 px-5 pb-32 pt-2 max-w-2xl mx-auto w-full relative"
      >
        {/* Анимации теперь управляются внутри страниц, чтобы не ломать контекст наложения модалок */}
        {children}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-5 right-5 z-[500] max-w-lg mx-auto">
        <div className="liquid-glass rounded-[32px] px-8 h-18 flex items-center justify-between shadow-2xl border border-white/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/20 to-transparent pointer-events-none"></div>
          
          <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 active:scale-90 relative group py-3 ${isActive ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
            <Icons name="home" className="w-5 h-5" />
            <span className="text-[8px] font-black tracking-widest uppercase">Главная</span>
            <div className={`absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full transition-all duration-300 ${location.pathname === '/' ? 'opacity-100' : 'opacity-0 scale-0'}`}></div>
          </NavLink>
          
          <NavLink to="/transfers" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 active:scale-90 relative group py-3 ${isActive ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
            <Icons name="send" className="w-5 h-5" />
            <span className="text-[8px] font-black tracking-widest uppercase">Платежи</span>
            <div className={`absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full transition-all duration-300 ${location.pathname === '/transfers' ? 'opacity-100' : 'opacity-0 scale-0'}`}></div>
          </NavLink>
          
          <NavLink to="/exchange" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 active:scale-90 relative group py-3 ${isActive ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
            <Icons name="swap" className="w-5 h-5" />
            <span className="text-[8px] font-black tracking-widest uppercase">Обмен</span>
            <div className={`absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full transition-all duration-300 ${location.pathname === '/exchange' ? 'opacity-100' : 'opacity-0 scale-0'}`}></div>
          </NavLink>

          <NavLink to="/history" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 active:scale-90 relative group py-3 ${isActive ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
            <Icons name="bank" className="w-5 h-5" />
            <span className="text-[8px] font-black tracking-widest uppercase">Счета</span>
            <div className={`absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full transition-all duration-300 ${location.pathname === '/history' ? 'opacity-100' : 'opacity-0 scale-0'}`}></div>
          </NavLink>
        </div>
      </nav>
      
      {/* Safe Area Bottom */}
      <div className="h-[env(safe-area-inset-bottom,12px)] w-full bg-transparent"></div>
    </div>
  );
};

export default Layout;

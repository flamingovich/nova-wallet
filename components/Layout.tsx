
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
        className="flex-1 px-4 pb-32 pt-2 max-w-2xl mx-auto w-full relative"
      >
        {children}
      </main>

      {/* Navigation - Nova Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-[500] bg-white/80 backdrop-blur-xl border-t border-slate-100 px-2 pb-[env(safe-area-inset-bottom,12px)] pt-2">
        <div className="max-w-lg mx-auto flex items-center justify-between h-14">
          
          <NavLink to="/transfers" className={({ isActive }) => `flex-1 flex flex-col items-center gap-0.5 transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            <Icons name="send" className="w-6 h-6" />
            <span className="text-[9px] font-bold">Платежи</span>
          </NavLink>

          <NavLink to="/history" className={({ isActive }) => `flex-1 flex flex-col items-center gap-0.5 transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            <Icons name="clock" className="w-6 h-6" />
            <span className="text-[9px] font-bold">История</span>
          </NavLink>
          
          <NavLink to="/" className={({ isActive }) => `flex-1 flex flex-col items-center gap-0.5 transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 ${isActive ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-400'}`}>
                  <span className="font-black text-lg">N</span>
                </div>
                <span className="text-[9px] font-bold">Главная</span>
              </>
            )}
          </NavLink>
          
          <NavLink to="/exchange" className={({ isActive }) => `flex-1 flex flex-col items-center gap-0.5 transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
            <Icons name="swap" className="w-6 h-6" />
            <span className="text-[9px] font-bold">Обмен</span>
          </NavLink>

          <div className="flex-1 flex flex-col items-center gap-0.5 text-slate-300 cursor-not-allowed">
            <Icons name="chat" className="w-6 h-6" />
            <span className="text-[9px] font-bold">Чат</span>
          </div>

        </div>
      </nav>
      
      {/* Safe Area Bottom Spacer */}
      <div className="h-[env(safe-area-inset-bottom,12px)] w-full bg-transparent"></div>
    </div>
  );
};

export default Layout;

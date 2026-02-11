
import React from 'react';
import { ViewState } from '../types';
import { User } from '../services/firebase';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard', icon: 'fa-house', label: 'Home' },
    { id: 'create', icon: 'fa-wand-magic-sparkles', label: 'Design Studio' },
    { id: 'saved', icon: 'fa-box-archive', label: 'Academic Archive' }
  ];

  return (
    <aside className="w-72 sidebar-gradient text-white flex-shrink-0 flex flex-col hidden md:flex relative z-50">
      <div className="p-10">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('dashboard')}>
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
            <i className="fa-solid fa-map text-white text-xl"></i>
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter block leading-none">EduMap</span>
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">Curriculum AI</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-6 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative group ${
              currentView === item.id 
                ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-6 text-center text-base transition-colors ${currentView === item.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}></i>
            <span className="font-bold text-sm tracking-tight">{item.label}</span>
            {currentView === item.id && (
              <div className="absolute left-0 w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-fuchsia-500 rounded-r-full"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-8">
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600/40 to-fuchsia-600/40 rounded-xl flex items-center justify-center text-white font-black text-sm border border-white/20">
               {user.displayName?.[0] || 'E'}
            </div>
            <div className="overflow-hidden">
               <p className="text-sm font-black text-white truncate leading-tight">{user.displayName || 'Educator'}</p>
               <p className="text-[10px] text-slate-500 truncate font-bold uppercase tracking-widest">{user.email?.split('@')[0]}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-3.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all border border-white/5 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-power-off"></i>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;


import React from 'react';
import { Curriculum } from '../types';
import { User } from '../services/firebase';

interface DashboardProps {
  user: User;
  savedCurricula: Curriculum[];
  onSelect: (c: Curriculum) => void;
  onCreateNew: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, savedCurricula, onSelect, onCreateNew }) => {
  const stats = [
    { label: 'Active Curricula', value: savedCurricula.length, icon: 'fa-book-sparkles', color: 'text-indigo-600 bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Library Size', value: `${(JSON.stringify(savedCurricula).length / 1024).toFixed(1)} KB`, icon: 'fa-vault', color: 'text-fuchsia-600 bg-fuchsia-50', border: 'border-fuchsia-100' },
    { label: 'Avg Alignment', value: savedCurricula.length > 0 ? (savedCurricula.reduce((a, b) => a + b.industryAlignment.relevanceScore, 0) / savedCurricula.length).toFixed(0) + '%' : '0%', icon: 'fa-chart-line', color: 'text-cyan-600 bg-cyan-50', border: 'border-cyan-100' }
  ];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-500">
      {/* Vibrant Hero Section */}
      <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-20 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-indigo-50/50 via-fuchsia-50/20 to-transparent -skew-x-12 translate-x-20"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
            AI-Powered Intelligence
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Design smarter curricula with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">EduMap</span>.
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-lg">
            Generate comprehensive, industry-aligned course frameworks in seconds using world-class AI models.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onCreateNew}
              className="px-10 py-5 btn-primary rounded-2xl font-bold text-sm flex items-center gap-3"
            >
              <i className="fa-solid fa-wand-sparkles"></i>
              Create New Project
            </button>
            <div className="hidden md:flex items-center gap-4 px-6 text-slate-400 font-medium">
               <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">J</div>
                  <div className="w-10 h-10 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-400">A</div>
                  <div className="w-10 h-10 rounded-full border-4 border-white bg-fuchsia-100 flex items-center justify-center text-xs font-bold text-fuchsia-400">K</div>
               </div>
               <span className="text-sm">Trusted by 2k+ educators</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`neat-card p-8 flex items-center gap-6 border-b-4 ${stat.border.replace('100', '400')}`}>
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Library */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Recent Projects</h2>
            <p className="text-sm text-slate-500 font-medium">Your forged academic frameworks</p>
          </div>
          {savedCurricula.length > 0 && (
            <button onClick={onCreateNew} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">View All</button>
          )}
        </div>

        {savedCurricula.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 border-dashed p-20 text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-200">
              <i className="fa-solid fa-map-location-dot text-4xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Your library is empty</h3>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto">Start by forging your first AI-powered academic framework tailored to your requirements.</p>
            <button onClick={onCreateNew} className="btn-primary px-8 py-4 rounded-xl font-bold text-sm">Forge your first course</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedCurricula.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelect(c)}
                className="neat-card group cursor-pointer flex flex-col h-full overflow-hidden"
              >
                <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg uppercase tracking-wider border border-indigo-100">
                      {c.difficulty}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                    {c.courseTitle}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-8 font-medium italic leading-relaxed">
                    {c.description}
                  </p>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-2"><i className="fa-solid fa-layer-group text-indigo-400"></i> {c.modules.length} Modules</span>
                    <span className="flex items-center gap-2"><i className="fa-solid fa-clock text-fuchsia-400"></i> {c.totalDuration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;

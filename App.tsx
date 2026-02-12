
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, Curriculum, CurriculumFormData } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CurriculumForm from './components/CurriculumForm';
import CurriculumView from './components/CurriculumView';
import AuthPortal from './components/AuthPortal';
import ForgeAssistant from './components/ForgeAssistant';
import { generateCurriculum } from './services/geminiService';
import { onAuthStateChanged, User, signOut } from './services/firebase';

const LOADING_TASKS = [
  { main: "Analyzing Requirements", subs: ["Parsing metadata", "Mapping subject", "Setting goals"] },
  { main: "Synthesizing Modules", subs: ["Architecting syllabus", "Drafting objectives", "Listing topics"] },
  { main: "Curating Resources", subs: ["Selecting bibliography", "Finding media", "Designing labs"] },
  { main: "Finalizing", subs: ["Polishing design", "Checking alignment", "Final preview"] }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<ViewState>('dashboard');
  const [loading, setLoading] = useState(false);
  const [taskIndex, setTaskIndex] = useState(0);
  const [subTaskIndex, setSubTaskIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentCurriculum, setCurrentCurriculum] = useState<Curriculum | null>(null);
  const [savedCurricula, setSavedCurricula] = useState<Curriculum[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterLevel, setFilterLevel] = useState('All');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) setView('dashboard');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const storageKey = `edumap_library_${user.uid}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try { 
          setSavedCurricula(JSON.parse(saved)); 
        } catch (e) { 
          setSavedCurricula([]);
        }
      } else {
        setSavedCurricula([]);
      }
    } else {
      setSavedCurricula([]);
    }
  }, [user]);

  // Optimization: Sped up loading visual logic to match AI performance
  useEffect(() => {
    let mainInterval: number, subInterval: number, progressInterval: number;
    if (loading) {
      setLoadingProgress(0); setTaskIndex(0); setSubTaskIndex(0);
      mainInterval = window.setInterval(() => setTaskIndex(prev => (prev + 1) % LOADING_TASKS.length), 1200);
      subInterval = window.setInterval(() => setSubTaskIndex(prev => (prev + 1) % 3), 400);
      progressInterval = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 99) return Math.min(99, prev + (prev > 90 ? 0.2 : 3.0));
          return prev;
        });
      }, 80);
    }
    return () => { clearInterval(mainInterval); clearInterval(subInterval); clearInterval(progressInterval); };
  }, [loading]);

  const handleGenerate = async (formData: CurriculumFormData) => {
    setLoading(true); setError(null);
    try {
      const generated = await generateCurriculum(formData);
      setCurrentCurriculum(generated); setView('view');
    } catch (err) {
      setError("EduMap generation failed. Please check connection and try again.");
    } finally { setLoading(false); }
  };

  const handleSave = (c: Curriculum) => {
    if (!user) return;
    const isAlreadySaved = savedCurricula.some(item => item.id === c.id);
    if (!isAlreadySaved) {
      const updated = [c, ...savedCurricula];
      setSavedCurricula(updated);
      localStorage.setItem(`edumap_library_${user.uid}`, JSON.stringify(updated));
    }
    setView('saved');
  };

  const handleUpdate = (updatedC: Curriculum) => {
    if (!user) return;
    const updatedLibrary = savedCurricula.map(item => item.id === updatedC.id ? updatedC : item);
    setSavedCurricula(updatedLibrary);
    localStorage.setItem(`edumap_library_${user.uid}`, JSON.stringify(updatedLibrary));
    setCurrentCurriculum(updatedC);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const filteredCurricula = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return savedCurricula.filter(c => {
      const titleMatch = !q || c.courseTitle.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      const subjectMatch = filterSubject === 'All' || c.courseTitle.toLowerCase().includes(filterSubject.toLowerCase());
      const levelMatch = filterLevel === 'All' || c.targetAudience === filterLevel;
      return titleMatch && subjectMatch && levelMatch;
    });
  }, [savedCurricula, searchQuery, filterSubject, filterLevel]);

  const subjects = useMemo(() => ['All', ...Array.from(new Set(savedCurricula.map(c => c.courseTitle.split(' ')[0])))].slice(0, 8), [savedCurricula]);
  const levels = ['All', 'High School', 'Undergraduate', 'Graduate', 'Professional/Corporate Training'];

  if (authLoading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) {
    return <AuthPortal />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <Sidebar currentView={view} setView={(v) => { setError(null); setView(v); }} user={user} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden glass-dark text-white p-5 flex items-center justify-between z-50">
          <span className="font-black text-lg text-white">EduMap</span>
          <button onClick={() => setView('dashboard')}><i className="fa-solid fa-bars"></i></button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-10 md:px-16 relative">
          {loading && (
            <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center space-y-8 border border-slate-200">
                <div className="mx-auto w-20 h-20 rounded-full border-t-4 border-indigo-600 animate-spin flex items-center justify-center">
                  <i className="fa-solid fa-map text-3xl text-indigo-600"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">{LOADING_TASKS[taskIndex].main}</h3>
                  <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{LOADING_TASKS[taskIndex].subs[subTaskIndex]}</p>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-10 bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
              <i className="fa-solid fa-triangle-exclamation"></i><p className="font-bold">{error}</p>
            </div>
          )}

          {view === 'dashboard' && <Dashboard user={user} savedCurricula={savedCurricula} onSelect={(c) => { setCurrentCurriculum(c); setView('view'); }} onCreateNew={() => setView('create')} />}
          {view === 'create' && <CurriculumForm onGenerate={handleGenerate} isLoading={loading} />}
          {view === 'view' && currentCurriculum && (
            <CurriculumView curriculum={currentCurriculum} isSaved={savedCurricula.some(s => s.id === currentCurriculum.id)} onSave={handleSave} onUpdate={handleUpdate} />
          )}

          {view === 'saved' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              {/* Header Section */}
              <header className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-3xl p-10 md:p-14 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-3">
                    <h1 className="text-5xl font-black tracking-tight">Academic Archive</h1>
                    <p className="text-slate-300 font-bold text-lg">Browse, refine, and manage your complete curriculum library</p>
                    <div className="flex gap-4 pt-2">
                      <span className="flex items-center gap-2 text-sm font-bold text-indigo-200"><i className="fa-solid fa-book text-indigo-400"></i>{savedCurricula.length} Saved</span>
                      <span className="flex items-center gap-2 text-sm font-bold text-purple-200"><i className="fa-solid fa-chart-line text-purple-400"></i>{savedCurricula.length > 0 ? (savedCurricula.reduce((a, b) => a + b.modules.length, 0)) : 0} Total Modules</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* Search & Filters */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[240px] relative">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="text" 
                      placeholder="Search by course title, subject, or keywords..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="pl-12 pr-6 py-3.5 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 bg-white shadow-sm hover:shadow-md transition-all"
                    />
                  </div>
                  <select 
                    value={filterSubject} 
                    onChange={(e) => setFilterSubject(e.target.value)} 
                    className="px-6 py-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm hover:shadow-md transition-all"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select 
                    value={filterLevel} 
                    onChange={(e) => setFilterLevel(e.target.value)} 
                    className="px-6 py-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm hover:shadow-md transition-all"
                  >
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Curricula Grid or Empty State */}
              {filteredCurricula.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <i className="fa-solid fa-inbox text-5xl text-indigo-400"></i>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">No curricula found</h3>
                  <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">Try adjusting your filters or create a new curriculum to get started.</p>
                  <button onClick={() => setView('create')} className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    <i className="fa-solid fa-plus mr-2"></i>Create New Course
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCurricula.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => { setCurrentCurriculum(c); setView('view'); }} 
                      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col h-full relative"
                    >
                      {/* Top Accent Bar */}
                      <div className="h-3 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

                      {/* Card Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        {/* Header with Badge and Rating */}
                        <div className="flex justify-between items-start gap-3 mb-4">
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg uppercase border border-indigo-100 tracking-wider">
                            {c.targetAudience}
                          </span>
                          {c.rating && (
                            <div className="flex items-center gap-1 text-amber-500 font-black text-xs bg-amber-50 px-2 py-1 rounded-lg">
                              <i className="fa-solid fa-star"></i> {c.rating}
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {c.courseTitle}
                        </h3>

                        {/* Description */}
                        <p className="text-slate-500 text-sm line-clamp-2 mb-4 font-medium italic leading-relaxed flex-1">
                          {c.description}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-t border-slate-100 pt-4">
                          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-lg">
                            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-wider mb-1">Modules</p>
                            <p className="text-lg font-black text-indigo-700">{c.modules.length}</p>
                          </div>
                          <div className="bg-gradient-to-br from-indigo-50/80 to-purple-100 p-3 rounded-lg">
                            <p className="text-[10px] text-purple-600 font-black uppercase tracking-wider mb-1">Duration</p>
                            <p className="text-lg font-black text-purple-700">{c.totalDuration}</p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
                            <p className="text-[10px] text-purple-600 font-black uppercase tracking-wider mb-1">Difficulty</p>
                            <p className="text-sm font-black text-purple-700">{c.difficulty}</p>
                          </div>
                          <div className="bg-gradient-to-br from-indigo-100 to-purple-50 p-3 rounded-lg">
                            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-wider mb-1">Relevance</p>
                            <p className="text-lg font-black text-indigo-700">{c.industryAlignment.relevanceScore}%</p>
                          </div>
                        </div>

                        {/* Bottom Info */}
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                          <span className="text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                            View <i className="fa-solid fa-arrow-right"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Global AI Assistant */}
      <ForgeAssistant context={view} />
    </div>
  );
};

export default App;

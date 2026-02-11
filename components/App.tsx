
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, Curriculum, CurriculumFormData } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CurriculumForm from './components/CurriculumForm';
import CurriculumView from './components/CurriculumView';
import { generateCurriculum } from './services/geminiService';

const LOADING_TASKS = [
  { main: "Analyzing Requirements", subs: ["Parsing course title", "Mapping subject", "Setting goals"] },
  { main: "Synthesizing Modules", subs: ["Creating syllabus", "Drafting objectives", "Listing topics"] },
  { main: "Curating Resources", subs: ["Selecting textbooks", "Finding online sources", "Designing projects"] },
  { main: "Finalizing Forge", subs: ["Polishing document", "Checking alignment", "Preparing preview"] }
];

const App: React.FC = () => {
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
    const saved = localStorage.getItem('curricuforge_library');
    if (saved) {
      try { setSavedCurricula(JSON.parse(saved)); } catch (e) { console.error("Library parse failed"); }
    }
  }, []);

  useEffect(() => {
    let mainInterval: number, subInterval: number, progressInterval: number;
    if (loading) {
      setLoadingProgress(0); setTaskIndex(0); setSubTaskIndex(0);
      mainInterval = window.setInterval(() => setTaskIndex(prev => (prev + 1) % LOADING_TASKS.length), 2500);
      subInterval = window.setInterval(() => setSubTaskIndex(prev => (prev + 1) % 3), 800);
      progressInterval = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 98) return Math.min(98, prev + (prev > 80 ? 0.2 : 1.5));
          return prev;
        });
      }, 150);
    }
    return () => { clearInterval(mainInterval); clearInterval(subInterval); clearInterval(progressInterval); };
  }, [loading]);

  const handleGenerate = async (formData: CurriculumFormData) => {
    setLoading(true); setError(null);
    try {
      const generated = await generateCurriculum(formData);
      setCurrentCurriculum(generated); setView('view');
    } catch (err) {
      setError("Forge failed. Please check connection and try again.");
    } finally { setLoading(false); }
  };

  const handleSave = (c: Curriculum) => {
    const isAlreadySaved = savedCurricula.some(item => item.id === c.id);
    if (!isAlreadySaved) {
      const updated = [c, ...savedCurricula];
      setSavedCurricula(updated);
      localStorage.setItem('curricuforge_library', JSON.stringify(updated));
    }
    setView('saved');
  };

  const handleUpdate = (updatedC: Curriculum) => {
    const updatedLibrary = savedCurricula.map(item => item.id === updatedC.id ? updatedC : item);
    setSavedCurricula(updatedLibrary);
    localStorage.setItem('curricuforge_library', JSON.stringify(updatedLibrary));
    setCurrentCurriculum(updatedC);
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

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <Sidebar currentView={view} setView={(v) => { setError(null); setView(v); }} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden glass-dark text-white p-5 flex items-center justify-between z-50">
          <span className="font-black text-lg">CurricuForge</span>
          <button onClick={() => setView('dashboard')}><i className="fa-solid fa-bars"></i></button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-10 md:px-16 relative">
          {loading && (
            <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center space-y-8 border border-slate-100">
                <div className="mx-auto w-24 h-24 rounded-full border-t-4 border-indigo-600 animate-spin flex items-center justify-center"><i className="fa-solid fa-wand-magic-sparkles text-3xl text-indigo-600"></i></div>
                <div className="space-y-2"><h3 className="text-2xl font-black">{LOADING_TASKS[taskIndex].main}</h3><p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{LOADING_TASKS[taskIndex].subs[subTaskIndex]}</p></div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${loadingProgress}%` }} /></div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-10 bg-rose-50 border border-rose-100 text-rose-700 px-6 py-4 rounded-2xl flex items-center gap-3"><i className="fa-solid fa-triangle-exclamation"></i><p className="font-bold">{error}</p></div>
          )}

          {view === 'dashboard' && <Dashboard savedCurricula={savedCurricula} onSelect={(c) => { setCurrentCurriculum(c); setView('view'); }} onCreateNew={() => setView('create')} />}
          {view === 'create' && <CurriculumForm onGenerate={handleGenerate} isLoading={loading} />}
          {view === 'view' && currentCurriculum && (
            <CurriculumView curriculum={currentCurriculum} isSaved={savedCurricula.some(s => s.id === currentCurriculum.id)} onSave={handleSave} onUpdate={handleUpdate} />
          )}

          {view === 'saved' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div><h1 className="text-4xl font-black">Knowledge Vault</h1><p className="text-slate-500 font-medium">Manage and refine your saved academic frameworks.</p></div>
                <div className="flex flex-wrap gap-4">
                  <div className="relative flex-1 min-w-[200px]"><i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i><input type="text" placeholder="Search title or content..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 pr-6 py-4 rounded-2xl border border-slate-200 w-full focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold" /></div>
                  <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="px-6 py-4 rounded-2xl border border-slate-200 bg-white font-bold">{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="px-6 py-4 rounded-2xl border border-slate-200 bg-white font-bold">{levels.map(l => <option key={l} value={l}>{l}</option>)}</select>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCurricula.map((c) => (
                  <div key={c.id} onClick={() => { setCurrentCurriculum(c); setView('view'); }} className="group bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden">
                    {c.rating && <div className="absolute top-8 right-8 flex items-center gap-1 text-indigo-600 font-black text-xs"><i className="fa-solid fa-star"></i> {c.rating}</div>}
                    <div className="flex justify-between mb-4"><span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase">{c.targetAudience}</span></div>
                    <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-indigo-600">{c.courseTitle}</h3>
                    <p className="text-slate-500 text-xs line-clamp-3 mb-6 font-medium flex-1">{c.description}</p>
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400">
                      <span><i className="fa-solid fa-layer-group mr-1.5"></i>{c.modules.length} Modules</span>
                      {c.industryAlignment.relevanceScore && <span>{c.industryAlignment.relevanceScore}% Fit</span>}
                    </div>
                  </div>
                ))}
                {filteredCurricula.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 font-bold">No results found matching your criteria.</div>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

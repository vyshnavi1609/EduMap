
import React, { useState, useEffect } from 'react';
import { signIn, signUp } from '../services/firebase';

const SLIDES = [
  { icon: 'fa-brain-circuit', title: 'Cognitive Architecture', desc: 'Synthesize global knowledge into structured syllabi.' },
  { icon: 'fa-graduation-cap', title: 'Industry Alignment', desc: 'Mapping learning outcomes to real-world careers.' },
  { icon: 'fa-microscope', title: 'Scientific Precision', desc: 'Engineered for depth and academic rigor.' },
  { icon: 'fa-atom', title: 'Dynamic Evolution', desc: 'Adapting curricula to the speed of innovation.' }
];

const AuthPortal: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  // High-speed slideshow as requested (1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!name.trim()) throw new Error("Full name required.");
        await signUp(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || "Auth failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Left Pane: Slideshow */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-950 to-slate-950"></div>
        <div className="relative z-10 text-center p-20 space-y-8 animate-in fade-in duration-500">
           <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl">
              <i className={`fa-solid ${SLIDES[slideIndex].icon} text-white text-4xl transition-all duration-300 transform scale-110`}></i>
           </div>
           <div className="space-y-4">
              <h2 className="text-3xl font-black text-white tracking-tight transition-all duration-300">{SLIDES[slideIndex].title}</h2>
              <p className="text-slate-400 text-lg max-w-sm mx-auto font-medium transition-all duration-300">{SLIDES[slideIndex].desc}</p>
           </div>
           <div className="flex justify-center gap-2 pt-10">
              {SLIDES.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${slideIndex === i ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'}`}></div>
              ))}
           </div>
        </div>
        <div className="absolute bottom-10 left-10 text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">EduMap OS v3.1</div>
      </div>

      {/* Right Pane: Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50">
        <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="text-center lg:text-left space-y-2">
            <div className="lg:hidden w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <i className="fa-solid fa-map text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{isLogin ? 'Sign in' : 'Create Account'}</h1>
            <p className="text-sm text-slate-500 font-medium">Empowering educators with AI architecture.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl" placeholder="Dr. John Doe" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl" placeholder="name@domain.com" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl" placeholder="••••••••" />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] font-bold text-center">
                {error}
              </div>
            )}

            <button disabled={loading} className="w-full py-4 bg-slate-950 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-900 active:scale-95 transition-all mt-4">
              {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : isLogin ? 'Enter Workspace' : 'Forge Account'}
            </button>
          </form>

          <div className="text-center pt-6">
            <button onClick={() => setIsLogin(!isLogin)} className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors">
              {isLogin ? "Need a platform? Sign Up" : "Already registered? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;

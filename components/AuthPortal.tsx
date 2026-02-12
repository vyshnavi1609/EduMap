import React, { useState, useEffect } from 'react';
import { signIn, signUp } from '../services/firebase';

const SLIDES = [
  { 
    icon: 'fa-brain-circuit', 
    title: 'Cognitive Architecture', 
    quote: '"Education is the most powerful weapon we can use to change the world." - Nelson Mandela',
    desc: 'Synthesize global knowledge into structured syllabi.',
    gradient: 'from-blue-600 via-purple-600 to-indigo-600',
    bgImage: 'https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bgPosition: 'center 30%'
  },
  { 
    icon: 'fa-graduation-cap', 
    title: 'Industry Alignment', 
    quote: '"The best teachers are those who show you where to look but don\'t tell you what to see." - Alexandra K. Trenfor',
    desc: 'Mapping learning outcomes to real-world careers.',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    bgImage: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bgPosition: 'center 40%'
  },
  { 
    icon: 'fa-microscope', 
    title: 'Scientific Precision', 
    quote: '"Learning is not attainment of knowledge but mastery of skills." - Stephen Covey',
    desc: 'Engineered for depth and academic rigor.',
    gradient: 'from-rose-600 via-pink-600 to-orange-600',
    bgImage: 'https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bgPosition: 'center 35%'
  },
  { 
    icon: 'fa-atom', 
    title: 'Dynamic Evolution', 
    quote: '"The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice." - Unknown',
    desc: 'Adapting curricula to the speed of innovation.',
    gradient: 'from-violet-600 via-fuchsia-600 to-pink-600',
    bgImage: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bgPosition: 'center 45%'
  }
];

// Additional slides with more background images
const EXTENDED_SLIDES = [
  ...SLIDES,
  { 
    icon: 'fa-book-open', 
    title: 'Knowledge Architecture', 
    quote: '"Education is not preparation for life; education is life itself." - John Dewey',
    desc: 'Building comprehensive learning frameworks.',
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    bgImage: 'https://images.pexels.com/photos/290595/pexels-photo-290595.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bgPosition: 'center 50%'
  },
  { 
    icon: 'fa-chart-line', 
    title: 'Progress Analytics', 
    quote: '"The art of teaching is the art of assisting discovery." - Mark Van Doren',
    desc: 'Data-driven insights for continuous improvement.',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
    bgImage: 'https://images.pexels.com/photos/5198239/pexels-photo-5198239.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bgPosition: 'center 55%'
  },
  { 
    icon: 'fa-globe', 
    title: 'Global Perspective', 
    quote: '"Education is the key to unlock the golden door of freedom." - George Washington Carver',
    desc: 'Connecting classrooms across continents.',
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    bgImage: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bgPosition: 'center 60%'
  },
  { 
    icon: 'fa-robot', 
    title: 'AI Integration', 
    quote: '"Technology will not replace great teachers, but technology in the hands of great teachers is transformational." - George Couros',
    desc: 'Intelligent curriculum personalization.',
    gradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
    bgImage: 'https://images.pexels.com/photos/8438918/pexels-photo-8438918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bgPosition: 'center 40%'
  }
];

const AuthPortal: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [useExtendedSlides, setUseExtendedSlides] = useState(true);

  // Choose which slides to use
  const activeSlides = useExtendedSlides ? EXTENDED_SLIDES : SLIDES;

  // Slideshow for inspirational quotes and content
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000); // Changed to 5 seconds for better viewing
    return () => clearInterval(timer);
  }, [activeSlides.length]);

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

  const currentSlide = activeSlides[slideIndex];

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Left Pane: Dynamic Background Images with Content Overlay */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        {/* Dynamic Background Image that changes with each slide */}
        <div 
          key={slideIndex} // This forces re-render for animation
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url('${currentSlide.bgImage}')`,
            backgroundPosition: currentSlide.bgPosition,
            transform: 'scale(1)',
            filter: 'brightness(0.45) contrast(1.15) saturate(1.2)'
          }}
        >
          {/* Animated overlay that changes with slides */}
          <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.gradient} opacity-30 mix-blend-multiply transition-all duration-1000`}></div>
        </div>

        {/* Animated gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
        
        {/* Additional decorative overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)] opacity-20"></div>

        {/* Content */}
        <div className="relative z-10 text-center p-16 space-y-8 max-w-xl">
          {/* Icon with enhanced styling and slide transition */}
          <div 
            className={`w-28 h-28 bg-gradient-to-br ${currentSlide.gradient} rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform transition-all duration-700 hover:scale-105 hover:rotate-3`}
            style={{
              animation: 'fadeInScale 0.6s ease-out'
            }}
          >
            <i className={`fa-solid ${currentSlide.icon} text-white text-5xl drop-shadow-lg`}></i>
          </div>

          {/* Title with fade animation */}
          <div className="space-y-6">
            <h2 
              className="text-4xl font-black text-white tracking-tight drop-shadow-lg"
              style={{
                animation: 'slideInFromBottom 0.7s ease-out'
              }}
            >
              {currentSlide.title}
            </h2>

            {/* Inspirational Quote with glass morphism */}
            <div 
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl transition-all duration-500 hover:bg-white/15"
              style={{
                animation: 'fadeIn 0.8s ease-out'
              }}
            >
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-quote-left text-white/40 text-xl mt-1"></i>
                <div>
                  <p className="text-lg italic text-white/95 font-medium leading-relaxed">
                    {currentSlide.quote}
                  </p>
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-white/70 font-semibold">
                      — {currentSlide.quote.split('-')[1]}
                    </span>
                  </div>
                </div>
                <i className="fa-solid fa-quote-right text-white/40 text-xl mt-1 self-end"></i>
              </div>
            </div>

            {/* Description */}
            <p 
              className="text-slate-200 text-base max-w-sm mx-auto font-medium drop-shadow-md"
              style={{
                animation: 'slideInFromBottom 0.9s ease-out'
              }}
            >
              {currentSlide.desc}
            </p>
          </div>

          {/* Slide indicators with preview thumbnails */}
          <div className="flex justify-center gap-3 pt-4 flex-wrap">
            {activeSlides.map((slide, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className="group relative transition-all duration-300"
                title={slide.title}
              >
                <div
                  className={`transition-all duration-500 rounded-full ${
                    slideIndex === i 
                      ? `w-12 h-2.5 bg-gradient-to-r ${slide.gradient} shadow-lg shadow-white/20` 
                      : 'w-2 h-2 bg-white/30 hover:bg-white/60 hover:w-3'
                  }`}
                />
                {/* Tooltip preview */}
                {slideIndex === i && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-[10px] py-1.5 px-3 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20 backdrop-blur-sm">
                    <i className={`fa-solid ${slide.icon} mr-1 text-[8px]`}></i>
                    {slide.title}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Toggle between slide sets (hidden by default, uncomment if needed) */}
          {/* <button 
            onClick={() => setUseExtendedSlides(!useExtendedSlides)}
            className="text-[10px] text-white/50 hover:text-white/80 font-bold uppercase tracking-wider mt-4 transition-colors"
          >
            {useExtendedSlides ? 'Show Less' : 'Show More'} Slides
          </button> */}
        </div>

        {/* Version info with gradient text */}
        <div className="absolute bottom-8 left-8">
          <span className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-white/80 to-white/60 font-black uppercase tracking-[0.5em]">
            EduMap OS v3.1
          </span>
        </div>

        {/* Bottom gradient light */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        
        {/* Top gradient light */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent"></div>
      </div>

      {/* Right Pane: Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="text-center lg:text-left space-y-3">
            <div className="lg:hidden w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-105 transition-transform">
              <i className="fa-solid fa-map text-white text-xl"></i>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Forge Your Path'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {isLogin 
                ? 'Continue your journey in AI-driven curriculum architecture.' 
                : 'Join educators worldwide in shaping the future of learning.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <i className="fa-regular fa-user text-[10px]"></i>
                  Full Name
                </label>
                <input 
                  required 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                  placeholder="Dr. Sarah Johnson" 
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                <i className="fa-regular fa-envelope text-[10px]"></i>
                Email Address
              </label>
              <input 
                required 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                placeholder="educator@institution.edu" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                <i className="fa-regular fa-lock text-[10px]"></i>
                Password
              </label>
              <input 
                required 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                placeholder="••••••••" 
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-200 rounded-xl text-rose-600 text-[11px] font-bold text-center animate-in shake flex items-center justify-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            <button 
              disabled={loading} 
              className="w-full py-3.5 bg-gradient-to-r from-slate-950 to-slate-800 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:from-slate-900 hover:to-slate-700 active:scale-95 transition-all mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><i className="fa-solid fa-circle-notch animate-spin"></i> Processing...</>
              ) : (
                isLogin ? (
                  <><i className="fa-solid fa-arrow-right-to-bracket"></i> Enter Workspace</>
                ) : (
                  <><i className="fa-solid fa-sparkles"></i> Forge Account</>
                )
              )}
            </button>
          </form>

          <div className="text-center space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 font-medium">
                  {isLogin ? "New to EduMap?" : "Already registered?"}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[12px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 uppercase tracking-widest hover:from-indigo-700 hover:to-purple-700 transition-all hover:scale-105 inline-flex items-center gap-1"
            >
              {isLogin ? (
                <>Create Account <i className="fa-solid fa-arrow-right text-[10px]"></i></>
              ) : (
                <><i className="fa-solid fa-arrow-left text-[10px]"></i> Sign In</>
              )}
            </button>
          </div>

          {/* Institution badge */}
          <div className="text-center pt-4">
            <span className="text-[8px] text-slate-400 font-black uppercase tracking-[0.3em]">
              For Academic Institutions • K-12 & Higher Ed
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInScale {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        input::placeholder {
          color: #94a3b8;
          font-size: 0.875rem;
        }
        
        input:focus {
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AuthPortal;
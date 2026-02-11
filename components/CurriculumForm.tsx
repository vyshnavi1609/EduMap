
import React, { useState, useRef } from 'react';
import { CurriculumFormData } from '../types';

interface CurriculumFormProps {
  onGenerate: (data: CurriculumFormData) => void;
  isLoading: boolean;
}

const CurriculumForm: React.FC<CurriculumFormProps> = ({ onGenerate, isLoading }) => {
  const [formData, setFormData] = useState<CurriculumFormData>({
    title: '',
    subject: '',
    level: 'Undergraduate',
    difficulty: 'Beginner',
    duration: '',
    goals: '',
    industryFocus: '',
    model: 'gemini-3-flash-preview',
    sourceImages: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          sourceImages: [...(prev.sourceImages || []), reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleCamera = async () => {
    if (isCameraActive) {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) { videoRef.current.srcObject = stream; setIsCameraActive(true); }
      } catch (err) { alert("Camera access failed"); }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    setFormData(prev => ({ ...prev, sourceImages: [...(prev.sourceImages || []), canvas.toDataURL('image/jpeg')] }));
    toggleCamera();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg text-white text-2xl">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
           </div>
           <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Forge Curriculum</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Academic Synthesis Engine</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-16 shadow-xl shadow-slate-200/50 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Course Identity</label>
              <input 
                required 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="w-full px-7 py-4 rounded-2xl text-base focus:ring-4 focus:ring-indigo-500/10" 
                placeholder="e.g. Theoretical Astro-Physics" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Domain Space</label>
              <input 
                required 
                name="subject" 
                value={formData.subject} 
                onChange={handleChange} 
                className="w-full px-7 py-4 rounded-2xl text-base focus:ring-4 focus:ring-indigo-500/10" 
                placeholder="e.g. Natural Sciences" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Academic Level</label>
              <select 
                name="level" 
                value={formData.level} 
                onChange={handleChange} 
                className="w-full px-7 py-4 rounded-2xl text-base cursor-pointer hover:border-indigo-300"
              >
                <option>High School</option>
                <option>Undergraduate</option>
                <option>Graduate</option>
                <option>Professional/Corporate Training</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Cognitive Depth</label>
              <select 
                name="difficulty" 
                value={formData.difficulty} 
                onChange={handleChange} 
                className="w-full px-7 py-4 rounded-2xl text-base cursor-pointer hover:border-indigo-300"
              >
                <option value="Beginner">Beginner (Foundational)</option>
                <option value="Intermediate">Intermediate (Practitioner)</option>
                <option value="Advanced">Advanced (Specialist)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pedagogical Mission & Intent</label>
            <textarea 
              required 
              name="goals" 
              value={formData.goals} 
              onChange={handleChange} 
              rows={5} 
              className="w-full px-7 py-6 rounded-[2rem] text-base resize-none leading-relaxed italic border-l-4 border-indigo-500 bg-slate-50/30" 
              placeholder="Define the transformative goals of this educational framework..." 
            />
          </div>

          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row gap-10 items-start">
             <div className="flex-1 space-y-4 w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Visual Knowledge Injection (Optional)</label>
                <div className="flex gap-4">
                   <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:border-indigo-400 transition-all shadow-sm flex items-center justify-center gap-3">
                     <i className="fa-solid fa-cloud-arrow-up text-indigo-500"></i> Upload Media
                   </button>
                   <button type="button" onClick={toggleCamera} className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white hover:border-indigo-400 transition-all shadow-sm flex items-center justify-center gap-3">
                     <i className="fa-solid fa-expand text-fuchsia-500"></i> Scan Asset
                   </button>
                   <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>
                {formData.sourceImages && formData.sourceImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-6">
                    {formData.sourceImages.map((img, i) => (
                      <div key={i} className="w-16 h-16 rounded-2xl border-2 border-indigo-100 overflow-hidden shadow-lg transform rotate-2">
                        <img src={img} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
             </div>
             
             <div className="w-full md:w-80 space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Synthesis Intelligence</label>
                <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                   <select 
                    name="model" 
                    value={formData.model} 
                    onChange={handleChange} 
                    className="w-full bg-transparent border-none text-white font-black text-xs uppercase tracking-[0.2em] outline-none cursor-pointer"
                   >
                    <option value="gemini-3-flash-preview">Gemini 3 Flash (Speed)</option>
                    <option value="gemini-3-pro-preview">Gemini 3 Pro (Precision)</option>
                   </select>
                   <div className="mt-3 flex items-center gap-2 text-[8px] text-indigo-400 font-black uppercase tracking-widest opacity-60">
                      <span className="w-1 h-1 bg-indigo-400 rounded-full animate-ping"></span>
                      Optimized for academic logic
                   </div>
                </div>
             </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full py-7 btn-primary rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 group"
        >
          {isLoading ? (
            <>
              <i className="fa-solid fa-atom animate-spin text-2xl"></i>
              Synthesizing Global Knowledge...
            </>
          ) : (
            <>
              <i className="fa-solid fa-map-location-dot group-hover:rotate-12 transition-transform"></i>
              Forge Academic Framework
            </>
          )}
        </button>
      </form>

      {isCameraActive && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-white rounded-[3rem] overflow-hidden max-w-2xl w-full relative shadow-[0_0_100px_rgba(99,102,241,0.3)] animate-in zoom-in-95 duration-500">
            <video ref={videoRef} autoPlay className="w-full aspect-video object-cover" />
            <div className="p-8 flex justify-between items-center bg-white">
              <button onClick={toggleCamera} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">Abort Mission</button>
              <button onClick={capturePhoto} className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-fuchsia-600 rounded-full border-[6px] border-slate-100 shadow-2xl active:scale-90 transition-all"></button>
              <div className="w-20"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumForm;

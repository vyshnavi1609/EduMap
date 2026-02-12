
import React, { useState, useMemo } from 'react';
import { Curriculum, Resource } from '../types';
import { getResourceLink } from '../services/resourceLinkService';

interface CurriculumViewProps {
  curriculum: Curriculum;
  isSaved?: boolean;
  onSave?: (c: Curriculum) => void;
  onUpdate?: (c: Curriculum) => void;
}

type Section = 'overview' | 'roadmap' | 'modules' | 'assessments' | 'resources';

const CurriculumView: React.FC<CurriculumViewProps> = ({ 
  curriculum, 
  isSaved = false,
  onSave,
  onUpdate 
}) => {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [isExporting, setIsExporting] = useState(false);

  const downloadPDF = async () => {
    const element = document.getElementById('premium-pdf-document');
    if (!element) return;
    setIsExporting(true);
    const opt = {
      margin: 10,
      filename: `EduMap_Prospectus_${curriculum.courseTitle.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all', before: '.page-break' }
    };
    try {
      element.style.display = 'block';
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
      element.style.display = 'none';
    } catch (err) {
      console.error("PDF Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const allResources = useMemo(() => curriculum.modules.flatMap(m => m.resources), [curriculum]);

  const getLink = (res: Resource) => {
    return getResourceLink(res, curriculum.courseTitle);
  };

  const sections: { id: Section; label: string; icon: string }[] = [
    { id: 'overview', label: 'Synthesis', icon: 'fa-eye' },
    { id: 'roadmap', label: 'Milestones', icon: 'fa-map' },
    { id: 'modules', label: 'Curricular Units', icon: 'fa-layer-group' },
    { id: 'assessments', label: 'Mastery Audit', icon: 'fa-clipboard-check' },
    { id: 'resources', label: 'Knowledge Assets', icon: 'fa-book' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
      {/* Header Visual */}
      <div className="bg-slate-950 rounded-3xl p-10 md:p-16 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-10"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">{curriculum.targetAudience}</span>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">{curriculum.difficulty} Phase</span>
          </div>
          <h1 className="text-white tracking-tight leading-none">{curriculum.courseTitle}</h1>
          <div className="flex flex-wrap gap-6 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
             <span className="flex items-center gap-2"><i className="fa-solid fa-clock text-indigo-400"></i> {curriculum.totalDuration} Intensity</span>
             <span className="flex items-center gap-2"><i className="fa-solid fa-layer-group text-purple-400"></i> {curriculum.modules.length} Core Units</span>
             <span className="flex items-center gap-2"><i className="fa-solid fa-bolt text-fuchsia-400"></i> {curriculum.industryAlignment.relevanceScore}% Relevance</span>
          </div>
          <div className="pt-4 flex gap-3 print:hidden">
            {!isSaved && (
              <button onClick={() => onSave?.(curriculum)} className="px-6 py-3 btn-primary text-xs flex items-center gap-2"><i className="fa-solid fa-cloud-arrow-up"></i> Save Blueprint</button>
            )}
            <button 
              disabled={isExporting}
              onClick={downloadPDF} 
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all border border-white/10 font-bold text-xs flex items-center gap-2"
            >
              <i className={`fa-solid ${isExporting ? 'fa-circle-notch animate-spin' : 'fa-file-pdf'}`}></i> 
              {isExporting ? 'Preparing Prospectus...' : 'Export PDF Prospectus'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-1 sticky top-4 z-40">
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex-1 min-w-[100px] py-3 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-2 tracking-widest uppercase ${
              activeSection === sec.id 
                ? 'bg-slate-950 text-white shadow-md' 
                : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
            }`}
          >
            <i className={`fa-solid ${sec.icon} text-xs`}></i>
            {sec.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[40vh]">
        <div key={activeSection} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeSection === 'overview' && (
            <div className="space-y-6">
               <div className="neat-card p-10 space-y-8">
                  <h3 className="text-slate-900">Academic Vision</h3>
                  <p className="text-slate-600 italic border-l-4 border-indigo-500 pl-6 text-base leading-relaxed">"{curriculum.description}"</p>
                  <div className="grid md:grid-cols-2 gap-6 pt-4">
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Pedagogical Strategy</p>
                        <p className="text-sm font-semibold text-slate-700 leading-relaxed">{curriculum.pedagogicalPhilosophy}</p>
                     </div>
                     <div className="bg-slate-900 p-6 rounded-2xl text-white">
                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-3">Market Alignment</p>
                        <p className="text-xs font-medium text-slate-300 leading-relaxed">{curriculum.industryAlignment.reasoning}</p>
                     </div>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {curriculum.learningOutcomes.map((lo, i) => (
                    <div key={i} className="neat-card p-6 border-b-2 border-indigo-500">
                       <span className="text-[9px] font-black text-indigo-600 uppercase mb-2 block tracking-wider">{lo.level}</span>
                       <p className="text-sm font-bold text-slate-800 leading-snug">{lo.outcome}</p>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeSection === 'roadmap' && (
            <div className="neat-card p-10">
               <h3 className="mb-8 text-slate-900">Program Flow & Milestones</h3>
               <div className="space-y-3">
                 {curriculum.modules.map((m, idx) => (
                   <div 
                      key={idx} 
                      className="group flex items-center gap-6 p-6 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer"
                      onClick={() => setActiveSection('modules')}
                   >
                      <div className="w-10 h-10 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:bg-indigo-600 transition-colors">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{m.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.duration} Engagement</p>
                      </div>
                      <i className="fa-solid fa-chevron-right text-slate-200 group-hover:text-indigo-600 transition-all group-hover:translate-x-1"></i>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeSection === 'modules' && (
            <div className="space-y-8">
              {curriculum.modules.map((m, idx) => (
                <section key={idx} id={`module-${idx}`} className="neat-card overflow-hidden">
                  <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
                    <div>
                      <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-2">Unit Specification {idx + 1}</p>
                      <h3 className="text-white !text-2xl tracking-tight">{m.title}</h3>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-lg border border-white/10 uppercase tracking-widest">{m.duration}</span>
                    </div>
                  </div>
                  <div className="p-10 grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructional Logic</h4>
                       <p className="text-sm font-bold text-slate-700 leading-relaxed italic border-l-2 border-indigo-100 pl-4">"{m.pedagogicalStrategy}"</p>
                       <div className="space-y-4 pt-4">
                          <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Key Objectives</h4>
                          <ul className="space-y-3">
                             {m.objectives.map((o, i) => (
                               <li key={i} className="flex gap-3 text-sm font-semibold text-slate-600">
                                 <i className="fa-solid fa-check-circle text-indigo-400 mt-1"></i> {o}
                               </li>
                             ))}
                          </ul>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Tasks</h4>
                       <div className="space-y-3">
                          {m.assignments.map((asgn, i) => (
                            <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                               <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">{asgn.type}</span>
                               <p className="text-sm font-bold text-slate-900 mt-2">{asgn.title}</p>
                               <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Target: {asgn.deliverable}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )}

          {activeSection === 'assessments' && (
             <div className="grid md:grid-cols-2 gap-6">
               {curriculum.assessments.map((a, i) => (
                 <div key={i} className="neat-card p-10 flex flex-col h-full hover:border-indigo-300">
                    <div className="flex justify-between mb-8">
                       <h3 className="text-slate-900 !text-xl">{a.type}</h3>
                       <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-lg tracking-widest uppercase">{a.weight} Weight</span>
                    </div>
                    <p className="text-slate-500 font-medium italic text-sm mb-8 flex-1 leading-relaxed">"{a.description}"</p>
                    <div className="pt-6 border-t border-slate-50">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Examined Indicators</p>
                       <div className="flex flex-wrap gap-2">
                          {a.sampleConcepts.map((c, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100">{c}</span>
                          ))}
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          )}

          {activeSection === 'resources' && (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allResources.map((r, i) => (
                  <a key={i} href={getLink(r)} target="_blank" rel="noopener noreferrer" className="neat-card p-8 flex flex-col h-full group">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          <i className={`fa-solid ${r.type === 'Video' ? 'fa-play' : 'fa-book-open'}`}></i>
                       </div>
                       <i className="fa-solid fa-up-right-from-square text-slate-200 group-hover:text-indigo-400 text-xs"></i>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 mb-2 leading-tight line-clamp-2">{r.title}</h4>
                    {r.author && <p className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">Authority: {r.author}</p>}
                    <p className="text-xs text-slate-500 font-medium line-clamp-3 italic mb-6 leading-relaxed">{r.description}</p>
                    <div className="mt-auto pt-4 border-t border-slate-50 text-[9px] font-black text-slate-300 uppercase tracking-widest">{r.type} Resource</div>
                  </a>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* ENHANCED PDF DOCUMENT TEMPLATE */}
      <div id="premium-pdf-document" style={{ display: 'none', background: '#ffffff', color: '#0f172a', width: '210mm', fontFamily: 'sans-serif' }}>
        {/* Cover Page */}
        <div style={{ padding: '30mm', minHeight: '297mm', position: 'relative', border: '15px solid #f8fafc', boxSizing: 'border-box' }}>
           <p style={{ fontSize: '10px', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '15mm' }}>Academic Prospectus • Generated by EduMap AI</p>
           <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', marginBottom: '10mm', lineHeight: '1.1' }}>{curriculum.courseTitle}</h1>
           <p style={{ fontSize: '16px', color: '#475569', fontWeight: '700', lineHeight: '1.6', marginBottom: '20mm' }}>{curriculum.description}</p>
           
           <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '10mm', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10mm' }}>
              <div>
                 <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>Academic Level</p>
                 <p style={{ fontSize: '14px', fontWeight: '900', color: '#1e293b' }}>{curriculum.targetAudience}</p>
              </div>
              <div>
                 <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>Difficulty Index</p>
                 <p style={{ fontSize: '14px', fontWeight: '900', color: '#1e293b' }}>{curriculum.difficulty}</p>
              </div>
              <div>
                 <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>Program Duration</p>
                 <p style={{ fontSize: '14px', fontWeight: '900', color: '#1e293b' }}>{curriculum.totalDuration}</p>
              </div>
              <div>
                 <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>Units Found</p>
                 <p style={{ fontSize: '14px', fontWeight: '900', color: '#1e293b' }}>{curriculum.modules.length} Specialized Modules</p>
              </div>
           </div>

           <div style={{ position: 'absolute', bottom: '20mm', left: '30mm' }}>
              <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>VERIFIED FOR ACADEMIC STANDARDS • {new Date().toLocaleDateString()}</p>
           </div>
        </div>

        {/* Section 1: Roadmap & Outcomes */}
        <div style={{ padding: '25mm', pageBreakBefore: 'always' }}>
           <h2 style={{ fontSize: '20px', fontWeight: '900', borderBottom: '3px solid #6366f1', display: 'inline-block', paddingBottom: '2mm', marginBottom: '10mm' }}>1. Program Synthesis & Roadmap</h2>
           <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#6366f1', marginBottom: '4mm' }}>Academic Philosophy</h4>
           <p style={{ fontSize: '13px', lineHeight: '1.6', fontWeight: '600', marginBottom: '10mm', color: '#334155' }}>{curriculum.pedagogicalPhilosophy}</p>
           
           <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#6366f1', marginBottom: '4mm' }}>Learning Milestones</h4>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3mm' }}>
              {curriculum.modules.map((m, idx) => (
                <div key={idx} style={{ padding: '5mm', background: '#f8fafc', borderRadius: '5mm', border: '1px solid #e2e8f0', display: 'flex', gap: '5mm', alignItems: 'center' }}>
                   <div style={{ width: '8mm', height: '8mm', background: '#0f172a', color: '#fff', borderRadius: '2mm', textAlign: 'center', lineHeight: '8mm', fontSize: '12px', fontWeight: '900' }}>{idx+1}</div>
                   <div>
                      <p style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b' }}>{m.title}</p>
                      <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8' }}>{m.duration} Engagement</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Section 2: Detailed Curricular Units */}
        {curriculum.modules.map((m, idx) => (
          <div key={idx} style={{ padding: '25mm', pageBreakBefore: 'always' }}>
             <p style={{ fontSize: '10px', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase' }}>Curricular Unit {idx+1}</p>
             <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '10mm' }}>{m.title}</h2>
             <div style={{ background: '#f1f5f9', padding: '10mm', borderRadius: '10mm', marginBottom: '10mm' }}>
                <p style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '3mm' }}>Instructional Logic</p>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#334155', lineHeight: '1.6' }}>{m.pedagogicalStrategy}</p>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10mm' }}>
                <div>
                   <h4 style={{ fontSize: '12px', fontWeight: '900', marginBottom: '4mm' }}>Objectives</h4>
                   {m.objectives.map((o, i) => <p key={i} style={{ fontSize: '12px', fontWeight: '700', marginBottom: '2mm', color: '#1e293b' }}>• {o}</p>)}
                </div>
                <div>
                   <h4 style={{ fontSize: '12px', fontWeight: '900', marginBottom: '4mm' }}>Core Concepts</h4>
                   {m.keyConcepts.map((k, i) => (
                     <div key={i} style={{ marginBottom: '3mm' }}>
                        <p style={{ fontSize: '11px', fontWeight: '900', color: '#6366f1' }}>{k.concept}</p>
                        <p style={{ fontSize: '10px', fontWeight: '600', color: '#64748b' }}>{k.explanation}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        ))}

        {/* Section 3: Mastery Audit */}
        <div style={{ padding: '25mm', pageBreakBefore: 'always' }}>
           <h2 style={{ fontSize: '20px', fontWeight: '900', borderBottom: '3px solid #6366f1', display: 'inline-block', paddingBottom: '2mm', marginBottom: '10mm' }}>3. Mastery Audit & Evaluations</h2>
           {curriculum.assessments.map((a, i) => (
             <div key={i} style={{ padding: '8mm', border: '1px solid #f1f5f9', borderRadius: '8mm', marginBottom: '6mm', background: '#fff' }}>
                <div style={{ display: 'flex', justifySelf: 'space-between', width: '100%', marginBottom: '4mm' }}>
                   <h3 style={{ fontSize: '16px', fontWeight: '900' }}>{a.type}</h3>
                   <span style={{ fontWeight: '900', color: '#6366f1', fontSize: '11px' }}>{a.weight} Weight</span>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', fontWeight: '600', marginBottom: '4mm' }}>{a.description}</p>
                <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8' }}>EXAMINED COMPETENCIES: {a.sampleConcepts.join(', ')}</p>
             </div>
           ))}
        </div>

        {/* Section 4: Knowledge Assets */}
        <div style={{ padding: '25mm', pageBreakBefore: 'always' }}>
           <h2 style={{ fontSize: '20px', fontWeight: '900', borderBottom: '3px solid #6366f1', display: 'inline-block', paddingBottom: '2mm', marginBottom: '10mm' }}>4. Knowledge Assets & References</h2>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '5mm' }}>
              {allResources.map((r, i) => (
                <div key={i} style={{ padding: '6mm', border: '1px solid #f1f5f9', borderRadius: '6mm', background: '#f8fafc' }}>
                   <div style={{ display: 'flex', gap: '3mm', marginBottom: '2mm', alignItems: 'center' }}>
                      <span style={{ fontSize: '9px', fontWeight: '900', background: '#0f172a', color: '#fff', padding: '1mm 2.5mm', borderRadius: '2mm' }}>{r.type}</span>
                      <h4 style={{ fontSize: '14px', fontWeight: '900' }}>{r.title}</h4>
                   </div>
                   <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{r.description}</p>
                   {r.author && <p style={{ fontSize: '10px', fontWeight: '900', color: '#6366f1', marginTop: '2mm' }}>AUTHORITY: {r.author}</p>}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumView;

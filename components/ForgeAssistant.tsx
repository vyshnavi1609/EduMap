
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface ForgeAssistantProps {
  context: string;
}

const ForgeAssistant: React.FC<ForgeAssistantProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: "Hello! I'm your EduMap Assistant. How can I help you architect your academic programs today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `You are EduMap AI, an expert academic assistant. The user is currently in the "${context}" view of the application. Help them with their questions about curriculum design, academic standards, industry alignment, or using the app features. Be concise and professional.
          User says: ${userMsg}` }] }
        ]
      });

      const aiText = response.text || "I apologize, but I encountered an error. How else can I assist?";
      setMessages(prev => [...prev, { role: 'assistant', text: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "EduMap connection lost. Please check your network." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden mb-6 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-slate-950 p-6 text-white flex items-center justify-between relative overflow-hidden">
             <div className="absolute inset-0 mesh-gradient opacity-40"></div>
             <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-robot"></i></div>
                <div>
                  <h4 className="font-black text-sm">EduMap Assistant</h4>
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Active in {context}</p>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="relative z-10 text-white/50 hover:text-white transition-colors"><i className="fa-solid fa-times"></i></button>
          </div>
          
          <div ref={scrollRef} className="h-96 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-900 rounded-bl-none border border-slate-200'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex gap-2">
                  <div className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
             <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for advice..." 
              className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
             />
             <button 
              onClick={handleSend}
              className="w-11 h-11 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
             >
               <i className="fa-solid fa-paper-plane"></i>
             </button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90 ${
          isOpen ? 'bg-slate-950 text-white' : 'bg-indigo-600 text-white shadow-indigo-600/40'
        }`}
      >
        <i className={`fa-solid ${isOpen ? 'fa-comment-slash' : 'fa-robot'}`}></i>
        {!isOpen && <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-4 border-slate-50"></span>}
      </button>
    </div>
  );
};

export default ForgeAssistant;

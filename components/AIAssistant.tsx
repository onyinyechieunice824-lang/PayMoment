
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeFinances } from '../services/geminiService';
import { ChatMessage, Transaction } from '../types';

interface AIAssistantProps {
  transactions: Transaction[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ transactions }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hi! I'm PayAI. I've analyzed your real-time activity. How can I help you optimize your Moment today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await analyzeFinances(input, transactions);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "PayAI is fine-tuning its engine. Please try again soon." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-120px)] animate-in slide-in-from-bottom duration-500">
      <div className="mb-6 space-y-4">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors tap-scale">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">PayAI Assistant</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mt-1">Intelligence driven by your financial moments.</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 mb-6 no-scrollbar shadow-inner transition-colors">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[1.5rem] text-sm leading-relaxed font-medium transition-all ${m.role === 'user' ? 'bg-blue-700 text-white rounded-tr-none shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-[1.5rem] rounded-tl-none animate-pulse text-slate-500 text-xs font-black uppercase tracking-widest italic">Crunching Data...</div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask about your spending habits..." className="flex-1 p-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white font-bold" />
        <button onClick={handleSend} disabled={loading} className="bg-gradient-to-r from-blue-800 to-purple-700 text-white px-8 rounded-[1.5rem] font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:shadow-2xl active:scale-95">Ask</button>
      </div>
    </div>
  );
};

export default AIAssistant;

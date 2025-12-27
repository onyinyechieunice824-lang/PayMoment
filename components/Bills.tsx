
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../types';

// Add missing props interface
interface BillsProps {
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  processTransaction: (tx: Transaction, currency: string) => void;
}

const CATEGORIES = [
  { id: 'airtime', name: 'Airtime', icon: '📱', color: 'bg-blue-100 text-blue-600' },
  { id: 'data', name: 'Data Bundle', icon: '📶', color: 'bg-cyan-100 text-cyan-600' },
  { id: 'electricity', name: 'Electricity', icon: '💡', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'cable', name: 'Cable TV', icon: '📺', color: 'bg-purple-100 text-purple-600' },
  { id: 'internet', name: 'Internet', icon: '🌐', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'betting', name: 'Betting', icon: '⚽', color: 'bg-green-100 text-green-600' },
];

const PROVIDERS: Record<string, string[]> = {
  electricity: ['IKEDC (Ikeja)', 'EKEDC (Eko)', 'PHED (Port Harcourt)', 'AEDC (Abuja)', 'KAEDCO (Kaduna)'],
  cable: ['DSTV', 'GOTV', 'StarTimes', 'Showmax'],
  internet: ['MTN Fiber', 'Spectranet', 'Smile', 'FiberOne'],
};

// Update component signature to accept props
const Bills: React.FC<BillsProps> = ({ notify, processTransaction }) => {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [step, setStep] = useState<'selection' | 'form' | 'success'>('selection');

  const handleSelect = (id: string) => {
    setSelectedCat(id);
    setStep('form');
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in zoom-in-95">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-4xl shadow-xl shadow-green-100/20">🎉</div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Successful</h2>
          <p className="text-slate-500 dark:text-slate-400">Your bill has been settled instantly.</p>
        </div>
        <button 
          onClick={() => setStep('selection')}
          className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none tap-scale"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors tap-scale">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
      </button>

      <div>
        <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">Bill Payments</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Pay utilities, buy data, and more.</p>
      </div>

      {step === 'selection' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => handleSelect(cat.id)}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center gap-3 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg active:scale-95 transition-all group tap-scale"
            >
              <div className={`w-16 h-16 rounded-2xl ${cat.color} dark:bg-slate-800 flex items-center justify-center text-3xl transition-transform group-hover:rotate-12`}>
                {cat.icon}
              </div>
              <span className="font-black text-sm text-slate-900 dark:text-white">{cat.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
             <div className="flex items-center gap-3">
                <span className="text-3xl">{CATEGORIES.find(c => c.id === selectedCat)?.icon}</span>
                <span className="font-black text-xl text-slate-900 dark:text-white capitalize">{selectedCat} Payment</span>
             </div>
             <button onClick={() => setStep('selection')} className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">Change</button>
          </div>

          <div className="space-y-6">
            {PROVIDERS[selectedCat!] && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-1">Service Provider</label>
                <div className="relative">
                  <select className="w-full p-4 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all text-slate-900 dark:text-white font-bold">
                    {PROVIDERS[selectedCat!].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-1">Customer ID / Meter Number</label>
              <input 
                type="text" 
                placeholder="0000 0000 000"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-1">Amount to Pay</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">₦</span>
                <input 
                  type="text" 
                  placeholder="0.00"
                  className="w-full p-4 pl-10 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-black text-2xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => setStep('success')}
            className="w-full py-5 bg-gradient-to-r from-blue-700 to-purple-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-none transition-all hover:scale-[1.01] active:scale-95 tap-scale"
          >
            Confirm Payment
          </button>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-800/30 flex items-center gap-4 transition-colors">
         <span className="text-3xl">🎁</span>
         <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest leading-relaxed">
           Earn up to <span className="font-black">100 MomentPoints</span> on every utility bill payment! Points can be redeemed for airtime or data.
         </p>
      </div>
    </div>
  );
};

export default Bills;

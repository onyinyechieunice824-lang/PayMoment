
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface CurrencySwapProps {
  user: User;
  setUser: (user: User) => void;
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const RATES: Record<string, number> = {
  'USD_NGN': 1655.40,
  'GBP_NGN': 2120.20,
  'NGN_USD': 1 / 1680.00,
  'NGN_GBP': 1 / 2150.00,
};

const CurrencySwap: React.FC<CurrencySwapProps> = ({ user, setUser, notify }) => {
  const navigate = useNavigate();
  const [fromCurr, setFromCurr] = useState<'NGN' | 'USD' | 'GBP'>('NGN');
  const [toCurr, setToCurr] = useState<'NGN' | 'USD' | 'GBP'>('USD');
  const [amount, setAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    if (fromCurr === toCurr) {
      const next = fromCurr === 'NGN' ? 'USD' : 'NGN';
      setToCurr(next);
    }
  }, [fromCurr]);

  const currentRate = useMemo(() => {
    const key = `${fromCurr}_${toCurr}`;
    if (RATES[key]) return RATES[key];
    if (fromCurr === 'USD' && toCurr === 'GBP') return RATES['USD_NGN'] / RATES['GBP_NGN'];
    if (fromCurr === 'GBP' && toCurr === 'USD') return RATES['GBP_NGN'] / RATES['USD_NGN'];
    return 1;
  }, [fromCurr, toCurr]);

  const convertedAmount = useMemo(() => {
    const val = parseFloat(amount) || 0;
    return val * currentRate;
  }, [amount, currentRate]);

  const handleSwap = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (user.balances[fromCurr] < val) {
      notify(`Insufficient ${fromCurr} balance.`, 'error');
      return;
    }

    setIsSwapping(true);
    setTimeout(() => {
      const updatedBalances = { ...user.balances };
      updatedBalances[fromCurr] -= val;
      updatedBalances[toCurr] = (updatedBalances[toCurr] || 0) + convertedAmount;
      
      setUser({ ...user, balances: updatedBalances });
      
      const fromSymbol = fromCurr === 'NGN' ? '₦' : fromCurr === 'USD' ? '$' : '£';
      const toSymbol = toCurr === 'NGN' ? '₦' : toCurr === 'USD' ? '$' : '£';
      
      notify(
        `Swapped ${fromSymbol}${val.toLocaleString()} to ${toSymbol}${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} successfully!`, 
        'success'
      );
      
      setAmount('');
      setIsSwapping(false);
    }, 1800);
  };

  const setPercentage = (p: number) => {
    const bal = user.balances[fromCurr] || 0;
    setAmount((bal * p).toFixed(2));
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors tap-scale">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
      </button>

      <div className="text-center space-y-2">
         <h2 className="text-4xl font-black bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent italic tracking-tighter leading-none">Currency Exchange</h2>
         <div className="flex items-center justify-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">Live Interbank Rates</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-2 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden transition-colors">
         {/* Top Section: Sell */}
         <div className="p-8 md:p-10 space-y-6">
            <div className="flex justify-between items-center px-1">
               <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">You Sell</label>
               <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/20">Balance: {fromCurr === 'NGN' ? '₦' : fromCurr === 'USD' ? '$' : '£'}{(user.balances[fromCurr] || 0).toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
               <div className="relative">
                  <select 
                   value={fromCurr}
                   onChange={(e) => setFromCurr(e.target.value as any)}
                   className="bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-2xl font-black text-sm outline-none border border-slate-300 dark:border-slate-700 transition-all focus:ring-4 focus:ring-blue-500/20 shadow-sm text-slate-900 dark:text-white appearance-none pr-10"
                  >
                     <option value="NGN">🇳🇬 NGN</option>
                     <option value="USD">🇺🇸 USD</option>
                     <option value="GBP">🇬🇧 GBP</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                  </div>
               </div>
               <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-4xl md:text-5xl font-black text-right outline-none text-slate-900 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-800"
               />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
               {[0.25, 0.5, 0.75, 1].map((p) => (
                 <button 
                  key={p}
                  onClick={() => setPercentage(p)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-[10px] font-black text-slate-600 dark:text-slate-300 rounded-xl transition-all border border-slate-300 dark:border-slate-700 shadow-sm active:scale-95"
                 >
                   {p === 1 ? 'MAX' : `${p * 100}%`}
                 </button>
               ))}
            </div>
         </div>

         {/* Swap Action Bar */}
         <div className="relative h-4 flex items-center justify-center z-20">
            <div className="absolute inset-x-0 h-px bg-slate-200 dark:bg-slate-800"></div>
            <button 
              onClick={() => {
                const temp = fromCurr;
                setFromCurr(toCurr);
                setToCurr(temp);
                setAmount('');
              }}
              className="relative w-14 h-14 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-2xl shadow-2xl hover:rotate-180 transition-all duration-700 active:scale-90 tap-scale"
            >
              🔄
            </button>
         </div>

         {/* Bottom Section: Buy */}
         <div className="p-8 md:p-10 space-y-6 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center px-1">
               <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">You Receive (Estimated)</label>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
               <div className="relative">
                  <select 
                   value={toCurr}
                   onChange={(e) => setToCurr(e.target.value as any)}
                   className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl font-black text-sm outline-none border border-slate-300 dark:border-slate-800 transition-all focus:ring-4 focus:ring-blue-500/20 shadow-md text-slate-900 dark:text-white appearance-none pr-10"
                  >
                     <option value="NGN">🇳🇬 NGN</option>
                     <option value="USD">🇺🇸 USD</option>
                     <option value="GBP">🇬🇧 GBP</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                  </div>
               </div>
               <div className="flex-1 text-4xl md:text-5xl font-black text-right text-blue-700 dark:text-blue-400 animate-in fade-in slide-in-from-right-4 leading-none tabular-nums">
                  {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </div>
            </div>

            <div className="pt-6 flex justify-between items-center border-t border-slate-200 dark:border-slate-700/50">
               <div className="flex items-center gap-3">
                  <span className="text-base">🏷️</span>
                  <span className="text-[10px] md:text-xs font-black text-slate-800 dark:text-slate-300 tracking-tight">1 {fromCurr} = {currentRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toCurr}</span>
               </div>
               <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-transparent">Guaranteed Rate</span>
            </div>
         </div>

         <div className="p-8 md:p-10">
            <button 
              onClick={handleSwap}
              disabled={!amount || isSwapping}
              className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 ${
                isSwapping ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-700 shadow-blue-200 dark:shadow-none'
              }`}
            >
              {isSwapping ? (
                <>
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Exchanging...</span>
                </>
              ) : 'Swap Currencies Now'}
            </button>
         </div>
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/30 flex gap-4 items-center">
        <span className="text-2xl">⚡</span>
        <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest leading-relaxed">
          Swaps are executed at real-time interbank rates with zero hidden commission. Settlement is instant.
        </p>
      </div>
    </div>
  );
};

export default CurrencySwap;


import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Transaction } from '../types';

interface WithdrawToNairaProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

// Dynamic rates matching the DomiciliaryAccounts component
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1680.00,
  GBP: 2150.00
};

const WithdrawToNaira: React.FC<WithdrawToNairaProps> = ({ user, setUser, notify }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCurrency = (queryParams.get('from') as 'USD' | 'GBP') || 'USD';

  const [fromCurrency, setFromCurrency] = useState<'USD' | 'GBP'>(initialCurrency);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const currentBalance = user.balances[fromCurrency] || 0;
  const currentRate = EXCHANGE_RATES[fromCurrency];
  
  const estimatedNaira = useMemo(() => {
    const val = parseFloat(amount);
    if (isNaN(val)) return 0;
    return val * currentRate;
  }, [amount, currentRate]);

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      notify("Please enter a valid amount to convert.", "error");
      return;
    }
    if (val > currentBalance) {
      notify(`Insufficient ${fromCurrency} balance.`, 'error');
      return;
    }

    setIsProcessing(true);
    
    // Simulate high-speed interbank settlement
    setTimeout(() => {
      const txId = Math.random().toString(36).substr(2, 9);
      const symbol = fromCurrency === 'USD' ? '$' : '£';
      
      // Create transaction record for history
      const tx: Transaction = {
        id: txId,
        type: 'credit', // Credit to NGN
        amount: estimatedNaira,
        title: `Liquidation: ${symbol}${val.toLocaleString()} to NGN`,
        category: 'Exchange',
        timestamp: new Date().toLocaleString(),
        status: 'completed'
      };

      // USE FUNCTIONAL UPDATE TO PREVENT STALE CLOSURES
      setUser(prev => {
        const updatedBalances = { ...prev.balances };
        updatedBalances[fromCurrency] = (updatedBalances[fromCurrency] || 0) - val;
        updatedBalances['NGN'] = (updatedBalances['NGN'] || 0) + estimatedNaira;

        return { 
          ...prev, 
          balances: updatedBalances,
          transactions: [tx, ...prev.transactions]
        };
      });

      setIsProcessing(false);
      setStep('success');
      notify(`Successfully converted ${symbol}${val.toLocaleString()} to ₦${estimatedNaira.toLocaleString()}`, 'success');
    }, 2000);
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/20 rounded-full animate-ping"></div>
          <div className="relative flex items-center justify-center h-full bg-emerald-500 rounded-full text-white text-4xl shadow-xl">
            ✓
          </div>
        </div>
        
        <div className="space-y-2 px-4">
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">Settlement Complete</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
            ₦{estimatedNaira.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been added to your local Naira balance.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <button 
            onClick={() => navigate('/transfer')}
            className="p-5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-blue-100 dark:border-blue-800 tap-scale"
          >
            Send to Bank
          </button>
          <button 
            onClick={() => navigate('/cards')}
            className="p-5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-purple-100 dark:border-purple-800 tap-scale"
          >
            Add to Card
          </button>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] tap-scale shadow-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors tap-scale">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent italic tracking-tighter leading-none">Move to Naira</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Instant liquidation of foreign assets to your local wallet.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] space-y-6 border border-slate-100 dark:border-slate-700">
           <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Source Global Wallet</span>
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">Available: {fromCurrency === 'USD' ? '$' : '£'}{currentBalance.toLocaleString()}</span>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="relative group">
                <select 
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as any)}
                  className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-black text-sm text-slate-900 dark:text-white appearance-none pr-12 focus:border-blue-600 transition-all outline-none"
                >
                  <option value="USD">🇺🇸 USD</option>
                  <option value="GBP">🇬🇧 GBP</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-4xl font-black text-right outline-none text-slate-900 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-800 tabular-nums"
              />
           </div>
        </div>

        <div className="flex justify-center -my-10 relative z-10">
          <div className="w-14 h-14 bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-950 rounded-full flex items-center justify-center text-2xl shadow-xl dark:text-white hover:rotate-180 transition-transform duration-700">
            ↓
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-950/10 p-8 rounded-[2.5rem] border border-emerald-200 dark:border-emerald-800/30 space-y-4">
           <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest">Target NGN Balance</span>
              <span className="text-[10px] font-black text-emerald-600 uppercase">Settlement Currency</span>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-slate-900 px-5 py-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2">
                <span className="text-xl">🇳🇬</span>
                <span className="font-black text-slate-900 dark:text-white">NGN</span>
              </div>
              <div className="flex-1 text-4xl font-black text-right text-emerald-700 dark:text-emerald-400 tracking-tighter tabular-nums leading-none">
                ₦{estimatedNaira.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
           </div>
        </div>

        <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-slate-700">
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Guaranteed Settlement Rate</span>
          <span className="text-xs font-black text-slate-900 dark:text-white transition-colors tracking-tight">
            1 {fromCurrency} = ₦{currentRate.toLocaleString()}
          </span>
        </div>

        <button 
          onClick={handleWithdraw}
          disabled={!amount || isProcessing}
          className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 text-xs ${
            isProcessing ? 'bg-slate-400 cursor-allowed' : 'bg-gradient-to-r from-blue-700 to-purple-600 shadow-blue-100 dark:shadow-none'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing Settlement...</span>
            </>
          ) : `Convert to Naira Now`}
        </button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 p-6 rounded-[2rem] flex items-center gap-4 shadow-sm">
        <span className="text-3xl">⚡</span>
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 leading-relaxed uppercase tracking-widest">
          Settlement is instant and irreversible. Funds will be available for transfers, bills, and card spending immediately.
        </p>
      </div>
    </div>
  );
};

export default WithdrawToNaira;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NIGERIAN_BANKS } from '../constants';
import { User, Beneficiary, Transaction } from '../types';

interface TransferProps {
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  user: User;
  setUser: (user: User) => void;
  processTransaction: (tx: Transaction, currency: string) => void;
}

const Transfer: React.FC<TransferProps> = ({ notify, user, setUser, processTransaction }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'confirm' | 'success'>('details');
  const [type, setType] = useState<'bank' | 'paymoment'>('bank');
  const [payMomentMethod, setPayMomentMethod] = useState<'username' | 'account'>('username');
  
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [payMomentValue, setPayMomentValue] = useState('');
  const [amount, setAmount] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState('');

  const localBeneficiaries = user.beneficiaries.filter(b => b.type === 'local');

  // INSTANT NAME CONFIRMATION ENGINE
  useEffect(() => {
    let isVerifying = false;
    let mockName = '';

    // Criteria for External Bank
    if (type === 'bank' && accountNumber.length === 10 && bank) {
      isVerifying = true;
      mockName = 'CHINEDU EMMANUEL OKORO';
    } 
    // Criteria for Internal PayMoment
    else if (type === 'paymoment') {
      if (payMomentMethod === 'username' && payMomentValue.length >= 3) {
        isVerifying = true;
        mockName = `BOLUWATIFE SAMUEL (@${payMomentValue})`;
      } else if (payMomentMethod === 'account' && payMomentValue.length === 10) {
        isVerifying = true;
        mockName = `TUNDE AFOLABI (@tunde_moments)`;
      }
    }

    if (isVerifying) {
      setVerifying(true);
      setVerifiedName('');
      // Simulate high-speed database lookup
      const timer = setTimeout(() => {
        setVerifying(false);
        setVerifiedName(mockName);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setVerifying(false);
      setVerifiedName('');
    }
  }, [accountNumber, bank, type, payMomentMethod, payMomentValue]);

  const handleTransferRequest = () => {
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      notify("Please enter a valid amount", "error");
      return;
    }
    if (numericAmount > user.balances['NGN']) {
      notify("Insufficient funds in Naira wallet", "error");
      return;
    }
    setStep('confirm');
  };

  const selectBeneficiary = (b: Beneficiary) => {
    setType('bank');
    setBank(b.details.bank || '');
    setAccountNumber(b.details.accountNumber || '');
    setVerifiedName(b.name);
  };

  const finalizeTransfer = () => {
    const numericAmount = parseFloat(amount);
    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'debit',
      amount: numericAmount,
      title: `Transfer to ${verifiedName || accountNumber || payMomentValue}`,
      category: 'Transfer',
      timestamp: new Date().toLocaleString(),
      status: 'completed'
    };

    processTransaction(tx, 'NGN');

    if (saveBeneficiary && beneficiaryName.trim()) {
      const newBeneficiary: Beneficiary = {
        id: Math.random().toString(36).substr(2, 9),
        name: beneficiaryName,
        type: 'local',
        details: type === 'bank' ? { bank, accountNumber } : { accountNumber: payMomentValue }
      };
      setUser({
        ...user,
        beneficiaries: [...user.beneficiaries, newBeneficiary]
      });
    }

    setStep('success');
    notify(`₦${numericAmount.toLocaleString()} sent successfully!`, 'success');
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center space-y-8 py-12 animate-in zoom-in-95 duration-500">
        <div className="w-28 h-28 bg-emerald-500 dark:bg-emerald-600 rounded-full flex items-center justify-center text-5xl shadow-2xl shadow-emerald-500/40 animate-bounce">
          ✅
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight italic">Transfer Successful!</h2>
          <p className="text-slate-600 dark:text-slate-400 font-bold text-lg">₦{Number(amount).toLocaleString()}</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">Recipient: {verifiedName || 'the recipient'}.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm space-y-6">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span>Moment Ref</span>
            <span className="text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">PM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
          <button className="w-full py-5 bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs tap-scale shadow-lg">Share Receipt</button>
        </div>
        <button onClick={() => navigate('/')} className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-[11px] tap-scale underline underline-offset-4 decoration-2">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors tap-scale">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
      </button>

      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">Send Money</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Instant Wealth Mobility</p>
        </div>
        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner">💸</div>
      </div>

      {/* Primary Toggle: External vs PayMoment - BRIGHTER & SHARPER */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] flex border-2 border-slate-100 dark:border-slate-800 shadow-lg transition-colors overflow-hidden">
        <button 
          onClick={() => { setType('bank'); setVerifiedName(''); }} 
          className={`flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all tap-scale ${type === 'bank' ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/40' : 'text-slate-400 hover:text-blue-600'}`}
        >
          Other Bank
        </button>
        <button 
          onClick={() => { setType('paymoment'); setVerifiedName(''); }} 
          className={`flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all tap-scale ${type === 'paymoment' ? 'bg-purple-500 text-white shadow-xl shadow-purple-500/40' : 'text-slate-400 hover:text-purple-600'}`}
        >
          PayMoment User
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border-2 border-slate-100 dark:border-slate-800 shadow-2xl space-y-10 transition-colors">
        {type === 'bank' ? (
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-950 dark:text-slate-300 uppercase tracking-widest px-2">1. Choose Recipient Bank</label>
              <div className="relative group">
                <select 
                  value={bank} 
                  onChange={(e) => setBank(e.target.value)} 
                  className="w-full p-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-3xl outline-none font-black text-sm text-slate-900 dark:text-white transition-all appearance-none shadow-sm group-hover:border-slate-300 dark:group-hover:border-slate-600"
                >
                  <option value="">Select Bank...</option>
                  {NIGERIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-950 dark:text-slate-300 uppercase tracking-widest px-2">2. Account Number</label>
              <input 
                type="text" 
                maxLength={10} 
                value={accountNumber} 
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} 
                placeholder="0123456789" 
                className="w-full p-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-3xl outline-none font-black text-xl tracking-[0.2em] tabular-nums text-slate-900 dark:text-white transition-all shadow-sm placeholder:text-slate-200 dark:placeholder:text-slate-700" 
              />
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-6">
               <button 
                onClick={() => { setPayMomentMethod('username'); setPayMomentValue(''); setVerifiedName(''); }}
                className={`p-6 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-3 tap-scale ${payMomentMethod === 'username' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800'}`}
               >
                 <span className="text-3xl">👤</span>
                 <span className={`font-black text-[10px] uppercase tracking-widest ${payMomentMethod === 'username' ? 'text-purple-600' : 'text-slate-400'}`}>Pay ID (@ID)</span>
               </button>
               <button 
                onClick={() => { setPayMomentMethod('account'); setPayMomentValue(''); setVerifiedName(''); }}
                className={`p-6 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-3 tap-scale ${payMomentMethod === 'account' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800'}`}
               >
                 <span className="text-3xl">🔢</span>
                 <span className={`font-black text-[10px] uppercase tracking-widest ${payMomentMethod === 'account' ? 'text-purple-600' : 'text-slate-400'}`}>PM Account</span>
               </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-950 dark:text-slate-300 uppercase tracking-widest px-2">
                Recipient {payMomentMethod === 'username' ? 'Pay ID' : 'Account'}
              </label>
              <div className="relative group">
                {payMomentMethod === 'username' && <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl group-focus-within:text-purple-500 transition-colors">@</span>}
                <input 
                  type="text" 
                  value={payMomentValue}
                  maxLength={payMomentMethod === 'account' ? 10 : 20}
                  onChange={(e) => setPayMomentValue(payMomentMethod === 'account' ? e.target.value.replace(/\D/g, '') : e.target.value.toLowerCase())}
                  placeholder={payMomentMethod === 'username' ? 'username' : '0123456789'} 
                  className={`w-full p-6 ${payMomentMethod === 'username' ? 'pl-12' : 'pl-6'} bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-purple-600 rounded-3xl outline-none font-black text-xl text-slate-900 dark:text-white transition-all shadow-sm placeholder:text-slate-200 dark:placeholder:text-slate-700`} 
                />
              </div>
            </div>
          </div>
        )}

        {/* REAL-TIME VERIFICATION FEEDBACK - BRIGHTER & POPS */}
        <div className="min-h-[100px]">
          {verifying && (
            <div className="flex items-center gap-4 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-[2rem] animate-pulse">
               <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
               <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Security Lookup in Progress...</span>
            </div>
          )}

          {verifiedName && (
            <div className="p-8 bg-emerald-50 dark:bg-emerald-950/30 border-4 border-emerald-500 rounded-[2.5rem] flex items-center justify-between animate-in zoom-in-95 duration-300 shadow-xl shadow-emerald-500/10">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-md border-2 border-emerald-100 dark:border-emerald-900">👤</div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] leading-none mb-2">Authenticated Recipient</p>
                    <p className="text-lg font-black text-slate-950 dark:text-white leading-none tracking-tight italic">{verifiedName}</p>
                  </div>
               </div>
               <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">🛡️</div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-950 dark:text-slate-300 uppercase tracking-widest px-2">3. Amount to Transfer</label>
          <div className="relative group">
            <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-slate-950 dark:text-white text-3xl group-focus-within:text-blue-600 transition-colors">₦</span>
            <input 
              type="text" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} 
              placeholder="0.00" 
              className="w-full p-8 pl-16 bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-[2.5rem] outline-none font-black text-5xl tabular-nums text-slate-950 dark:text-white transition-all shadow-inner placeholder:text-slate-100 dark:placeholder:text-slate-900" 
            />
          </div>
        </div>

        {step === 'confirm' ? (
          <div className="bg-slate-950 dark:bg-blue-600 p-10 rounded-[3rem] text-white space-y-8 animate-in slide-in-from-top-4 shadow-2xl">
             <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Payment Authorization</p>
                <h4 className="text-4xl font-black italic tracking-tighter leading-none">₦{Number(amount).toLocaleString()} Total</h4>
             </div>
             <div className="p-6 bg-white/10 rounded-[1.5rem] flex justify-between items-center text-xs font-black uppercase tracking-widest border border-white/10">
                <span>Moment Fee</span>
                <span className="text-emerald-400">FREE INSTANT</span>
             </div>
             <button onClick={finalizeTransfer} className="w-full py-6 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-xs">Authorize with Moment PIN</button>
             <button onClick={() => setStep('details')} className="w-full text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Edit Transaction</button>
          </div>
        ) : (
          <button 
            disabled={!amount || !verifiedName} 
            onClick={handleTransferRequest} 
            className="w-full py-7 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/30 active:scale-[0.98] disabled:opacity-20 transition-all text-xs flex items-center justify-center gap-4"
          >
            Review & Send Moment
          </button>
        )}
      </div>

      <div className="bg-blue-600 p-8 rounded-[2.5rem] flex gap-6 items-center shadow-xl shadow-blue-500/20">
         <span className="text-4xl">💎</span>
         <div>
           <p className="text-[11px] font-black text-white uppercase tracking-widest leading-relaxed mb-1">Moment Reward Active</p>
           <p className="text-xs font-bold text-blue-100 opacity-90 leading-tight">
             Earn <span className="text-white font-black underline decoration-2">15 MomentPoints</span> on this transfer. Internal transfers are always free.
           </p>
         </div>
      </div>
    </div>
  );
};

export default Transfer;

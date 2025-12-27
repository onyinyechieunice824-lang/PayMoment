
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
      <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-4xl shadow-lg animate-bounce">
          ✅
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white transition-colors">Transfer Successful!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">₦{Number(amount).toLocaleString()} sent to {verifiedName || 'the recipient'}.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm w-full max-w-sm space-y-4">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>Moment Ref</span>
            <span className="text-slate-900 dark:text-white font-mono">PM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
          <button className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-[9px] tap-scale">Share Receipt</button>
        </div>
        <button onClick={() => navigate('/')} className="text-blue-600 font-black uppercase tracking-widest text-[10px] tap-scale">Return to Wallet</button>
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

      <div>
        <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">Send Money</h2>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Instant Wealth Mobility</p>
      </div>

      {/* Primary Toggle: External vs PayMoment */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] flex border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <button 
          onClick={() => { setType('bank'); setVerifiedName(''); }} 
          className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all tap-scale ${type === 'bank' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-blue-600'}`}
        >
          Other Bank
        </button>
        <button 
          onClick={() => { setType('paymoment'); setVerifiedName(''); }} 
          className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all tap-scale ${type === 'paymoment' ? 'bg-purple-600 text-white shadow-xl' : 'text-slate-500 hover:text-purple-600'}`}
        >
          PayMoment User
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 transition-colors">
        {type === 'bank' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest px-1">Choose Recipient Bank</label>
              <select 
                value={bank} 
                onChange={(e) => setBank(e.target.value)} 
                className="w-full p-5 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-black text-sm text-slate-900 dark:text-white transition-all appearance-none"
              >
                <option value="">Select Bank...</option>
                {NIGERIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest px-1">Account Number</label>
              <input 
                type="text" 
                maxLength={10} 
                value={accountNumber} 
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} 
                placeholder="0123456789" 
                className="w-full p-5 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-black text-lg tabular-nums text-slate-900 dark:text-white transition-all" 
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => { setPayMomentMethod('username'); setPayMomentValue(''); setVerifiedName(''); }}
                className={`p-5 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-2 ${payMomentMethod === 'username' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-600' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
               >
                 <span className="text-2xl">👤</span>
                 <span className="font-black text-[9px] uppercase tracking-widest text-slate-900 dark:text-white">Pay ID (@ID)</span>
               </button>
               <button 
                onClick={() => { setPayMomentMethod('account'); setPayMomentValue(''); setVerifiedName(''); }}
                className={`p-5 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-2 ${payMomentMethod === 'account' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-600' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
               >
                 <span className="text-2xl">🔢</span>
                 <span className="font-black text-[9px] uppercase tracking-widest text-slate-900 dark:text-white">PM Account</span>
               </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest px-1">
                {payMomentMethod === 'username' ? 'Recipient Pay ID' : 'PayMoment Account'}
              </label>
              <div className="relative">
                {payMomentMethod === 'username' && <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">@</span>}
                <input 
                  type="text" 
                  value={payMomentValue}
                  maxLength={payMomentMethod === 'account' ? 10 : 20}
                  onChange={(e) => setPayMomentValue(payMomentMethod === 'account' ? e.target.value.replace(/\D/g, '') : e.target.value.toLowerCase())}
                  placeholder={payMomentMethod === 'username' ? 'username' : '0123456789'} 
                  className={`w-full p-5 ${payMomentMethod === 'username' ? 'pl-10' : ''} bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-purple-600 rounded-2xl outline-none font-black text-lg text-slate-900 dark:text-white transition-all`} 
                />
              </div>
            </div>
          </div>
        )}

        {/* REAL-TIME VERIFICATION FEEDBACK */}
        <div className="min-h-[80px]">
          {verifying && (
            <div className="flex items-center gap-3 p-5 bg-blue-50 dark:bg-blue-900/10 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-[2rem] animate-pulse">
               <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">Verifying Identity...</span>
            </div>
          )}

          {verifiedName && (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border-4 border-emerald-500 rounded-[2rem] flex items-center justify-between animate-in zoom-in-95 duration-300">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-xl shadow-sm border border-emerald-100 dark:border-transparent">👤</div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">Confirmed Recipient</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{verifiedName}</p>
                  </div>
               </div>
               <span className="text-emerald-500 text-xl">🛡️</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest px-1">Amount to Send</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-2xl">₦</span>
            <input 
              type="text" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} 
              placeholder="0.00" 
              className="w-full p-6 pl-14 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-[2rem] outline-none font-black text-4xl tabular-nums text-slate-900 dark:text-white transition-all shadow-inner" 
            />
          </div>
        </div>

        {step === 'confirm' ? (
          <div className="bg-blue-700 p-8 rounded-[3rem] text-white space-y-6 animate-in slide-in-from-top-4">
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Payment Breakdown</p>
                <h4 className="text-2xl font-black italic">₦{Number(amount).toLocaleString()} Total</h4>
             </div>
             <div className="p-4 bg-white/10 rounded-2xl flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span>Moment Fee</span>
                <span className="text-emerald-300">₦0.00 FREE</span>
             </div>
             <button onClick={finalizeTransfer} className="w-full py-5 bg-white text-blue-700 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Authorize Payment</button>
             <button onClick={() => setStep('details')} className="w-full text-[9px] font-black uppercase tracking-widest opacity-60">Edit Details</button>
          </div>
        ) : (
          <button 
            disabled={!amount || !verifiedName} 
            onClick={handleTransferRequest} 
            className="w-full py-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 disabled:opacity-30 transition-all text-xs"
          >
            Review Transfer
          </button>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/50 flex gap-4 items-center">
         <span className="text-3xl">🎁</span>
         <p className="text-[10px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-widest leading-relaxed">
           You earn <span className="font-black">15 MomentPoints</span> on this transfer. Internal transfers are <span className="font-black">100% Free</span>.
         </p>
      </div>
    </div>
  );
};

export default Transfer;

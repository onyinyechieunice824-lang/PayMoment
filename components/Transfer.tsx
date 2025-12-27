
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NIGERIAN_BANKS } from '../constants';
import { User, Beneficiary, Transaction } from '../types';
import { PayMomentLogo } from '../App';

interface TransferProps {
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  user: User;
  setUser: (user: User) => void;
  processTransaction: (tx: Transaction, currency: string) => void;
}

const Transfer: React.FC<TransferProps> = ({ notify, user, setUser, processTransaction }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'confirm' | 'authorize' | 'success'>('details');
  const [type, setType] = useState<'bank' | 'paymoment'>('bank');
  const [payMomentMethod, setPayMomentMethod] = useState<'username' | 'account'>('username');
  const [authMode, setAuthMode] = useState<'pin' | 'biometric'>('pin');
  const [authStatus, setAuthStatus] = useState<'idle' | 'verifying'>('idle');
  const [sharingStatus, setSharingStatus] = useState<'idle' | 'generating'>('idle');
  
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [payMomentValue, setPayMomentValue] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [pin, setPin] = useState('');
  const [lastTxId, setLastTxId] = useState('');

  // Get recipient account for receipt logic
  const currentRecipientAcc = type === 'bank' ? accountNumber : (payMomentMethod === 'account' ? payMomentValue : 'PayMoment ID');

  // INSTANT NAME CONFIRMATION ENGINE
  useEffect(() => {
    let isVerifying = false;
    let mockName = '';

    if (type === 'bank' && accountNumber.length === 10 && bank) {
      isVerifying = true;
      mockName = 'CHINEDU EMMANUEL OKORO';
    } 
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

  const generateReceiptCanvas = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1200; // Increased height
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 1200);

    // Header
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(0, 0, 800, 180);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 900 60px Inter, sans-serif';
    ctx.fillText('PayMoment', 60, 110);

    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('OFFICIAL TRANSACTION RECEIPT', 60, 145);

    // Amount Body
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(60, 220, 680, 200);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText('AMOUNT TRANSFERRED', 90, 270);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 70px Inter, sans-serif';
    ctx.fillText(`NGN ${Number(amount).toLocaleString()}`, 90, 360);

    // Details Grid
    let y = 500;
    const drawRow = (label: string, value: string) => {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText(label.toUpperCase(), 60, y);
      ctx.fillStyle = '#0f172a';
      ctx.font = '800 24px Inter, sans-serif';
      ctx.fillText(value, 320, y);
      y += 80;
    };

    drawRow('Sender Name', user.name);
    drawRow('Recipient Account', currentRecipientAcc);
    drawRow('Recipient Name', verifiedName || 'N/A');
    drawRow('Bank', type === 'bank' ? bank : 'PayMoment Internal');
    drawRow('Remark', remark || 'N/A');
    drawRow('Reference', `PM-${lastTxId.toUpperCase()}`);
    drawRow('Date', new Date().toLocaleString());
    drawRow('Status', 'SUCCESSFUL');

    // Footer
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(60, 1140, 680, 4);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic bold 18px Inter, sans-serif';
    ctx.fillText('Thank you for choosing PayMoment. Secure, Fast, Global.', 60, 1180);

    return canvas.toDataURL('image/png');
  };

  const handleShare = async (mode: 'link' | 'image' | 'pdf') => {
    const summary = `PayMoment Receipt\nSender: ${user.name}\nTo: ${verifiedName}\nAcc: ${currentRecipientAcc}\nAmount: ₦${Number(amount).toLocaleString()}\nRemark: ${remark}\nRef: PM-${lastTxId.toUpperCase()}`;
    
    if (mode === 'pdf') {
      window.print();
      return;
    }

    setSharingStatus('generating');
    
    if (mode === 'image') {
      const dataUrl = await generateReceiptCanvas();
      if (dataUrl) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `PayMoment-Receipt-${lastTxId}.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: 'PayMoment Receipt' });
          } catch (e) {
            const link = document.createElement('a');
            link.download = `PayMoment-Receipt-${lastTxId}.png`;
            link.href = dataUrl;
            link.click();
          }
        } else {
          const link = document.createElement('a');
          link.download = `PayMoment-Receipt-${lastTxId}.png`;
          link.href = dataUrl;
          link.click();
        }
      }
      setSharingStatus('idle');
      notify("Image generated successfully", "success");
    } else if (mode === 'link') {
      if (navigator.share) {
        try {
          await navigator.share({ title: 'PayMoment Receipt', text: summary, url: window.location.origin });
        } catch {
          navigator.clipboard.writeText(summary);
          notify("Details copied to clipboard", "info");
        }
      } else {
        navigator.clipboard.writeText(summary);
        notify("Details copied to clipboard", "info");
      }
      setSharingStatus('idle');
    }
  };

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

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        finalizeTransfer();
      }
    }
  };

  const handleBiometricAuth = () => {
    setAuthStatus('verifying');
    setTimeout(() => {
      setAuthStatus('idle');
      finalizeTransfer();
    }, 1500);
  };

  const finalizeTransfer = () => {
    const numericAmount = parseFloat(amount);
    const txId = Math.random().toString(36).substr(2, 9);
    setLastTxId(txId);

    const tx: Transaction = {
      id: txId,
      type: 'debit',
      amount: numericAmount,
      title: `Transfer to ${verifiedName || accountNumber || payMomentValue}`,
      category: 'Transfer',
      timestamp: new Date().toLocaleString(),
      status: 'completed',
      remark: remark // Persist remark to history
    };

    processTransaction(tx, 'NGN');
    setStep('success');
    notify(`₦${numericAmount.toLocaleString()} sent successfully!`, 'success');
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center space-y-8 py-12 animate-in zoom-in-95 duration-500">
        <div className="no-print w-28 h-28 bg-emerald-500 dark:bg-emerald-600 rounded-full flex items-center justify-center text-5xl shadow-2xl shadow-emerald-500/40 animate-bounce">
          ✅
        </div>
        <div className="text-center space-y-2 no-print">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight italic">Transfer Successful!</h2>
          <p className="text-slate-600 dark:text-slate-400 font-bold text-lg">₦{Number(amount).toLocaleString()}</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">Recipient: {verifiedName || 'the recipient'}.</p>
        </div>

        {/* PRINTABLE RECEIPT CONTAINER */}
        <div className="print-container bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-sm space-y-8 transition-colors">
           <div className="flex flex-col items-center gap-4 pb-6 border-b border-dashed border-slate-200 dark:border-slate-700">
              <PayMomentLogo className="w-16 h-16" idSuffix="success-receipt" />
              <div className="text-center">
                 <h4 className="font-black italic text-xl text-blue-800 dark:text-white tracking-tighter">PayMoment Official</h4>
                 <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Transaction Authorization Token</p>
              </div>
           </div>
           
           <div className="space-y-4">
              <ReceiptDetailRow label="Sender" value={user.name} />
              <ReceiptDetailRow label="Recipient Acc" value={currentRecipientAcc} isMono />
              <ReceiptDetailRow label="Recipient Name" value={verifiedName} />
              <ReceiptDetailRow label="Amount" value={`₦${Number(amount).toLocaleString()}`} />
              <ReceiptDetailRow label="Remark" value={remark || 'None'} />
              <ReceiptDetailRow label="Ref" value={`PM-${lastTxId.toUpperCase()}`} isMono />
              <ReceiptDetailRow label="Status" value="SUCCESSFUL" />
              <ReceiptDetailRow label="Time" value={new Date().toLocaleString()} />
           </div>
           
           {/* Invisible element only shown in PDF prints */}
           <div className="hidden print:block pt-8 text-center border-t border-slate-100 mt-6 pt-6">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Verified digital document • Generated by PayMoment App</p>
           </div>
        </div>

        <div className="no-print w-full max-w-sm space-y-6 pt-4">
          <div className="grid grid-cols-3 gap-4">
             <ShareActionButton 
               icon="🔗" 
               label="Link" 
               color="bg-blue-600" 
               onClick={() => handleShare('link')} 
               disabled={sharingStatus === 'generating'} 
             />
             <ShareActionButton 
               icon="🖼️" 
               label="Image" 
               color="bg-purple-600" 
               onClick={() => handleShare('image')} 
               disabled={sharingStatus === 'generating'} 
             />
             <ShareActionButton 
               icon="📄" 
               label="PDF" 
               color="bg-emerald-600" 
               onClick={() => handleShare('pdf')} 
               disabled={sharingStatus === 'generating'} 
             />
          </div>

          {sharingStatus === 'generating' && (
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
               <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Synthesizing Pixels...</span>
            </div>
          )}

          <button onClick={() => navigate('/')} className="w-full text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-[11px] tap-scale underline underline-offset-4 decoration-2 text-center py-4">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  if (step === 'authorize') {
    return (
      <div className="fixed inset-0 z-[250] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="w-full max-w-md space-y-12">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto border-2 border-blue-500/30 mb-6">
              <span className="text-4xl">{authMode === 'pin' ? '🔐' : '🧬'}</span>
            </div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter">Security Check</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Authorize ₦{Number(amount).toLocaleString()}</p>
          </div>

          {authMode === 'pin' ? (
            <div className="space-y-12">
              <div className="flex justify-center gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-white border-white scale-125 shadow-[0_0_15px_white]' : 'border-white/20'}`} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-6 max-w-xs mx-auto">
                {['1','2','3','4','5','6','7','8','9','','0','del'].map((key, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      if (key === 'del') setPin(pin.slice(0, -1));
                      else if (key && pin.length < 4) handlePinInput(key);
                    }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white transition-all ${key ? 'bg-white/5 border border-white/10 hover:bg-white/10 active:scale-90' : 'pointer-events-none'}`}
                  >
                    {key === 'del' ? '←' : key}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-10 py-10">
               <button 
                onClick={handleBiometricAuth}
                disabled={authStatus === 'verifying'}
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 tap-scale relative ${authStatus === 'verifying' ? 'bg-blue-600/30' : 'bg-white/5 border-2 border-white/10'}`}
               >
                 <svg className={`w-16 h-16 ${authStatus === 'verifying' ? 'text-blue-400 animate-pulse' : 'text-white/40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3m0 18a10.003 10.003 0 01-8.212-4.33l-.054-.09m9.158-11.154l-.054-.09A10.003 10.003 0 0012 20M3 12h18" />
                 </svg>
                 {authStatus === 'verifying' && <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
               </button>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{authStatus === 'verifying' ? 'Scanning Fingerprint...' : 'Tap icon to use Touch ID'}</p>
            </div>
          )}

          <div className="flex flex-col gap-6 pt-10 text-center">
            <button 
              onClick={() => { setAuthMode(authMode === 'pin' ? 'biometric' : 'pin'); setPin(''); }}
              className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
            >
              Switch to {authMode === 'pin' ? 'Fingerprint' : 'PIN'}
            </button>
            <button 
              onClick={() => setStep('confirm')}
              className="text-[10px] font-black text-rose-500 uppercase tracking-widest"
            >
              Cancel Authorization
            </button>
          </div>
        </div>
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
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mt-2">Instant Wealth Mobility</p>
        </div>
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner">💸</div>
      </div>

      <div className="bg-slate-200 dark:bg-slate-800 p-2 rounded-[2.5rem] flex border-2 border-slate-300 dark:border-slate-700 shadow-md transition-colors overflow-hidden">
        <button 
          onClick={() => { setType('bank'); setVerifiedName(''); }} 
          className={`flex-1 py-5 rounded-[2rem] text-[12px] font-black uppercase tracking-widest transition-all tap-scale ${type === 'bank' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/50' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600'}`}
        >
          Other Bank
        </button>
        <button 
          onClick={() => { setType('paymoment'); setVerifiedName(''); }} 
          className={`flex-1 py-5 rounded-[2rem] text-[12px] font-black uppercase tracking-widest transition-all tap-scale ${type === 'paymoment' ? 'bg-purple-600 text-white shadow-2xl shadow-purple-500/50' : 'text-slate-500 dark:text-slate-400 hover:text-purple-600'}`}
        >
          PayMoment User
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border-2 border-slate-300 dark:border-slate-700 shadow-2xl space-y-10 transition-colors">
        {type === 'bank' ? (
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-950 dark:text-slate-200 uppercase tracking-widest px-2">1. Choose Recipient Bank</label>
              <div className="relative group">
                <select 
                  value={bank} 
                  onChange={(e) => setBank(e.target.value)} 
                  className="w-full p-6 bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-600 focus:border-blue-600 rounded-3xl outline-none font-black text-base text-slate-950 dark:text-white transition-all appearance-none shadow-sm group-hover:border-slate-500"
                >
                  <option value="">Select Bank...</option>
                  {NIGERIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 dark:text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-950 dark:text-slate-200 uppercase tracking-widest px-2">2. Account Number</label>
              <input 
                type="text" 
                maxLength={10} 
                value={accountNumber} 
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} 
                placeholder="0123456789" 
                className="w-full p-6 bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-600 focus:border-blue-600 rounded-3xl outline-none font-black text-2xl tracking-[0.2em] tabular-nums text-slate-950 dark:text-white transition-all shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-700" 
              />
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-6">
               <button 
                onClick={() => { setPayMomentMethod('username'); setPayMomentValue(''); setVerifiedName(''); }}
                className={`p-6 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-3 tap-scale ${payMomentMethod === 'username' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-600 shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-800'}`}
               >
                 <span className="text-4xl">👤</span>
                 <span className={`font-black text-[11px] uppercase tracking-widest ${payMomentMethod === 'username' ? 'text-purple-700' : 'text-slate-600'}`}>Pay ID (@ID)</span>
               </button>
               <button 
                onClick={() => { setPayMomentMethod('account'); setPayMomentValue(''); setVerifiedName(''); }}
                className={`p-6 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-3 tap-scale ${payMomentMethod === 'account' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-600 shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-800'}`}
               >
                 <span className="text-3xl">🔢</span>
                 <span className={`font-black text-[11px] uppercase tracking-widest ${payMomentMethod === 'account' ? 'text-purple-700' : 'text-slate-600'}`}>PM Account</span>
               </button>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-950 dark:text-slate-200 uppercase tracking-widest px-2">
                Recipient {payMomentMethod === 'username' ? 'Pay ID' : 'Account'}
              </label>
              <div className="relative group">
                {payMomentMethod === 'username' && <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-600 text-2xl group-focus-within:text-purple-600 transition-colors">@</span>}
                <input 
                  type="text" 
                  value={payMomentValue}
                  maxLength={payMomentMethod === 'account' ? 10 : 20}
                  onChange={(e) => setPayMomentValue(payMomentMethod === 'account' ? e.target.value.replace(/\D/g, '') : e.target.value.toLowerCase())}
                  placeholder={payMomentMethod === 'username' ? 'username' : '0123456789'} 
                  className={`w-full p-6 ${payMomentMethod === 'username' ? 'pl-12' : 'pl-6'} bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-600 focus:border-purple-600 rounded-3xl outline-none font-black text-2xl text-slate-950 dark:text-white transition-all shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-700`} 
                />
              </div>
            </div>
          </div>
        )}

        <div className="min-h-[110px]">
          {verifying && (
            <div className="flex items-center gap-4 p-6 bg-blue-50 dark:bg-blue-900/40 border-4 border-dashed border-blue-400 rounded-[2rem] animate-pulse">
               <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
               <span className="text-[12px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-200">Security Lookup Active...</span>
            </div>
          )}

          {verifiedName && (
            <div className="p-8 bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 dark:from-emerald-500/20 dark:to-emerald-500/30 border-4 border-emerald-500 rounded-[2.5rem] flex items-center justify-between animate-in zoom-in-95 duration-300 shadow-2xl shadow-emerald-500/20">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-emerald-200 dark:border-emerald-700">👤</div>
                  <div>
                    <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em] leading-none mb-2">Confirmed Recipient</p>
                    <p className="text-xl font-black text-slate-950 dark:text-white leading-none tracking-tight italic">{verifiedName}</p>
                  </div>
               </div>
               <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl">🛡️</div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-950 dark:text-slate-200 uppercase tracking-widest px-2">3. Amount to Transfer</label>
          <div className="relative group">
            <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-slate-950 dark:text-white text-4xl group-focus-within:text-blue-600 transition-colors">₦</span>
            <input 
              type="text" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} 
              placeholder="0.00" 
              className="w-full p-8 pl-16 bg-white dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-[2.5rem] outline-none font-black text-5xl tabular-nums text-slate-950 dark:text-white transition-all shadow-inner placeholder:text-slate-100 dark:placeholder:text-slate-800" 
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-950 dark:text-slate-200 uppercase tracking-widest px-2">4. Remark / Narration (Optional)</label>
          <input 
            type="text" 
            value={remark} 
            onChange={(e) => setRemark(e.target.value)} 
            placeholder="What's this for? e.g. Lunch money" 
            className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600" 
          />
        </div>

        {step === 'confirm' ? (
          <div className="bg-slate-950 dark:bg-blue-600 p-10 rounded-[3rem] text-white space-y-8 animate-in slide-in-from-top-4 shadow-2xl border-4 border-blue-500/20">
             <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">Final Authorization</p>
                <h4 className="text-5xl font-black italic tracking-tighter leading-none">₦{Number(amount).toLocaleString()}</h4>
                {remark && <p className="text-xs font-bold opacity-60">“{remark}”</p>}
             </div>
             <div className="p-6 bg-white/10 rounded-[1.5rem] flex justify-between items-center text-xs font-black uppercase tracking-widest border-2 border-white/20">
                <span>Network Fee</span>
                <span className="text-emerald-400">₦0.00 (Moment Free)</span>
             </div>
             <button onClick={() => { setPin(''); setStep('authorize'); }} className="w-full py-6 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-xs">Authorize Transfer</button>
             <button onClick={() => setStep('details')} className="w-full text-[11px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Edit Transaction</button>
          </div>
        ) : (
          <button 
            disabled={!amount || !verifiedName} 
            onClick={handleTransferRequest} 
            className="w-full py-7 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/40 active:scale-[0.98] disabled:opacity-30 transition-all text-[13px] flex items-center justify-center gap-4"
          >
            Review Transfer
          </button>
        )}
      </div>

      <div className="bg-blue-600 p-8 rounded-[2.5rem] flex gap-6 items-center shadow-2xl shadow-blue-500/30">
         <span className="text-5xl">💎</span>
         <div>
           <p className="text-[12px] font-black text-white uppercase tracking-widest leading-relaxed mb-1">Moment Reward Active</p>
           <p className="text-xs font-bold text-blue-100 opacity-90 leading-tight">
             You are about to earn <span className="text-white font-black underline decoration-2">25 Points</span> on this transaction.
           </p>
         </div>
      </div>
    </div>
  );
};

// MULTI-ACTION SHARE BUTTON COMPONENT
const ShareActionButton = ({ icon, label, color, onClick, disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-white/10 ${color} shadow-lg tap-scale group transition-all disabled:opacity-50`}
  >
     <span className="text-2xl transition-transform group-hover:scale-110">{icon}</span>
     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/90">{label}</span>
  </button>
);

const ReceiptDetailRow = ({ label, value, isMono = false }: { label: string, value: string, isMono?: boolean }) => (
  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
    <span>{label}</span>
    <span className={`text-slate-900 dark:text-white ${isMono ? 'font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg' : ''}`}>{value}</span>
  </div>
);

export default Transfer;

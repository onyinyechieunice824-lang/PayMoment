
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', icon: '🇺🇸', label: 'ABA Routing' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', icon: '🇬🇧', label: 'Sort Code' },
  { code: 'EU', name: 'European Union', currency: 'EUR', icon: '🇪🇺', label: 'IBAN' },
  { code: 'CN', name: 'China (Alipay/Wire)', currency: 'CNY', icon: '🇨🇳', label: 'Alipay ID' },
  { code: 'CA', name: 'Canada', currency: 'CAD', icon: '🇨🇦', label: 'Transit No.' },
];

const WIRE_FEE = 15.00; // Flat wire fee in selected currency

interface InternationalTransferProps {
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  user: User;
  setUser: (user: User) => void;
}

const InternationalTransfer: React.FC<InternationalTransferProps> = ({ notify, user, setUser }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'selection' | 'details' | 'confirm' | 'success'>('selection');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [iban, setIban] = useState('');
  const [swift, setSwift] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAddress, setBankAddress] = useState('');

  const currentDomBalance = user.balances[selectedCountry.currency as 'USD' | 'GBP'] || 0;
  const numericAmount = parseFloat(amount) || 0;
  const totalCharge = numericAmount + WIRE_FEE;

  const handleTransfer = () => {
    if (totalCharge > currentDomBalance) {
      notify(`Insufficient ${selectedCountry.currency} balance. The total charge is ${selectedCountry.currency} ${totalCharge}.`, "error");
      return;
    }

    const updatedBalances = { ...user.balances };
    updatedBalances[selectedCountry.currency as 'USD' | 'GBP'] -= totalCharge;

    setUser({ ...user, balances: updatedBalances });
    setStep('success');
    notify(`Global Wire of ${selectedCountry.currency} ${numericAmount} initiated.`, "success");
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-8 animate-in zoom-in-95">
        <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-4xl text-white shadow-2xl relative">
           🌍
           <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-ping"></div>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">Wire Processing</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your transfer to {recipientName} has been routed through the SWIFT network. 
            Estimated arrival: <span className="font-bold text-blue-600">24-48 Business Hours</span>.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
           <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
              <span>Network</span>
              <span className="text-slate-900 dark:text-white">SWIFT Interbank</span>
           </div>
           <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
              <span>Reference</span>
              <span className="text-slate-900 dark:text-white">PM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
           </div>
        </div>
        <button onClick={() => navigate('/')} className="w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
      <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors tap-scale">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent italic tracking-tighter leading-none">Global Wire Transfer</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Send foreign currency to bank accounts in 100+ countries.</p>
      </div>

      {step === 'selection' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {COUNTRIES.map(c => (
            <button 
              key={c.code}
              onClick={() => { setSelectedCountry(c); setStep('details'); }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all group flex flex-col items-center gap-3 tap-scale"
            >
              <span className="text-5xl group-hover:scale-110 transition-transform">{c.icon}</span>
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{c.name}</span>
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{c.currency}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          <div className="flex justify-between items-center pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl border border-slate-200 dark:border-transparent">
                {selectedCountry.icon}
              </div>
              <div>
                <span className="font-black italic text-lg leading-none block text-slate-900 dark:text-white">Send {selectedCountry.currency}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Global Outflow Network</span>
              </div>
            </div>
            <button onClick={() => setStep('selection')} className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter hover:underline">Change Region</button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between px-1">
                 <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Transfer Amount ({selectedCountry.currency})</label>
                 <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">Balance: {currentDomBalance.toLocaleString()}</span>
              </div>
              <div className="relative">
                 <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 dark:text-slate-500">$</span>
                 <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-6 pl-10 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-blue-600 text-3xl font-black text-slate-900 dark:text-white transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Beneficiary Credentials</p>
              <TransferInput label="Recipient Full Name" value={recipientName} onChange={setRecipientName} placeholder="Exactly as on Bank ID" />
              <TransferInput label="Bank Name" value={bankName} onChange={setBankName} placeholder="e.g. JPMorgan Chase" />
              <div className="grid grid-cols-2 gap-4">
                <TransferInput label="SWIFT / BIC Code" value={swift} onChange={setSwift} placeholder="XXXXXXXX" />
                <TransferInput label={selectedCountry.label} value={iban} onChange={setIban} placeholder="Details" />
              </div>
              <TransferInput label="Recipient Bank Address" value={bankAddress} onChange={setBankAddress} placeholder="Physical address of recipient bank" />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2rem] border border-blue-200 dark:border-blue-800/50 space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500 dark:text-slate-400">Network Processing Fee</span>
                  <span className="text-slate-900 dark:text-white">{selectedCountry.currency} {WIRE_FEE.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest pt-2 border-t border-blue-200 dark:border-blue-800/50">
                  <span className="text-slate-900 dark:text-white">Total Charge</span>
                  <span className="text-blue-600 dark:text-blue-400">{selectedCountry.currency} {totalCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
            </div>

            <button 
              onClick={handleTransfer}
              disabled={!amount || !recipientName || !iban || !swift || !bankName}
              className="w-full py-5 bg-gradient-to-r from-blue-700 to-purple-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
            >
              Initiate Global Wire
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TransferInput = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">{label}</label>
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
    />
  </div>
);

export default InternationalTransfer;

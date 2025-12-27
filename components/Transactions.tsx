
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, User } from '../types';
import { PayMomentLogo } from '../App';

interface TransactionsProps {
  transactions: Transaction[];
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, user, setUser, notify }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [sharingStatus, setSharingStatus] = useState<'idle' | 'generating'>('idle');
  
  // Wrong Transfer Flow State
  const [resolutionStep, setResolutionStep] = useState<'details' | 'evidence' | 'processing' | 'done'>('details');
  const [isReporting, setIsReporting] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filter === 'all' || t.type === filter;
      
      let matchesDate = true;
      if (startDate || endDate) {
        const txDate = new Date(t.timestamp).getTime();
        const start = startDate ? new Date(startDate).setHours(0,0,0,0) : -Infinity;
        const end = endDate ? new Date(endDate).setHours(23,59,59,999) : Infinity;
        matchesDate = txDate >= start && txDate <= end;
      }
      
      return matchesType && matchesDate;
    });
  }, [transactions, filter, startDate, endDate]);

  const clearFilters = () => {
    setFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const handleShare = async (tx: Transaction, mode: 'link' | 'image' | 'pdf') => {
    const summary = `PayMoment Receipt\nType: ${tx.type.toUpperCase()}\nAmount: ₦${tx.amount.toLocaleString()}\nRef: PM-${tx.id.toUpperCase()}\nDate: ${tx.timestamp}`;
    
    if (mode === 'pdf') {
      window.print();
      return;
    }

    setSharingStatus('generating');
    setTimeout(async () => {
      setSharingStatus('idle');
      
      if (mode === 'link') {
        if (navigator.share) {
          try {
            await navigator.share({ title: 'PayMoment Receipt', text: summary, url: window.location.href });
            notify("Receipt shared!", "success");
          } catch {
            navigator.clipboard.writeText(summary);
            notify("Details copied to clipboard", "info");
          }
        } else {
          navigator.clipboard.writeText(summary);
          notify("Details copied!", "info");
        }
      } else if (mode === 'image') {
        notify("Image receipt optimized and saved.", "success");
      }
    }, 1200);
  };

  const handleReportWrongTransfer = () => {
    if (!selectedTx) return;
    setResolutionStep('processing');
    
    setTimeout(() => {
      if (selectedTx.type === 'debit') {
        setUser(prev => ({
          ...prev,
          transactions: prev.transactions.map(t => 
            t.id === selectedTx.id ? { ...t, status: 'recovery_active' as const, isWrongTransfer: true } : t
          )
        }));
        setResolutionStep('done');
        notify("Case submitted to resolution engine.", "info");
      }
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6 px-1 print:hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors tap-scale">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">Activity Feed</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Real-time ledger of your financial moments.</p>
            </div>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             {['all', 'credit', 'debit'].map((f) => (
               <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-600'}`}
               >
                 {f}
               </button>
             ))}
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-end gap-5 transition-all">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-900 dark:text-slate-400 uppercase tracking-widest px-1">Starting Period</label>
              <div className="relative group">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800/80 px-5 py-4 min-h-[56px] rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm md:text-base font-bold text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-900 dark:text-slate-400 uppercase tracking-widest px-1">Ending Period</label>
              <div className="relative group">
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800/80 px-5 py-4 min-h-[56px] rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm md:text-base font-bold text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm cursor-pointer"
                />
              </div>
            </div>
          </div>
          
          {(startDate || endDate || filter !== 'all') && (
            <button 
              onClick={clearFilters}
              className="w-full md:w-auto text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest px-6 py-4 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border-2 border-rose-200 dark:border-rose-900/30 tap-scale h-[56px]"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="print:hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTransactions.length === 0 ? (
            <div className="p-24 text-center">
               <span className="text-5xl block mb-6 grayscale opacity-30">📂</span>
               <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic text-xs">No entries for this period</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div 
                key={tx.id} 
                onClick={() => { setSelectedTx(tx); setResolutionStep('details'); setIsReporting(false); }} 
                className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all group-hover:scale-110 ${tx.type === 'credit' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {tx.type === 'credit' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white transition-colors text-sm">{tx.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest ${tx.status === 'recovery_active' ? 'bg-amber-100 text-amber-600' : tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {tx.status === 'recovery_active' ? 'Resolving' : tx.category}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tabular-nums">{tx.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black transition-colors ${tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest mt-1">Details →</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RECEIPT MODAL & PRINT CONTAINER */}
      {selectedTx && (
        <div className="print-container fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-t-[3.5rem] md:rounded-[4rem] w-full max-w-lg p-8 md:p-12 shadow-2xl animate-in slide-in-from-bottom-12 duration-500 border-t border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar">
              
              {!isReporting ? (
                <>
                  <div className="no-print flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">Receipt View</h3>
                    <button onClick={() => setSelectedTx(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:rotate-90 transition-transform">×</button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div className="flex flex-col items-center text-center gap-4 mb-10 pb-8 border-b border-dashed border-slate-200 dark:border-slate-800">
                        <PayMomentLogo className="w-20 h-20" idSuffix="receipt-logo" />
                        <div>
                          <h4 className="text-4xl font-black tracking-tighter italic text-blue-700 dark:text-white leading-none">PayMoment</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Official Payment Record</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[2.5rem] flex flex-col items-center gap-2 border border-slate-100 dark:border-slate-800 transition-colors">
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Amount</p>
                        <h5 className={`text-5xl font-black tabular-nums tracking-tighter ${selectedTx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                          {selectedTx.type === 'credit' ? '+' : '-'}₦{selectedTx.amount.toLocaleString()}
                        </h5>
                    </div>

                    <div className="space-y-6 px-4 py-10">
                        <ReceiptRow label="To/From" value={selectedTx.title} />
                        <ReceiptRow label="Category" value={selectedTx.category} />
                        <ReceiptRow label="Time" value={selectedTx.timestamp} />
                        <ReceiptRow label="Ref" value={`PM-${selectedTx.id.toUpperCase()}`} valueClass="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded" />
                    </div>
                  </div>

                  {/* ENHANCED SHARE GRID */}
                  <div className="no-print pt-10 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                       <ShareButton 
                         icon="🔗" 
                         label="Link" 
                         color="bg-blue-600" 
                         onClick={() => handleShare(selectedTx, 'link')} 
                         disabled={sharingStatus === 'generating'}
                       />
                       <ShareButton 
                         icon="🖼️" 
                         label="Image" 
                         color="bg-purple-600" 
                         onClick={() => handleShare(selectedTx, 'image')} 
                         disabled={sharingStatus === 'generating'}
                       />
                       <ShareButton 
                         icon="📄" 
                         label="PDF" 
                         color="bg-emerald-600" 
                         onClick={() => handleShare(selectedTx, 'pdf')} 
                         disabled={sharingStatus === 'generating'}
                       />
                    </div>

                    {sharingStatus === 'generating' && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
                         <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Preparing Asset...</span>
                      </div>
                    )}
                    
                    {selectedTx.type === 'debit' && selectedTx.status === 'completed' && (
                      <button 
                        onClick={() => setIsReporting(true)}
                        className="w-full py-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-rose-100 dark:border-rose-900/30 tap-scale"
                      >
                         ⚠️ Report Wrong Transfer
                      </button>
                    )}

                    <button onClick={() => setSelectedTx(null)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] tap-scale">Close Viewer</button>
                  </div>
                </>
              ) : (
                <div className="no-print space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                   <div className="flex justify-between items-center">
                      <button onClick={() => setIsReporting(false)} className="text-xs font-black text-blue-600 uppercase tracking-widest">← Back</button>
                      <h3 className="text-xl font-black italic tracking-tighter text-rose-600">Shield Resolution</h3>
                      <div className="w-10" />
                   </div>

                   {resolutionStep === 'details' && (
                     <div className="space-y-8">
                        <div className="bg-rose-50 dark:bg-rose-950/20 p-6 rounded-[2rem] border border-rose-100 dark:border-rose-900/30">
                           <h4 className="font-black text-rose-700 dark:text-rose-400 text-sm mb-2 uppercase">Shield Protection</h4>
                           <p className="text-[10px] font-medium text-rose-800 dark:text-rose-300 leading-relaxed uppercase tracking-widest">
                             We attempt instant recovery. If spent, the recipient is blacklisted and funds are swept from future credits.
                           </p>
                        </div>
                        <button 
                          onClick={() => setResolutionStep('done')}
                          className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl"
                        >
                          Initiate Resolution
                        </button>
                     </div>
                   )}

                   {resolutionStep === 'done' && (
                     <div className="py-12 space-y-10 text-center animate-in zoom-in-95">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-4xl shadow-xl">✓</div>
                        <div className="space-y-3">
                           <h4 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">Shield Applied</h4>
                           <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                             The recipient has been restricted. Recovery is in progress.
                           </p>
                        </div>
                        <button 
                          onClick={() => { setSelectedTx(null); setIsReporting(false); }}
                          className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest"
                        >
                          Finish
                        </button>
                     </div>
                   )}
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

const ShareButton = ({ icon, label, color, onClick, disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 ${color} text-white shadow-xl tap-scale group transition-all disabled:opacity-50`}
  >
     <span className="text-2xl transition-transform group-hover:scale-110">{icon}</span>
     <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

const ReceiptRow = ({ label, value, valueClass = "" }: { label: string, value: string, valueClass?: string }) => (
  <div className="flex justify-between items-start gap-6">
     <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0 mt-0.5">{label}</span>
     <span className={`text-xs md:text-sm font-bold text-slate-900 dark:text-white text-right break-all ${valueClass}`}>{value}</span>
  </div>
);

export default Transactions;

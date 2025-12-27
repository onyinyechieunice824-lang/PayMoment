
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
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  // Wrong Transfer Flow State
  const [resolutionStep, setResolutionStep] = useState<'details' | 'evidence' | 'processing' | 'done'>('details');
  const [isReporting, setIsReporting] = useState(false);

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.type === filter);
  }, [transactions, filter]);

  const handleShare = async (tx: Transaction) => {
    const shareData = {
      title: 'PayMoment Transaction Receipt',
      text: `Receipt for my ${tx.type === 'credit' ? 'incoming' : 'outgoing'} payment of ₦${tx.amount.toLocaleString()} on PayMoment. Ref: PM-${tx.id.toUpperCase()}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      notify('Receipt details copied to clipboard!', 'info');
    }
  };

  /**
   * Resolution Logic:
   * Simulates finding the recipient and attempting reversal.
   */
  const handleReportWrongTransfer = () => {
    if (!selectedTx) return;
    setResolutionStep('processing');
    
    setTimeout(() => {
      const amount = selectedTx.amount;
      
      // MOCK LOGIC: We simulate a recipient "Recipient User"
      // If the recipient had funds, we reverse. 
      // If not, we blacklist them (for demo purposes we simulate the 'Recipient' being another mock state or just flag the user if they were the receiver)
      
      if (selectedTx.type === 'debit') {
        // Sender is reporting a wrong transfer they sent
        setUser(prev => {
          const updatedTransactions = prev.transactions.map(t => 
            t.id === selectedTx.id ? { ...t, status: 'recovery_active' as const, isWrongTransfer: true } : t
          );
          
          return {
            ...prev,
            transactions: updatedTransactions
          };
        });
        
        setResolutionStep('done');
        notify("Case submitted! Recovery agents are monitoring the recipient's wallet.", "info");
      }
    }, 2500);
  };

  // Demo helper to trigger "Me being blacklisted" to show the UI
  const simulateBeingRecipientOfWrongTransfer = () => {
    setUser(prev => ({
      ...prev,
      balances: { ...prev.balances, NGN: 0 }, // Drain balance to trigger debt
      debtInfo: {
        isBlacklisted: true,
        totalOwed: 50000,
        owedToId: 'victim_001',
        owedToName: 'Ibrahim Dangote'
      }
    }));
    notify("System Alert: You received a wrong transfer of ₦50k. Your account is restricted until repaid.", "error");
    setSelectedTx(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 print:hidden">
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

        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
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

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors print:border-none print:shadow-none">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTransactions.length === 0 ? (
            <div className="p-24 text-center">
               <span className="text-5xl block mb-6 grayscale opacity-30">📂</span>
               <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic text-xs">No records found</p>
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
                        {tx.status === 'recovery_active' ? 'Recovery in Progress' : tx.category}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tabular-nums">{tx.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black transition-colors ${tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest mt-1">Receipt →</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* REDESIGNED TRANSACTION RECEIPT MODAL WITH RESOLUTION CENTER */}
      {selectedTx && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-t-[3.5rem] md:rounded-[4rem] w-full max-w-lg p-8 md:p-12 shadow-2xl animate-in slide-in-from-bottom-12 duration-500 border-t border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar">
              
              {!isReporting ? (
                <>
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">Transaction Details</h3>
                    <button onClick={() => setSelectedTx(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:rotate-90 transition-transform">×</button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                    <div className="flex flex-col items-center text-center gap-4 mb-10 pb-8 border-b border-dashed border-slate-200 dark:border-slate-800">
                        <PayMomentLogo className="w-20 h-20" />
                        <div>
                          <h4 className="text-4xl font-black tracking-tighter italic text-blue-700 dark:text-white leading-none">PayMoment</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Certified Payment Receipt</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[2.5rem] flex flex-col items-center gap-2 border border-slate-100 dark:border-slate-800 transition-colors relative overflow-hidden">
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Amount Settled</p>
                        <h5 className={`text-5xl font-black tabular-nums tracking-tighter ${selectedTx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                          {selectedTx.type === 'credit' ? '+' : '-'}₦{selectedTx.amount.toLocaleString()}
                        </h5>
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mt-4 border ${selectedTx.status === 'recovery_active' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                          <span>{selectedTx.status === 'recovery_active' ? '⏳ Recovery Processing' : '✓ Verified Successful'}</span>
                        </div>
                    </div>

                    <div className="space-y-6 px-4 py-10">
                        <ReceiptRow label="Beneficiary" value={selectedTx.title} />
                        <ReceiptRow label="Category" value={selectedTx.category} />
                        <ReceiptRow label="Timestamp" value={selectedTx.timestamp} />
                        <ReceiptRow label="Reference No" value={`PM-${selectedTx.id.toUpperCase()}`} valueClass="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded" />
                        <ReceiptRow label="Platform Fee" value="FREE (₦0.00)" valueClass="text-blue-600 dark:text-blue-400 font-black" />
                    </div>
                  </div>

                  <div className="pt-10 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleShare(selectedTx)} className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl text-[10px]">Share Receipt</button>
                        <button onClick={() => setSelectedTx(null)} className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px]">Dismiss</button>
                    </div>
                    
                    {selectedTx.type === 'debit' && selectedTx.status === 'completed' && (
                      <button 
                        onClick={() => setIsReporting(true)}
                        className="w-full py-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-rose-100 dark:border-rose-900/30 flex items-center justify-center gap-2"
                      >
                         ⚠️ Report Wrong Transfer
                      </button>
                    )}

                    {/* Secret Debug Button to trigger being the debtor */}
                    <button 
                      onDoubleClick={simulateBeingRecipientOfWrongTransfer}
                      className="w-full text-[8px] opacity-0 hover:opacity-10 cursor-default"
                    >
                      (Debug: Double-click to simulate being restricted)
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                   <div className="flex justify-between items-center">
                      <button onClick={() => setIsReporting(false)} className="text-xs font-black text-blue-600 uppercase tracking-widest">← Back</button>
                      <h3 className="text-xl font-black italic tracking-tighter text-rose-600">Resolution Center</h3>
                      <div className="w-10" />
                   </div>

                   {resolutionStep === 'details' && (
                     <div className="space-y-8">
                        <div className="bg-rose-50 dark:bg-rose-950/20 p-6 rounded-[2rem] border border-rose-100 dark:border-rose-900/30">
                           <h4 className="font-black text-rose-700 dark:text-rose-400 text-sm mb-2 uppercase">PayMoment Protection</h4>
                           <p className="text-[10px] font-medium text-rose-800 dark:text-rose-300 leading-relaxed uppercase tracking-widest">
                             Our Smart Shield technology attempts to recover funds instantly. 
                             If the recipient has already spent the money, we will **blacklist** their account 
                             and recover funds from their future credits automatically.
                           </p>
                        </div>

                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Reason for Resolution</p>
                           <button className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-rose-200 dark:border-rose-900/30 rounded-2xl text-left flex justify-between items-center group">
                              <span className="font-black text-slate-900 dark:text-white text-sm">Wrong Account Number</span>
                              <span className="text-rose-500">✅</span>
                           </button>
                           <button className="w-full p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-left opacity-40">
                              <span className="font-black text-slate-900 dark:text-white text-sm">Payment Link Error</span>
                           </button>
                        </div>

                        <button 
                          onClick={() => setResolutionStep('evidence')}
                          className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl"
                        >
                          Continue to Proof
                        </button>
                     </div>
                   )}

                   {resolutionStep === 'evidence' && (
                     <div className="space-y-8">
                        <div className="text-center space-y-2">
                           <h4 className="text-lg font-black text-slate-900 dark:text-white leading-none">Submit Evidence</h4>
                           <p className="text-[10px] text-slate-500 uppercase tracking-widest">A screenshot or PDF of the intended recipient</p>
                        </div>

                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-blue-500 transition-all">
                           <span className="text-4xl group-hover:scale-110 transition-transform">📄</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tap to upload Evidence</span>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                           <p className="text-[9px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest leading-relaxed">
                             Note: Filing a false report is a federal offense and will lead to permanent account deactivation.
                           </p>
                        </div>

                        <button 
                          onClick={handleReportWrongTransfer}
                          className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl"
                        >
                          Submit Report
                        </button>
                     </div>
                   )}

                   {resolutionStep === 'processing' && (
                     <div className="py-20 flex flex-col items-center justify-center space-y-8 animate-in fade-in">
                        <div className="relative">
                          <div className="w-20 h-20 border-8 border-rose-600/10 border-t-rose-600 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center font-black text-rose-600 italic">PM</div>
                        </div>
                        <div className="text-center space-y-2">
                           <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none italic tracking-tighter">Shield Scanning Recipient Wallet</h4>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Resolution Node...</p>
                        </div>
                     </div>
                   )}

                   {resolutionStep === 'done' && (
                     <div className="py-12 space-y-10 text-center animate-in zoom-in-95">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-4xl shadow-xl">✓</div>
                        <div className="space-y-3">
                           <h4 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">Shield Applied</h4>
                           <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                             The recipient account has been blacklisted. 
                             Any credit to their wallet will be automatically swept to you until ₦{selectedTx.amount.toLocaleString()} is recovered.
                           </p>
                        </div>
                        <button 
                          onClick={() => { setSelectedTx(null); setResolutionStep('details'); setIsReporting(false); }}
                          className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest"
                        >
                          Close Resolution Center
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

const ReceiptRow = ({ label, value, valueClass = "" }: { label: string, value: string, valueClass?: string }) => (
  <div className="flex justify-between items-start gap-6 group">
     <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0 mt-0.5">{label}</span>
     <span className={`text-xs md:text-sm font-bold text-slate-900 dark:text-white text-right break-all ${valueClass}`}>{value}</span>
  </div>
);

export default Transactions;

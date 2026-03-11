
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Transaction } from '../types';
import { UserAvatar, PayMomentLogo } from '../App';

interface DashboardProps {
  user: User;
  setUser: (user: User) => void;
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  processTransaction: (tx: Transaction, currency: string) => void;
  onSignOut?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, setUser, notify, processTransaction, onSignOut }) => {
  const [showBalance, setShowBalance] = useState(true);
  const [currency, setCurrency] = useState<'NGN' | 'USD' | 'GBP'>('NGN');
  const [showFundModal, setShowFundModal] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const navigate = useNavigate();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const displayedBalance = useMemo(() => {
    return user.balances[currency] || 0;
  }, [user.balances, currency]);

  const handleCardFunding = () => {
    setShowFundModal(false);
    navigate(`/pay/${user.payMomentId}/fund`);
  };

  const handleManualFunding = () => {
    setIsFunding(true);
    setTimeout(() => {
      const amount = 50000;
      const tx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'credit',
        amount,
        title: 'Funding via Bank Transfer',
        category: 'Deposit',
        timestamp: new Date().toLocaleString(),
        status: 'completed'
      };
      processTransaction(tx, 'NGN');
      setIsFunding(false);
      setShowFundModal(false);
      notify(`₦${amount.toLocaleString()} added to your wallet!`, 'success');
    }, 2000);
  };

  const copyAccountNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(user.accountNumber);
    notify("Account number copied!", "success");
  };

  const recentTransactions = useMemo(() => {
    return user.transactions.slice(0, 5);
  }, [user.transactions]);

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      {user.debtInfo?.isBlacklisted && (
        <div className="bg-rose-600 p-6 rounded-[2rem] md:rounded-[2.5rem] text-white animate-in slide-in-from-top-4 duration-500 shadow-xl border-b-4 border-rose-800">
           <div className="flex items-center gap-4">
              <span className="text-3xl md:text-4xl">🚫</span>
              <div className="flex-1">
                 <h4 className="font-black text-sm md:text-lg italic tracking-tight leading-none mb-1 uppercase">Account Restricted</h4>
                 <p className="text-[9px] md:text-[10px] font-bold text-rose-100 uppercase tracking-widest leading-relaxed">
                   Debt: <span className="text-white font-black underline">₦{user.debtInfo.totalOwed.toLocaleString()}</span> owed to {user.debtInfo.owedToName}.
                 </p>
              </div>
              <button onClick={() => navigate('/transactions')} className="bg-white/20 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/30 backdrop-blur-md shrink-0">Resolve</button>
           </div>
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <UserAvatar user={user} className="w-14 h-14 md:w-20 md:h-20 border-4 border-blue-500/20 shrink-0" onClick={() => navigate('/profile')} />
          <div className="min-w-0">
            <p className="text-[9px] md:text-xs text-slate-600 dark:text-slate-400 font-black uppercase tracking-[0.2em] mb-1 truncate">{greeting}</p>
            <h3 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight italic truncate">{user.name}</h3>
            <button onClick={copyAccountNumber} className="mt-2 flex items-center gap-2 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-300 tap-scale">
              <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 tracking-widest">{user.accountNumber}</span>
              <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">Copy</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => navigate('/rewards')} className="hidden xs:flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl tap-scale">
               💎 {user.momentPoints}
            </button>
            <button onClick={onSignOut} className="px-4 py-3 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl tap-scale">OUT</button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <p className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Wallets</p>
          <button onClick={() => navigate('/dom-accounts')} className="text-[9px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Global Hub →</button>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-[2.5rem] md:rounded-[3rem] px-6 py-8 md:p-12 text-white shadow-2xl group">
          <div className="relative z-10 space-y-6 md:space-y-12">
            <div className="flex justify-between items-center gap-4">
              <div className="space-y-4 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/20 w-fit shrink-0">
                    {['NGN', 'USD'].map((curr) => (
                      <button key={curr} onClick={(e) => { e.stopPropagation(); setCurrency(curr as any); }} className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all ${currency === curr ? 'bg-white text-blue-900 shadow-md' : 'text-white/60 hover:text-white'}`}>{curr}</button>
                    ))}
                  </div>
                  <div className="opacity-40 scale-75 origin-left shrink-0"><PayMomentLogo className="w-6 h-6" idSuffix="balance-card" /></div>
                </div>
                <h2 className="text-3xl xs:text-4xl md:text-7xl font-black tracking-tighter flex items-baseline gap-1 tabular-nums truncate leading-none">
                  {showBalance ? (<><span className="text-lg md:text-4xl opacity-40 font-medium italic">{currency === 'NGN' ? '₦' : '$'}</span>{displayedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</>) : '••••••••'}
                </h2>
              </div>
              <button onClick={() => setShowBalance(!showBalance)} className="p-3 md:p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10 shrink-0 shadow-lg active:scale-90">
                <span className="text-xl md:text-2xl">{showBalance ? '👁️' : '🕶️'}</span>
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
              <div className="flex flex-wrap gap-2">
                <div className="bg-white/10 px-4 py-2 rounded-xl text-[8px] font-black tracking-tight backdrop-blur-sm border border-white/10 shrink-0">@{user.payMomentId}</div>
                <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border shrink-0 ${user.debtInfo?.isBlacklisted ? 'bg-rose-500/20 text-rose-300 border-rose-500/20' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20'}`}>
                   {user.debtInfo?.isBlacklisted ? 'Hold' : `Tier ${user.tier}`}
                </div>
              </div>
              <button onClick={() => navigate('/cards')} className="flex items-center gap-3 bg-white/20 px-6 py-3 rounded-2xl hover:bg-white/30 transition-all font-black backdrop-blur-sm border border-white/10 tap-scale w-full md:w-auto justify-center">
                 <span className="text-2xl">💳</span>
                 <span className="text-[10px] uppercase tracking-[0.2em]">Manage Cards</span>
              </button>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-5 rotate-12 scale-150 pointer-events-none"><PayMomentLogo className="w-64 h-64" idSuffix="dashboard-watermark" /></div>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-4 px-1">
        <QuickButton onClick={() => navigate('/transfer')} icon="💸" label="Send" color="bg-blue-600" />
        <QuickButton onClick={() => navigate('/bills')} icon="📱" label="Bills" color="bg-purple-600" />
        <QuickButton onClick={() => navigate('/investments')} icon="📈" label="Invest" color="bg-emerald-600" />
        <QuickButton onClick={() => navigate('/marketplace')} icon="🏪" label="Shop" color="bg-amber-600" />
        <QuickButton onClick={() => navigate('/split-bill')} icon="🤝" label="Split" color="bg-indigo-600" />
        <QuickButton onClick={() => navigate('/receive-global')} icon="🔗" label="PayLinks" color="bg-teal-600" />
        <QuickButton onClick={() => navigate('/qr')} icon="🤳" label="Scan" color="bg-rose-600" />
        <QuickButton onClick={() => setShowFundModal(true)} icon="➕" label="Top Up" color="bg-slate-900 dark:bg-slate-800" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <p className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Activity</p>
          <button onClick={() => navigate('/transactions')} className="text-[9px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest hover:opacity-70">Full History →</button>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.length === 0 ? (
              <div className="p-16 text-center text-slate-400 font-bold italic text-sm">No activity.</div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} onClick={() => navigate('/transactions')} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm transition-all group-hover:scale-110 ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{tx.type === 'credit' ? '↓' : '↑'}</div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 dark:text-white transition-colors text-sm truncate">{tx.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${tx.status === 'recovery_active' ? 'bg-amber-100 text-amber-600' : tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{tx.category}</span>
                        <span className="text-[9px] text-slate-400 font-medium truncate">{tx.timestamp.split(',')[0]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>{tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showFundModal && (
        <div className="fixed-overlay bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md flex items-end md:items-center justify-center">
           <div className="bg-white dark:bg-slate-900 rounded-t-[2.5rem] md:rounded-[3.5rem] w-full max-w-lg p-8 md:p-12 shadow-2xl animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">Add Funds</h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Naira Top Up</p>
                 </div>
                 <button onClick={() => setShowFundModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xl shadow-sm">×</button>
              </div>
              <div className="grid gap-4">
                 <button onClick={handleCardFunding} className="flex items-center justify-between p-6 bg-blue-600 text-white rounded-2xl shadow-xl group tap-scale">
                    <div className="flex items-center gap-4"><span className="text-3xl">💳</span><div className="text-left"><p className="font-black text-base leading-none">Debit Card</p><p className="text-[8px] font-bold text-white/60 uppercase">Instant</p></div></div>
                    <span className="text-xl opacity-40">→</span>
                 </button>
                 <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">
                    <div className="flex items-center gap-4"><span className="text-3xl">🏦</span><div className="text-left"><p className="font-black text-base text-slate-900 dark:text-white leading-none">Bank Transfer</p><p className="text-[8px] font-bold text-slate-500 uppercase">Self Fund</p></div></div>
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 group cursor-pointer" onClick={copyAccountNumber}>
                       <div><p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Account Number</p><p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{user.accountNumber}</p></div>
                       <span className="text-slate-300 text-sm">📋</span>
                    </div>
                 </div>
              </div>
              <div className="mt-8 space-y-3">
                <button onClick={handleManualFunding} disabled={isFunding} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[9px] disabled:opacity-50">{isFunding ? 'Syncing...' : 'Demo: Simulate ₦50k'}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const QuickButton = ({ onClick, icon, label, color }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1.5 p-3 xs:p-3.5 ${color} rounded-2xl shadow-lg tap-scale active:scale-90`}>
    <div className="text-lg xs:text-xl">{icon}</div>
    <span className="text-[7px] xs:text-[8px] font-black text-white uppercase tracking-widest text-center leading-none truncate w-full">{label}</span>
  </button>
);

export default Dashboard;

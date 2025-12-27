
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Transaction } from '../types';
import { UserAvatar } from '../App';

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
      {/* Blacklist / Debt Warning Banner */}
      {user.debtInfo?.isBlacklisted && (
        <div className="bg-rose-600 p-6 rounded-[2.5rem] text-white animate-in slide-in-from-top-4 duration-500 shadow-xl shadow-rose-200 dark:shadow-none border-b-4 border-rose-800">
           <div className="flex items-center gap-4">
              <span className="text-4xl">🚫</span>
              <div className="flex-1">
                 <h4 className="font-black text-lg italic tracking-tight leading-none mb-1 uppercase">Account Restricted</h4>
                 <p className="text-[10px] font-bold text-rose-100 uppercase tracking-widest leading-relaxed">
                   Your account is on blacklist due to an unreturned wrong transfer. 
                   Debt: <span className="text-white font-black underline decoration-2">₦{user.debtInfo.totalOwed.toLocaleString()}</span> owed to {user.debtInfo.owedToName}.
                 </p>
              </div>
              <button 
                onClick={() => navigate('/transactions')}
                className="bg-white/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/30 backdrop-blur-md"
              >
                Resolution Hub
              </button>
           </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <UserAvatar 
            user={user} 
            className="w-16 h-16 md:w-20 md:h-20 border-4 border-blue-500/20" 
            onClick={() => navigate('/profile')}
          />
          <div>
            <p className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400 font-black uppercase tracking-[0.2em] mb-1">{greeting}</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight italic">{user.name}</h3>
            <button 
              onClick={copyAccountNumber}
              className="mt-2 flex items-center gap-2 bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all tap-scale group"
            >
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 tracking-widest">{user.accountNumber}</span>
              <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => navigate('/rewards')} className="hidden sm:flex items-center gap-2 px-5 py-3.5 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl tap-scale transition-all hover:bg-purple-700">
               💎 {user.momentPoints}
            </button>
            <button 
              onClick={onSignOut} 
              className="px-6 py-3.5 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-rose-700 transition-all active:scale-95 tap-scale"
            >
               LOGOUT
            </button>
        </div>
      </div>

      {/* QUICK ACCESS BAR */}
      <div className="flex md:grid md:grid-cols-8 gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
        <QuickButton onClick={() => navigate('/transfer')} icon="💸" label="Send" color="bg-blue-600" />
        <QuickButton onClick={() => navigate('/bills')} icon="📱" label="Bills" color="bg-purple-600" />
        <QuickButton onClick={() => navigate('/investments')} icon="📈" label="Invest" color="bg-emerald-600" />
        <QuickButton onClick={() => navigate('/marketplace')} icon="🏪" label="Shop" color="bg-amber-600" />
        <QuickButton onClick={() => navigate('/split-bill')} icon="🤝" label="Split" color="bg-indigo-600" />
        <QuickButton onClick={() => navigate('/receive-global')} icon="🔗" label="PayLinks" color="bg-teal-600" />
        <QuickButton onClick={() => navigate('/qr')} icon="🤳" label="Scan" color="bg-rose-600" />
        <QuickButton onClick={() => setShowFundModal(true)} icon="➕" label="Top Up" color="bg-slate-900 dark:bg-slate-800" />
      </div>

      {/* Balance Card Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Premium Wallets</p>
          <button onClick={() => navigate('/dom-accounts')} className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest hover:opacity-70 transition-opacity">Explore Global Hub →</button>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl transition-all group">
          <div className="relative z-10 space-y-8 md:space-y-12">
            <div className="flex justify-between items-start">
              <div className="space-y-5">
                <div className="flex bg-white/10 p-1 rounded-2xl backdrop-blur-md border border-white/20 w-fit">
                  {['NGN', 'USD'].map((curr) => (
                    <button 
                      key={curr}
                      onClick={(e) => { e.stopPropagation(); setCurrency(curr as any); }}
                      className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all tap-scale ${currency === curr ? 'bg-white text-blue-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter flex items-baseline gap-2 tabular-nums">
                  {showBalance 
                    ? (
                      <>
                        <span className="text-2xl md:text-4xl opacity-40 font-medium italic">{currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : '£'}</span>
                        {displayedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </>
                    )
                    : '••••••••'}
                </h2>
              </div>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="p-4 bg-white/10 rounded-3xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10 tap-scale"
              >
                {showBalance ? '👁️' : '🕶️'}
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                <div className="bg-white/10 px-5 py-3 rounded-2xl text-[10px] font-black tracking-tight backdrop-blur-sm border border-white/10">ID: @{user.payMomentId}</div>
                <div className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${user.debtInfo?.isBlacklisted ? 'bg-rose-500/20 text-rose-300 border-rose-500/20' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20'}`}>
                   {user.debtInfo?.isBlacklisted ? 'System Hold Active' : `Tier ${user.tier} Synchronized`}
                </div>
              </div>
              <button onClick={() => navigate('/cards')} className="flex items-center gap-4 bg-white/20 px-8 py-4 rounded-[2rem] hover:bg-white/30 transition-all font-black backdrop-blur-sm border border-white/10 tap-scale">
                 <span className="text-3xl">💳</span>
                 <span className="text-xs uppercase tracking-[0.2em]">Moment Cards</span>
              </button>
            </div>
          </div>
          <div className="absolute top-[-40px] right-[-40px] w-96 h-96 bg-white/10 rounded-full blur-[120px] group-hover:scale-110 transition-transform duration-1000"></div>
        </div>
      </div>

      {/* Transaction History Preview */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Recent Activity</p>
          <button onClick={() => navigate('/transactions')} className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest hover:opacity-70 transition-opacity">View Full History →</button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.length === 0 ? (
              <div className="p-16 text-center text-slate-400 font-bold italic text-sm">Your financial timeline is empty.</div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} onClick={() => navigate('/transactions')} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all group-hover:scale-110 ${tx.type === 'credit' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {tx.type === 'credit' ? '↓' : '↑'}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white transition-colors text-sm">{tx.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest ${tx.status === 'recovery_active' ? 'bg-amber-100 text-amber-600' : tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          {tx.status === 'recovery_active' ? 'Wrong Transfer Recovery' : tx.category}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{tx.timestamp.split(',')[0]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-black transition-colors ${tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </p>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${tx.status === 'recovery_active' ? 'text-amber-500' : 'text-slate-400'}`}>
                      {tx.status === 'recovery_active' ? 'Pending' : 'Success'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fund Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-t-[3rem] md:rounded-[3.5rem] w-full max-w-lg p-8 md:p-12 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">Add Money</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Fund your Naira moment</p>
                 </div>
                 <button onClick={() => setShowFundModal(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-2xl tap-scale transition-transform hover:rotate-90">×</button>
              </div>

              <div className="grid gap-4">
                 <button 
                  onClick={handleCardFunding}
                  className="flex items-center justify-between p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-xl tap-scale group"
                 >
                    <div className="flex items-center gap-6">
                       <span className="text-4xl group-hover:rotate-12 transition-transform">💳</span>
                       <div className="text-left">
                          <p className="font-black text-lg leading-none mb-1">Debit Card</p>
                          <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Instant Gateway</p>
                       </div>
                    </div>
                    <span className="text-2xl opacity-40">→</span>
                 </button>

                 <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 space-y-6">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-6">
                          <span className="text-4xl">🏦</span>
                          <div className="text-left">
                             <p className="font-black text-lg text-slate-900 dark:text-white leading-none mb-1">Bank Transfer</p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instant settlement</p>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 group cursor-pointer" onClick={copyAccountNumber}>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PayMoment Account</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-widest tabular-nums">{user.accountNumber}</p>
                       </div>
                       <span className="text-slate-300 group-hover:text-blue-600 transition-colors">📋</span>
                    </div>
                 </div>
              </div>

              <div className="mt-10 space-y-4">
                <button 
                  onClick={handleManualFunding}
                  disabled={isFunding}
                  className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] tap-scale disabled:opacity-50"
                >
                  {isFunding ? 'Simulating Incoming Wire...' : 'Demo: Simulate ₦50k Transfer'}
                </button>
                <button 
                  onClick={() => setShowFundModal(false)}
                  className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  Back to Wallet
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const QuickButton = ({ onClick, icon, label, color }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1.5 p-3.5 min-w-[75px] md:min-w-0 ${color} rounded-2xl shadow-lg tap-scale group shrink-0`}>
    <div className="text-xl transition-transform group-hover:-translate-y-1">{icon}</div>
    <span className="text-[8px] font-black text-white uppercase tracking-widest text-center leading-none">{label}</span>
  </button>
);

export default Dashboard;


import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import VirtualCards from './components/VirtualCards';
import Transactions from './components/Transactions';
import Savings from './components/Savings';
import Transfer from './components/Transfer';
import InternationalTransfer from './components/InternationalTransfer';
import DomiciliaryAccounts from './components/DomiciliaryAccounts';
import CurrencySwap from './components/CurrencySwap';
import WithdrawToNaira from './components/WithdrawToNaira';
import Referrals from './components/Referrals';
import Bills from './components/Bills';
import QRCode from './components/QRCode';
import Profile from './components/Profile';
import VerificationCenter from './components/VerificationCenter';
import BiometricOverlay from './components/BiometricOverlay';
import AuthFlow from './components/AuthFlow';
import AccountDetails from './components/AccountDetails';
import ReceiveGlobal from './components/ReceiveGlobal';
import PaymentCheckout from './components/PaymentCheckout';
import Rewards from './components/Rewards';
import Investments from './components/Investments';
import SplitBill from './components/SplitBill';
import Marketplace from './components/Marketplace';
import { User, Transaction } from './types';

interface Notification {
  message: string;
  type: 'success' | 'info' | 'error';
}

const STORAGE_KEY = 'paymoment_user_data';
const LOGIN_KEY = 'paymoment_is_logged_in';

export const PayMomentLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={className}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      <defs>
        <linearGradient id="pmLogoGradient" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="28" fill="url(#pmLogoGradient)" />
      <text 
        x="50%" 
        y="50%" 
        dominantBaseline="central" 
        textAnchor="middle" 
        fill="white" 
        style={{ 
          fontFamily: 'Inter, sans-serif', 
          fontWeight: 900, 
          fontSize: '44px',
          fontStyle: 'italic',
          letterSpacing: '-0.05em'
        }}
      >
        PM
      </text>
      <path 
        d="M20 75C20 80 25 80 30 75L50 55L70 75C75 80 80 80 80 75" 
        stroke="white" 
        strokeOpacity="0.2" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
    </svg>
  </div>
);

export const UserAvatar = ({ user, className = "w-10 h-10", onClick }: { user: User, className?: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`relative shrink-0 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-md transition-all tap-scale cursor-pointer ${className}`}>
    {user.profilePicture ? (
      <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-xs md:text-sm">
        {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'PM'}
      </div>
    )}
  </div>
);

const AppContent: React.FC<{ 
  user: User, 
  setUser: React.Dispatch<React.SetStateAction<User>>,
  isDarkMode: boolean,
  toggleDarkMode: () => void,
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void,
  processTransaction: (tx: Transaction, currency: string) => void,
  onSignOut: () => void,
  onReset: () => void
}> = ({ user, setUser, isDarkMode, toggleDarkMode, notify, processTransaction, onSignOut, onReset }) => {
  const location = useLocation();
  const isPublicPath = location.pathname.startsWith('/pay/');

  if (isPublicPath) {
    return (
      <Routes>
        <Route path="/pay/:payId/:slug" element={<PaymentCheckout user={user} processTransaction={processTransaction} notify={notify} />} />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <nav className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 z-50 transition-all">
        <div className="p-8 flex items-center gap-3">
          <PayMomentLogo className="w-10 h-10" />
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent italic tracking-tighter">
            PayMoment
          </h1>
        </div>
        
        <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto no-scrollbar">
          <SidebarItem to="/" label="Dashboard" icon="🏠" />
          <SidebarItem to="/marketplace" label="Marketplace" icon="🏪" />
          <SidebarItem to="/transfer" label="Transfers" icon="💸" />
          <SidebarItem to="/cards" label="Cards" icon="💳" />
          <SidebarItem to="/transactions" label="History" icon="🧾" />
          <SidebarItem to="/dom-accounts" label="Global Hub" icon="🏦" />
          <SidebarItem to="/savings" label="Savings" icon="💰" />
          <SidebarItem to="/ai-assistant" label="PayAI" icon="✨" />
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <UserAvatar user={user} className="w-10 h-10" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user.payMomentId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleDarkMode} className="flex-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 tap-scale">
               {isDarkMode ? '🌞' : '🌙'}
            </button>
            <button onClick={onSignOut} className="px-4 py-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/20 font-black text-[9px] uppercase tracking-widest tap-scale">Logout</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 min-h-screen flex flex-col">
        <header className="md:hidden flex items-center justify-between p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
           <div className="flex items-center gap-2">
              <PayMomentLogo className="w-8 h-8" />
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent italic tracking-tighter">PayMoment</h1>
           </div>
           <NavLink to="/profile" className="tap-scale">
             <UserAvatar user={user} className="w-10 h-10" />
           </NavLink>
        </header>

        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto flex-1 w-full page-fade-in">
          <Routes>
            <Route path="/" element={<Dashboard user={user} setUser={setUser} notify={notify} processTransaction={processTransaction} onSignOut={onSignOut} />} />
            <Route path="/rewards" element={<Rewards user={user} setUser={setUser} notify={notify} />} />
            <Route path="/investments" element={<Investments user={user} setUser={setUser} notify={notify} processTransaction={processTransaction} />} />
            <Route path="/split-bill" element={<SplitBill user={user} notify={notify} />} />
            <Route path="/marketplace" element={<Marketplace user={user} setUser={setUser} notify={notify} processTransaction={processTransaction} />} />
            <Route path="/account-details" element={<AccountDetails user={user} notify={notify} />} />
            <Route path="/receive-global" element={<ReceiveGlobal user={user} setUser={setUser} notify={notify} />} />
            <Route path="/dom-accounts" element={<DomiciliaryAccounts user={user} setUser={setUser} notify={notify} />} />
            <Route path="/swap" element={<CurrencySwap user={user} setUser={setUser} notify={notify} />} />
            <Route path="/transfer" element={<Transfer notify={notify} user={user} setUser={setUser} processTransaction={processTransaction} />} />
            <Route path="/global-transfer" element={<InternationalTransfer notify={notify} user={user} setUser={setUser} />} />
            <Route path="/verification" element={<VerificationCenter user={user} setUser={setUser} notify={notify} />} />
            <Route path="/bills" element={<Bills notify={notify} processTransaction={processTransaction} />} />
            <Route path="/qr" element={<QRCode />} />
            <Route path="/ai-assistant" element={<AIAssistant transactions={user.transactions} />} />
            <Route path="/cards" element={<VirtualCards user={user} setUser={setUser} processTransaction={processTransaction} />} />
            <Route path="/transactions" element={<Transactions transactions={user.transactions} user={user} setUser={setUser} notify={notify} />} />
            <Route path="/savings" element={<Savings user={user} setUser={setUser} processTransaction={processTransaction} />} />
            <Route path="/referrals" element={<Referrals user={user} />} />
            <Route path="/profile" element={<Profile user={user} setUser={setUser} notify={notify} onSignOut={onSignOut} onReset={onReset} />} />
          </Routes>
        </div>
        
        <div className="h-24 md:hidden" />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-around py-3 z-50 safe-area-bottom">
        <BottomNavItem to="/" label="Home" icon="🏠" />
        <BottomNavItem to="/marketplace" label="Shop" icon="🏪" />
        <BottomNavItem to="/transfer" label="Send" icon="💸" />
        <BottomNavItem to="/cards" label="Cards" icon="💳" />
        <BottomNavItem to="/profile" label="More" icon="⚙️" />
      </nav>
    </div>
  );
}

const App: React.FC = () => {
  const [isRegistered, setIsRegistered] = useState(() => !!localStorage.getItem(STORAGE_KEY));
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem(LOGIN_KEY) === 'true');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      name: '',
      phoneNumber: '',
      payMomentId: '',
      balances: { 'NGN': 0, 'USD': 0, 'GBP': 0 },
      accountNumber: '',
      tier: 1,
      verification: { bvn: false, nin: false, address: false, facialMatch: false },
      transactions: [],
      beneficiaries: [],
      paymentLinks: [],
      momentPoints: 50,
      investments: [],
      badges: [],
      debtInfo: { isBlacklisted: false, totalOwed: 0, owedToId: '', owedToName: '' }
    };
  });

  useEffect(() => {
    if (isRegistered) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }, [user, isRegistered]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const notify = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  /**
   * Enhanced processTransaction with Debt Recovery (Auto-Sweep)
   */
  const processTransaction = useCallback((tx: Transaction, currency: string = 'NGN') => {
    setUser(prev => {
      let updatedUser = { ...prev };
      const updatedBalances = { ...prev.balances };
      
      // Debit logic
      if (tx.type === 'debit') {
        updatedBalances[currency] -= tx.amount;
      } 
      // Credit logic with Auto-Sweep for Debtors
      else {
        if (currency === 'NGN' && prev.debtInfo?.isBlacklisted && prev.debtInfo.totalOwed > 0) {
          const sweepAmount = Math.min(tx.amount, prev.debtInfo.totalOwed);
          
          // Deduct from the credit and apply to debt
          updatedBalances[currency] += (tx.amount - sweepAmount);
          
          const updatedDebt = prev.debtInfo.totalOwed - sweepAmount;
          updatedUser.debtInfo = {
            ...prev.debtInfo,
            totalOwed: updatedDebt,
            isBlacklisted: updatedDebt > 0 // Un-blacklist if debt is cleared
          };

          // Record a system transaction for the recovery
          const recoveryTx: Transaction = {
            id: `recovery-${Math.random().toString(36).substr(2, 5)}`,
            type: 'debit',
            amount: sweepAmount,
            title: `Auto-Recovery for ${prev.debtInfo.owedToName}`,
            category: 'Debt Settlement',
            timestamp: new Date().toLocaleString(),
            status: 'completed'
          };
          updatedUser.transactions = [recoveryTx, tx, ...prev.transactions];
          
          // Log notification locally
          setTimeout(() => notify(`₦${sweepAmount.toLocaleString()} swept to clear your debt.`, 'info'), 100);
        } else {
          updatedBalances[currency] += tx.amount;
          updatedUser.transactions = [tx, ...prev.transactions];
        }
      }

      return {
        ...updatedUser,
        balances: updatedBalances,
        momentPoints: prev.momentPoints + Math.floor(tx.amount / 1000)
      };
    });
  }, [notify]);

  const handleRegister = (name: string, id: string, phone: string) => {
    const newUser: User = {
      ...user,
      name,
      phoneNumber: phone,
      payMomentId: id,
      accountNumber: phone.slice(-10),
      balances: { 'NGN': 5000, 'USD': 0, 'GBP': 0 },
      transactions: [{
        id: 'bonus', type: 'credit', amount: 5000, title: 'Welcome Bonus', category: 'Reward', timestamp: new Date().toLocaleString(), status: 'completed'
      }]
    };
    setUser(newUser);
    setIsRegistered(true);
    setIsLoggedIn(true);
    localStorage.setItem(LOGIN_KEY, 'true');
    notify("Welcome to PayMoment!", "success");
  };

  const handleSignIn = (email: string) => {
    if (!user.name) {
      setUser({
        ...user,
        name: 'Tobi Adebayor',
        payMomentId: 'tobi_pay',
        phoneNumber: '08012345678',
        accountNumber: '1234567890',
        balances: { 'NGN': 125000, 'USD': 45.50, 'GBP': 0 },
        transactions: [
           { id: '1', type: 'credit', amount: 125000, title: 'Mock Account Sync', category: 'System', timestamp: new Date().toLocaleString(), status: 'completed' }
        ]
      });
    }
    
    setIsRegistered(true);
    setIsLoggedIn(true);
    localStorage.setItem(LOGIN_KEY, 'true');
    notify("Authenticated successfully.", "success");
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setIsRegistered(false);
    localStorage.setItem(LOGIN_KEY, 'false');
    notify("Signed out successfully.", "info");
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (!isRegistered) {
    return <AuthFlow onRegister={handleRegister} onSignIn={handleSignIn} isDarkMode={isDarkMode} />;
  }

  if (!isLoggedIn && !window.location.hash.includes('/pay/')) {
    return <BiometricOverlay onAuthenticated={() => {
        setIsLoggedIn(true);
        localStorage.setItem(LOGIN_KEY, 'true');
    }} isDarkMode={isDarkMode} userName={user.name || 'User'} user={user} />;
  }

  return (
    <HashRouter>
      <div className={isDarkMode ? 'dark' : ''}>
        {notification && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-in slide-in-from-top-4">
            <div className={`px-6 py-4 rounded-3xl shadow-2xl border ${
              notification.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 
              notification.type === 'error' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-indigo-700 border-indigo-600 text-white'
            }`}>
              <p className="font-bold text-sm">{notification.message}</p>
            </div>
          </div>
        )}
        <AppContent 
          user={user} 
          setUser={setUser} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
          notify={notify} 
          processTransaction={processTransaction}
          onSignOut={handleSignOut}
          onReset={handleReset}
        />
      </div>
    </HashRouter>
  );
};

const SidebarItem = ({ to, label, icon }: { to: string, label: string, icon: string }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all tap-scale ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
    <span className="text-xl">{icon}</span>
    <span className="text-sm font-bold">{label}</span>
  </NavLink>
);

const BottomNavItem = ({ to, label, icon }: { to: string, label: string, icon: string }) => (
  <NavLink to={to} className={({ isActive }) => `flex flex-col items-center gap-1 transition-all tap-scale ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
    <span className="text-2xl">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
  </NavLink>
);

export default App;

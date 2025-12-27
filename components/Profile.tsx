
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { UserAvatar } from '../App';

interface ProfileProps {
  user: User;
  setUser: (user: User) => void;
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onSignOut: () => void;
  onReset: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

const TIER_BENEFITS = [
  { level: 1, name: 'Basic', limit: '₦50,000' },
  { level: 2, name: 'Advanced', limit: '₦500,000' },
  { level: 3, name: 'Premium', limit: '₦10,000,000' },
];

const Profile: React.FC<ProfileProps> = ({ user, setUser, notify, onSignOut, onReset, isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    notify("Copied to clipboard!", "success");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, profilePicture: reader.result as string });
        notify("Profile picture updated!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors tap-scale">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
      </button>

      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          <UserAvatar user={user} className="w-28 h-28 md:w-36 md:h-36 border-4 border-white dark:border-slate-800 ring-4 ring-blue-500/20" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 w-10 h-10 bg-blue-600 text-white rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-lg tap-scale"
          >
            📸
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            className="hidden" 
            accept="image/*" 
          />
        </div>
        <div className="text-center">
           <h2 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">{user.name}</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mt-1">@{user.payMomentId} • Tier {user.tier} Verified</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
            <h3 className="font-black text-lg text-slate-900 dark:text-white italic tracking-tight">Financial Identity</h3>
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                 <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-slate-900 dark:text-white tracking-widest tabular-nums">{user.accountNumber}</span>
                    <button 
                      onClick={() => handleCopy(user.accountNumber)}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl tap-scale"
                    >
                      Copy
                    </button>
                 </div>
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Partner Bank</p>
                 <span className="text-sm font-bold text-slate-900 dark:text-white">PayMoment Bank (Wema)</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
             <div className="flex justify-between items-center">
                <h3 className="font-black text-lg text-slate-900 dark:text-white italic tracking-tight">Trust Level</h3>
                <button onClick={() => navigate('/verification')} className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Upgrade →</button>
             </div>
             <div className="space-y-4">
                {TIER_BENEFITS.map((tier, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border transition-all ${idx + 1 === user.tier ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60'}`}>
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Level {tier.level}</span>
                        {user.tier >= tier.level && <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full uppercase tracking-widest">Verified</span>}
                     </div>
                     <div className="flex justify-between items-end">
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">{tier.name}</p>
                          <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Daily Outflow</p>
                        </div>
                        <p className="font-black text-blue-600 dark:text-blue-400 text-sm">{tier.limit}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
              <h3 className="font-black text-lg text-slate-900 dark:text-white italic tracking-tight">Appearance & Security</h3>
              <div className="space-y-2">
                 {toggleDarkMode && (
                   <SecurityItem 
                     icon={isDarkMode ? '🌞' : '🌙'} 
                     label="Dark Mode" 
                     checked={isDarkMode} 
                     onClick={toggleDarkMode}
                   />
                 )}
                 <SecurityItem icon="🔑" label="Transaction PIN" />
                 <SecurityItem icon="📵" label="Biometric Link" />
                 <SecurityItem icon="🛡️" label="Fraud Protection" status="Active" />
              </div>
           </div>

           <div className="space-y-4">
             <button 
               onClick={onSignOut}
               className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl tap-scale"
             >
               LOGOUT
             </button>
             <button 
               onClick={onReset}
               className="w-full py-5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-[2rem] font-black uppercase tracking-widest text-[9px] border border-rose-100 dark:border-rose-900/30 tap-scale"
             >
               WIPE ALL DATA
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const SecurityItem = ({ icon, label, checked, status, onClick }: { icon: string, label: string, checked?: boolean, status?: string, onClick?: () => void }) => (
  <div 
    className="flex items-center justify-between py-3.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-xl transition-colors cursor-pointer group"
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
       <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
       <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</span>
    </div>
    {checked !== undefined ? (
      <div className={`w-10 h-5 rounded-full p-1 transition-all ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
         <div className={`w-3 h-3 bg-white rounded-full transition-all ${checked ? 'translate-x-5' : ''}`}></div>
      </div>
    ) : (
      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{status || '→'}</span>
    )}
  </div>
);

export default Profile;

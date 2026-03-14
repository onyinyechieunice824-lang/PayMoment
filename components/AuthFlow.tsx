
import React, { useState, useRef } from 'react';
import { PayMomentLogo } from '../App';
import { signInWithPopup, auth, googleProvider } from '../src/firebase';

interface AuthFlowProps {
  onRegister: (name: string, id: string, phone: string, pin: string) => void;
  onSignIn: (email: string) => void;
  isDarkMode: boolean;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onRegister, onSignIn, isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'landing' | 'register' | 'login'>('landing');
  
  // Registration state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regUsername, setRegUsername] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      // App.tsx handles the state change
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (!regName || !regUsername || !regPhone || regPin.length !== 4) {
      setError("Please fill all fields correctly. PIN must be 4 digits.");
      return;
    }
    setLoading(true);
    // Simulate registration delay
    setTimeout(() => {
      onRegister(regName, regUsername, regPhone, regPin);
      setLoading(false);
    }, 1500);
  };

  if (view === 'register') {
    return (
      <div className={`fixed inset-0 z-[150] flex flex-col overflow-y-auto no-scrollbar transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-900'}`}>
        <div className="relative flex-1 flex items-center justify-center p-6 min-h-full">
          <div className="w-full max-w-md space-y-8 py-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black italic tracking-tighter text-white">Create Account</h2>
              <p className="text-blue-400 font-bold uppercase tracking-widest text-[9px]">Join the Moment</p>
            </div>

            <div className="space-y-4">
              <AuthInput label="Full Name" value={regName} onChange={setRegName} placeholder="John Doe" />
              <AuthInput label="PayMoment ID" value={regUsername} onChange={setRegUsername} placeholder="username" prefix="@" />
              <AuthInput label="Phone Number" value={regPhone} onChange={setRegPhone} placeholder="08012345678" />
              <AuthInput label="Transaction PIN" value={regPin} onChange={setRegPin} placeholder="••••" type="password" />
              
              {error && <p className="text-rose-500 text-[10px] font-bold uppercase text-center">{error}</p>}

              <button 
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-sm flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Create My Account'}
              </button>
              
              <button onClick={() => setView('landing')} className="w-full text-slate-500 font-black uppercase tracking-widest text-[10px]">Back</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[150] flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-900'}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-full h-full bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-6 min-h-full">
        <div className="w-full max-w-md py-4 md:py-8 space-y-8">
          
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="space-y-4">
              <div className="flex justify-center">
                <PayMomentLogo className="w-28 h-28 md:w-36 md:h-36" />
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">PayMoment</h1>
                <p className="text-blue-400 font-bold uppercase tracking-[0.4em] text-[9px]">Premium Nigerian Wealth Hub</p>
              </div>
            </div>
            
            <div className="grid gap-3 text-left">
              <Feature icon="⚡" title="Real-time Banking" desc="Transfers settle in under 2 seconds." />
              <Feature icon="🌎" title="Global Wallet" desc="Receive USD and GBP accounts instantly." />
              <Feature icon="🛡️" title="Bank-Grade Security" desc="Secured by Google Authentication." />
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold">
                {error}
              </div>
            )}

            <div className="space-y-4 pt-4">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-6 bg-white text-slate-950 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-sm flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <button 
                onClick={() => setView('register')}
                className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-sm"
              >
                Create Account
              </button>

              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                By continuing, you agree to our Terms of Service.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="flex gap-5 items-center p-4 bg-white/5 border border-white/10 rounded-3xl">
    <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center text-xl shrink-0">{icon}</div>
    <div>
      <h4 className="font-bold text-white text-[13px]">{title}</h4>
      <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
    </div>
  </div>
);

const AuthInput = ({ label, value, onChange, placeholder, prefix, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-500">{prefix}</span>}
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-6 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-blue-500 transition-all text-white font-bold placeholder:text-white/10 ${prefix ? 'pl-12' : ''}`}
      />
    </div>
  </div>
);

export default AuthFlow;

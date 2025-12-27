
import React, { useState } from 'react';
import { PayMomentLogo } from '../App';

interface AuthFlowProps {
  onRegister: (name: string, id: string, phone: string) => void;
  onSignIn: (email: string) => void;
  isDarkMode: boolean;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onRegister, onSignIn, isDarkMode }) => {
  const [step, setStep] = useState<'welcome' | 'signup' | 'login' | 'pin'>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [payId, setPayId] = useState('');
  const [pin, setPin] = useState('');

  const handleNext = () => {
    if (step === 'welcome') setStep('signup');
    else if (step === 'signup') setStep('pin');
    else if (step === 'login') onSignIn(email);
    else if (step === 'pin' && pin.length === 4) onRegister(name, payId, phone);
  };

  const goBack = () => setStep('welcome');

  return (
    <div className={`fixed inset-0 z-[150] flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-900'}`}>
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-full h-full bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation Header - Simplified to prevent blur-overlap */}
      {step !== 'welcome' && (
        <header className="sticky top-0 z-50 p-6 flex items-center justify-between">
          <button 
            onClick={goBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white tap-scale transition-all hover:bg-white/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[11px] font-black uppercase tracking-widest">Back</span>
          </button>
          <PayMomentLogo className="w-10 h-10" />
          <div className="w-20" /> 
        </header>
      )}

      <div className="relative flex-1 flex items-start justify-center p-6 min-h-full">
        <div className="w-full max-w-md py-4 md:py-8 space-y-8">
          
          {/* STEP 1: WELCOME SCREEN */}
          {step === 'welcome' && (
            <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="space-y-4">
                <div className="flex justify-center">
                  {/* REMOVED: problematic drop-shadow that caused blur during scroll */}
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
              </div>

              <div className="space-y-4 pt-4">
                <button 
                  onClick={() => setStep('signup')}
                  className="w-full py-6 bg-white text-slate-950 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-sm"
                >
                  Create New Account
                </button>
                <button 
                  onClick={() => setStep('login')}
                  className="w-full py-6 bg-blue-600/20 text-blue-400 rounded-[2.5rem] font-black uppercase tracking-widest text-sm border-2 border-blue-500/30 hover:bg-blue-600/30 transition-all"
                >
                  Login to My Account
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SIGNUP FORM */}
          {step === 'signup' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tight italic">Join PayMoment</h2>
                <p className="text-slate-400 text-sm font-medium">Get your free account in 2 minutes.</p>
              </div>

              <div className="space-y-4">
                <AuthInput label="Full Name" value={name} onChange={setName} placeholder="Enter Legal Name" />
                <AuthInput label="Phone Number" value={phone} onChange={(v: string) => setPhone(v.replace(/\D/g, ''))} placeholder="08012345678" type="tel" />
                <AuthInput label="Email Address" value={email} onChange={setEmail} placeholder="john@example.com" type="email" />
                <AuthInput label="PayMoment ID" value={payId} onChange={setPayId} placeholder="tobi_pay" prefix="@" />
              </div>

              <button 
                onClick={handleNext}
                disabled={!name || !email || !payId || phone.length < 10}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all active:scale-95"
              >
                Proceed to Security
              </button>
            </div>
          )}

          {/* STEP 3: LOGIN FORM */}
          {step === 'login' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tight italic">Welcome Back</h2>
                <p className="text-slate-400 text-sm font-medium">Sign in to your global wealth hub.</p>
              </div>

              <div className="space-y-6">
                <AuthInput label="Email or PayID" value={email} onChange={setEmail} placeholder="john@example.com" />
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
                   <p className="text-[11px] font-bold text-blue-300 uppercase tracking-widest leading-relaxed">
                     Enter your registered email to receive a secure login link.
                   </p>
                </div>
              </div>

              <button 
                onClick={handleNext}
                disabled={!email}
                className="w-full py-6 bg-white text-slate-950 rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all active:scale-95"
              >
                Continue to Secure Login
              </button>
            </div>
          )}

          {/* STEP 4: PIN SETUP */}
          {step === 'pin' && (
            <div className="text-center space-y-10 animate-in fade-in slide-in-from-right-10 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tight italic">Transaction PIN</h2>
                <p className="text-slate-400 font-medium text-sm">This PIN secures your money transfers.</p>
              </div>

              <div className="flex justify-center gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-white border-white scale-125' : 'border-white/20'}`} />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-xs mx-auto pb-10">
                {['1','2','3','4','5','6','7','8','9','','0','del'].map((key, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      if (key === 'del') setPin(pin.slice(0, -1));
                      else if (key && pin.length < 4) setPin(pin + key);
                    }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white transition-all ${key ? 'bg-white/5 border border-white/10 hover:bg-white/10 active:scale-90' : 'pointer-events-none'}`}
                  >
                    {key === 'del' ? '←' : key}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleNext}
                disabled={pin.length < 4}
                className="w-full py-6 bg-emerald-500 text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all active:scale-95"
              >
                Create Account
              </button>
            </div>
          )}

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

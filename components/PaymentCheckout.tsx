
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Transaction } from '../types';
import { PayMomentLogo } from '../App';

interface PaymentCheckoutProps {
  user: User;
  processTransaction: (tx: Transaction, currency: string) => void;
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({ user, processTransaction, notify }) => {
  const { payId, slug } = useParams();
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'info' | 'method' | 'paystack' | 'processing' | 'success'>('info');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'TRANSFER' | null>(null);

  const link = user.paymentLinks.find(l => l.slug === slug) || { title: 'Payment Request', amount: null };
  const finalAmount = link.amount || parseFloat(amount);

  const handleProceed = () => {
    if (!payerEmail.includes('@')) {
      notify("Please enter a valid email.", "error");
      return;
    }
    if (!finalAmount || finalAmount <= 100) {
      notify("Minimum payment is ₦100.", "error");
      return;
    }
    setCheckoutStep('method');
  };

  const handlePaystackPayment = () => {
    setCheckoutStep('processing');
    const timer = setTimeout(() => {
      const tx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'credit',
        amount: finalAmount,
        title: slug === 'fund' ? 'Wallet Funding (Card)' : `Invoice: ${link.title}`,
        category: 'External Payment',
        timestamp: new Date().toLocaleString(),
        status: 'completed'
      };
      processTransaction(tx, 'NGN');
      setCheckoutStep('success');
    }, 3000);
    return () => clearTimeout(timer);
  };

  if (checkoutStep === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="space-y-8 animate-in zoom-in-95 duration-700 max-w-sm">
           <PayMomentLogo className="w-32 h-32 mx-auto drop-shadow-xl" />
           <div className="space-y-2 px-4">
              <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">Payment Received!</h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Your payment of ₦{finalAmount.toLocaleString()} to {user.name} was processed successfully. A secure receipt is heading to your inbox.</p>
           </div>
           <button 
            onClick={() => navigate('/')}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
           >
             Go to Dashboard
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row">
      {/* Sidebar: Merchant Info */}
      <div className="md:w-1/3 bg-blue-700 dark:bg-slate-800 p-10 md:p-14 text-white flex flex-col justify-between shadow-2xl relative z-20">
        <div className="space-y-10">
           <div className="flex items-center gap-3">
              <PayMomentLogo className="w-12 h-12" />
              <h1 className="text-2xl font-black italic tracking-tighter">PayMoment</h1>
           </div>
           <div className="space-y-6">
              <div className="w-20 h-20 bg-white/20 rounded-[2.5rem] flex items-center justify-center text-3xl font-bold border border-white/20 backdrop-blur-md shadow-inner">
                {user.name.charAt(0)}
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Paying to</p>
                 <h2 className="text-3xl font-black tracking-tight">{user.name}</h2>
                 <p className="text-sm text-white/40 font-medium italic">@{user.payMomentId}</p>
              </div>
           </div>
        </div>
        <div className="pt-10 space-y-3 border-t border-white/10 mt-auto">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Transaction Note</p>
           <p className="text-base font-bold text-white/90 leading-tight">{slug === 'fund' ? 'Personal Wallet Funding' : link.title}</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
      </div>

      {/* Main Checkout Experience */}
      <div className="flex-1 bg-white dark:bg-slate-950 p-8 md:p-20 flex items-center justify-center relative overflow-hidden">
        <div className="w-full max-w-md space-y-12 z-10">
           {checkoutStep === 'info' && (
             <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors tap-scale">
                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all shadow-sm">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest">Return to App</span>
                </button>

                <div className="space-y-3">
                   <h3 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">Secure Checkout</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Fast, secure, and globally accessible by PayMoment.</p>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-1">Email for Digital Receipt</label>
                      <input 
                        type="email" 
                        value={payerEmail}
                        onChange={(e) => setPayerEmail(e.target.value)}
                        placeholder="customer@example.com"
                        className="w-full p-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-600 font-bold transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      />
                   </div>
                   
                   {(slug === 'fund' || !link.amount) ? (
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-1">Amount to Send</label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">₦</span>
                          <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full p-5 pl-12 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-600 font-black text-3xl transition-all text-slate-900 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-800"
                          />
                        </div>
                     </div>
                   ) : (
                     <div className="p-8 bg-blue-50 dark:bg-blue-900/30 rounded-[2.5rem] border border-blue-200 dark:border-transparent flex flex-col items-center gap-2 shadow-sm">
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Total Amount Payable</p>
                        <h4 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums italic">₦{link.amount.toLocaleString()}</h4>
                     </div>
                   )}
                </div>

                <button 
                  onClick={handleProceed}
                  className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Proceed to Payment
                </button>
             </div>
           )}

           {checkoutStep === 'method' && (
             <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                <button onClick={() => setCheckoutStep('info')} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors tap-scale">
                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all shadow-sm">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest">Back to Details</span>
                </button>

                <div className="space-y-3">
                   <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">Payment Method</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Choose your preferred local or global gateway.</p>
                </div>

                <div className="grid gap-4">
                   <MethodItem 
                    id="CARD" 
                    title="Pay with Card" 
                    desc="Visa, Mastercard, Verve" 
                    icon="💳" 
                    active={paymentMethod === 'CARD'} 
                    onClick={() => { setPaymentMethod('CARD'); setCheckoutStep('paystack'); }} 
                   />
                   <MethodItem 
                    id="TRANSFER" 
                    title="Bank Transfer" 
                    desc="Instant local bank transfer" 
                    icon="🏦" 
                    active={paymentMethod === 'TRANSFER'} 
                    onClick={() => setPaymentMethod('TRANSFER')} 
                   />
                </div>

                {paymentMethod === 'TRANSFER' && (
                  <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in zoom-in-95 text-center">
                     <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Send ₦{finalAmount.toLocaleString()} to this account</p>
                     <div className="space-y-1">
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-widest tabular-nums">9024 1201 02</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Wema Bank / PayMoment Gateway</p>
                     </div>
                     <div className="pt-4 space-y-3">
                        <button onClick={handlePaystackPayment} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all">I have made the transfer</button>
                        <button onClick={() => setPaymentMethod(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Cancel & Go Back</button>
                     </div>
                  </div>
                )}
             </div>
           )}

           {checkoutStep === 'paystack' && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in slide-in-from-bottom-12 duration-500">
                  {/* Paystack Styled Header */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#00BBCC] rounded-full flex items-center justify-center text-white text-[10px] font-black">P</div>
                        <span className="font-bold text-slate-800 dark:text-white tracking-tight">Paystack Checkout</span>
                     </div>
                     <button onClick={() => setCheckoutStep('method')} className="text-slate-400 dark:text-slate-500 text-3xl font-light leading-none hover:rotate-90 transition-transform">×</button>
                  </div>

                  <div className="p-8 space-y-8">
                     <div className="text-center">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Paying to {user.name}</p>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white tabular-nums italic tracking-tighter">₦{finalAmount.toLocaleString()}</h4>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Card Details</label>
                           <input placeholder="0000 0000 0000 0000" className="w-full p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono text-sm focus:border-[#00BBCC] outline-none text-slate-900 dark:text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <input placeholder="MM / YY" className="w-full p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono text-sm focus:border-[#00BBCC] outline-none text-slate-900 dark:text-white" />
                           <input placeholder="CVV" className="w-full p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono text-sm focus:border-[#00BBCC] outline-none text-slate-900 dark:text-white" />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <button 
                            onClick={handlePaystackPayment}
                            className="w-full py-5 bg-[#3bb75e] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:opacity-90 active:scale-95 transition-all"
                        >
                            Pay ₦{finalAmount.toLocaleString()}
                        </button>
                        <button 
                            onClick={() => setCheckoutStep('method')}
                            className="w-full py-3 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600"
                        >
                            Back to Methods
                        </button>
                     </div>

                     <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Secured by Paystack & PayMoment</span>
                     </div>
                  </div>
               </div>
             </div>
           )}

           {checkoutStep === 'processing' && (
             <div className="flex flex-col items-center justify-center space-y-10 py-20 animate-in fade-in duration-500">
                <div className="relative">
                   <div className="w-24 h-24 border-8 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center font-black text-blue-600 italic">PM</div>
                </div>
                <div className="text-center space-y-6">
                   <div className="space-y-2">
                      <h4 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">Verifying Transaction</h4>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Encryption Bridge Active...</p>
                   </div>
                   <button 
                    onClick={() => setCheckoutStep('method')} 
                    className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 tap-scale"
                   >
                     Abort & Go Back
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const MethodItem = ({ id, title, desc, icon, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all tap-scale group ${active ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
  >
     <div className="flex items-center gap-5 text-left">
        <div className="text-3xl transition-transform group-hover:scale-110">{icon}</div>
        <div>
           <h5 className="font-black text-slate-900 dark:text-white leading-none mb-1">{title}</h5>
           <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{desc}</p>
        </div>
     </div>
     <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
        {active && <div className="w-2 h-2 bg-white rounded-full"></div>}
     </div>
  </button>
);

export default PaymentCheckout;

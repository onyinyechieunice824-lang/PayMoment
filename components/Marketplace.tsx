
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../src/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { User, Transaction } from '../types';

interface MarketplaceProps {
  user: User;
  setUser: (user: User) => void;
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  processTransaction: (tx: Transaction, currency: string) => void;
}

const GIFT_CARDS = [
  { id: '1', name: 'Amazon', icon: '🛒', color: 'bg-orange-100 text-orange-600' },
  { id: '2', name: 'Netflix', icon: '🎬', color: 'bg-rose-100 text-rose-600' },
  { id: '3', name: 'PlayStation', icon: '🎮', color: 'bg-blue-100 text-blue-600' },
  { id: '4', name: 'Apple', icon: '🍎', color: 'bg-slate-100 text-slate-600' },
];

const Marketplace: React.FC<MarketplaceProps> = ({ user, setUser, notify, processTransaction }) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'hub' | 'giftcards' | 'airtime2cash'>('hub');

  const handleBuyGiftCard = async (card: any) => {
    const amount = 5000; // Fixed amount for demo
    if (user.balances['NGN'] < amount) {
      notify("Insufficient balance", "error");
      return;
    }

    if (!auth.currentUser) return;

    try {
      const tx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'debit',
        amount: amount,
        title: `Bought ${card.name} Gift Card`,
        category: 'Shopping',
        timestamp: new Date().toLocaleString(),
        status: 'completed'
      };
      
      processTransaction(tx, 'NGN');
      notify(`Successfully bought ${card.name} Gift Card!`, 'success');
      setActiveView('hub');
    } catch (error) {
      notify("Purchase failed", "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <button onClick={() => (activeView === 'hub' ? navigate(-1) : setActiveView('hub'))} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors tap-scale">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
      </button>

      <div className="text-center space-y-2">
         <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">The Bazaar</h2>
         <p className="text-sm text-slate-500 font-medium font-inter">Exchange value, buy credits, and explore exclusive Moment deals.</p>
      </div>

      {activeView === 'hub' && (
        <div className="grid gap-6">
           <MarketOption 
              icon="🎁" 
              title="Global Gift Cards" 
              desc="Buy Amazon, Netflix, and Steam cards with Naira instantly." 
              onClick={() => setActiveView('giftcards')}
              color="border-amber-500"
           />
           <MarketOption 
              icon="🔄" 
              title="Airtime to Cash" 
              desc="Convert excess airtime from any network back into your Naira wallet." 
              onClick={() => setActiveView('airtime2cash')}
              color="border-blue-500"
           />
           <MarketOption 
              icon="🎟️" 
              title="Moment Vouchers" 
              desc="Create secure vouchers to send funds offline or as gifts." 
              onClick={() => {}}
              color="border-purple-500"
           />
        </div>
      )}

      {activeView === 'giftcards' && (
        <div className="animate-in slide-in-from-right-8 space-y-6">
           <h3 className="text-xl font-black italic tracking-tight text-slate-900 dark:text-white">Select Provider</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {GIFT_CARDS.map(card => (
                <div key={card.id} onClick={() => handleBuyGiftCard(card)} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center gap-4 cursor-pointer hover:border-amber-500 transition-all group tap-scale">
                   <div className={`w-16 h-16 rounded-2xl ${card.color} flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform`}>
                      {card.icon}
                   </div>
                   <span className="font-black text-xs uppercase tracking-widest">{card.name}</span>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeView === 'airtime2cash' && (
        <div className="max-w-md mx-auto animate-in slide-in-from-right-8 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
           <div className="text-center">
              <h3 className="text-2xl font-black italic tracking-tighter leading-none">Airtime to Cash</h3>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Instant Wallet Settlement</p>
           </div>
           
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Network Provider</label>
                 <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold dark:text-white">
                    <option>MTN Nigeria</option>
                    <option>Airtel</option>
                    <option>9mobile</option>
                    <option>Glo</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Phone Number</label>
                 <input placeholder="080 0000 0000" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold dark:text-white" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Amount to Convert</label>
                 <input placeholder="₦0.00" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold dark:text-white" />
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-transparent flex justify-between items-center">
                 <p className="text-[9px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Rate: 85% Value</p>
                 <p className="text-xs font-black text-blue-900 dark:text-white italic">You'll receive ₦0.00</p>
              </div>

              <button className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Convert Airtime</button>
           </div>
        </div>
      )}
    </div>
  );
};

const MarketOption = ({ icon, title, desc, onClick, color }: any) => (
  <div onClick={onClick} className={`bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 ${color} border-opacity-10 dark:border-opacity-30 shadow-sm flex items-center gap-8 cursor-pointer group hover:scale-[1.02] transition-all`}>
     <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">{icon}</div>
     <div className="flex-1">
        <h4 className="font-black text-xl italic tracking-tight text-slate-900 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
     </div>
     <span className="text-2xl text-slate-300 group-hover:translate-x-2 transition-transform">→</span>
  </div>
);

export default Marketplace;

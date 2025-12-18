
import React from 'react';
import { UserData } from '../types';
import { shareApp, hapticFeedback, showAlert } from '../telegram';

interface ReferralProps {
  user: UserData;
}

const Referral: React.FC<ReferralProps> = ({ user }) => {
  const referralLink = `https://t.me/AdearnX_bot/app?startapp=${user.uid}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    hapticFeedback();
    showAlert("Referral link copied to clipboard!");
  };

  return (
    <div className="p-4 flex flex-col gap-6 pb-24 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black leading-tight">Give 500,<br/>Get 500!</h1>
          <p className="mt-2 text-blue-100 font-medium max-w-[200px]">
            Friends get +1500 coins on join, you get +500 coins + 10% lifetime commission.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute right-6 top-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center rotate-12 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Referral Link Box */}
      <div className="bg-[var(--tg-secondary-bg)] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Invite Your Friends</label>
          <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">UNLIMITED</span>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
          <input 
            type="text" 
            readOnly 
            value={referralLink} 
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium truncate"
          />
          <button 
            onClick={copyToClipboard}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 active:scale-95 transition-all text-sm"
          >
            Copy
          </button>
        </div>
        <button 
          onClick={() => shareApp(user.uid)}
          className="w-full mt-4 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Invite Friends
        </button>
      </div>

      {/* Rewards Description */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-lg font-black px-1">Referral Rewards</h3>
        
        <div className="flex gap-4 items-start p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-sm">For Your Friends</h4>
            <p className="text-xs text-gray-500 mt-1">Friends who join via your link get <span className="text-blue-600 font-bold">1500 coins</span> (1000 Base + 500 Bonus).</p>
          </div>
        </div>

        <div className="flex gap-4 items-start p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-sm">For You</h4>
            <p className="text-xs text-gray-500 mt-1">You get <span className="text-green-600 font-bold">500 coins</span> instantly for every successful invite.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-sm">Passive Earnings</h4>
            <p className="text-xs text-gray-500 mt-1">Earn <span className="text-purple-600 font-bold">10% commission</span> on all coins your friends earn from ads.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;

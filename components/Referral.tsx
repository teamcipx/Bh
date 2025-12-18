
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
            Friends get +500 coins bonus, you get 500 coins + 10% commission.
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
          <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Your Unique Link</label>
          <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
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
          Invite via Telegram
        </button>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-lg font-black px-1">How it works</h3>
        
        <div className="flex gap-4 items-start p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <span className="font-black text-blue-600">1</span>
          </div>
          <div>
            <h4 className="font-bold text-sm">Send your link</h4>
            <p className="text-xs text-gray-500 mt-1">Share your unique link with friends who haven't joined CoinEarn yet.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <span className="font-black text-green-600">2</span>
          </div>
          <div>
            <h4 className="font-bold text-sm">Instant Referral Reward</h4>
            <p className="text-xs text-gray-500 mt-1">They get <span className="text-green-600 font-bold">1500 coins</span> (1000 Welcome + 500 Ref), you get <span className="text-green-600 font-bold">500 coins</span>.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
            <span className="font-black text-purple-600">3</span>
          </div>
          <div>
            <h4 className="font-bold text-sm">Lifetime Commission</h4>
            <p className="text-xs text-gray-500 mt-1">Earn <span className="text-purple-600 font-bold">10% commission</span> on every single ad they watch, forever.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;

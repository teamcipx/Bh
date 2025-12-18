
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
    <div className="p-4 flex flex-col gap-6 pb-24">
      <div className="text-center mt-4">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Refer & Earn</h1>
        <p className="text-gray-500 mt-2">Invite your friends and get 500 coins instantly when they join!</p>
      </div>

      <div className="bg-[var(--tg-secondary-bg)] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
        <label className="text-xs text-gray-400 uppercase font-semibold mb-2 block">Your Referral Link</label>
        <div className="flex items-center gap-2 bg-white dark:bg-black/20 p-2 rounded-lg border dark:border-gray-700">
          <input 
            type="text" 
            readOnly 
            value={referralLink} 
            className="flex-1 bg-transparent border-none outline-none text-sm truncate px-2"
          />
          <button 
            onClick={copyToClipboard}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => shareApp(user.uid)}
          className="w-full bg-[var(--tg-button)] text-[var(--tg-button-text)] py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share with Friends
        </button>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-3">How it works?</h3>
        <ul className="space-y-3">
          <li className="flex gap-3 text-sm">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 font-bold">1</span>
            <p>Send your referral link to friends or share it in groups.</p>
          </li>
          <li className="flex gap-3 text-sm">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 font-bold">2</span>
            <p>Wait for them to join the app using your unique link.</p>
          </li>
          <li className="flex gap-3 text-sm">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 font-bold">3</span>
            <p>Instantly receive 500 bonus coins added to your balance!</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Referral;

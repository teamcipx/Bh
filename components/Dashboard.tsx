
import React from 'react';
import { UserData, AppSettings } from '../types';
import { updateAdWatch } from '../firebase';
import { hapticFeedback, showAlert } from '../telegram';

// Declare global ad function from SDK
declare global {
  function show_10342982(): Promise<void>;
}

interface DashboardProps {
  user: UserData;
  settings: AppSettings;
  refreshUser: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, settings, refreshUser }) => {
  const [isWatching, setIsWatching] = React.useState(false);

  const handleWatchAd = async () => {
    if (typeof show_10342982 !== 'function') {
      showAlert("Ad service is currently unavailable. Please try again later.");
      return;
    }

    hapticFeedback();
    setIsWatching(true);
    
    try {
      // Execute the real rewarded ad function
      await show_10342982();
      
      // If the promise resolves, the user has seen the ad
      await updateAdWatch(user.uid, settings.ad_reward, user.referred_by);
      showAlert(`Reward Claimed! You earned ${settings.ad_reward} coins.`);
      refreshUser();
    } catch (err) {
      console.error("Ad playback error or cancellation:", err);
      // If the SDK throws on close without completion, handle it here
      // Some SDKs might just resolve anyway, check your SDK documentation
    } finally {
      setIsWatching(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      {/* Banner Section */}
      <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-lg">
        <img 
          src={settings.banner_url} 
          alt="Promotion" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
          <a href={settings.banner_link} target="_blank" rel="noopener noreferrer" className="text-white font-bold underline">
            Special Offer - Click Here
          </a>
        </div>
      </div>

      {/* Notice Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 overflow-hidden rounded-r-lg">
        <div className="animate-marquee whitespace-nowrap text-blue-800 dark:text-blue-300 font-medium">
          {settings.notice}
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl flex justify-between items-center">
        <div>
          <p className="text-blue-100 text-sm opacity-80 uppercase tracking-wider">Current Balance</p>
          <h2 className="text-4xl font-black mt-1">{user.balance.toLocaleString()} <span className="text-lg">Coins</span></h2>
        </div>
        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--tg-secondary-bg)] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 uppercase">Videos Watched</p>
          <p className="text-xl font-bold">{user.total_watched}</p>
        </div>
        <div className="bg-[var(--tg-secondary-bg)] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 uppercase">Reward / Ad</p>
          <p className="text-xl font-bold">{settings.ad_reward}</p>
        </div>
      </div>

      {/* Earning Button */}
      <button
        onClick={handleWatchAd}
        disabled={isWatching}
        className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-3 ${
          isWatching ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--tg-button)] text-[var(--tg-button-text)]'
        }`}
      >
        <svg className={`w-6 h-6 ${isWatching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {isWatching ? 'Ad is playing...' : 'Watch Video to Earn'}
      </button>
    </div>
  );
};

export default Dashboard;

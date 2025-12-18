
import React from 'react';
import { UserData, AppSettings } from '../types';
import { updateAdWatch } from '../firebase';
import { hapticFeedback, showAlert } from '../telegram';

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
      await show_10342982();
      await updateAdWatch(user.uid, settings.ad_reward, user.referred_by);
      showAlert(`Reward Claimed! You earned ${settings.ad_reward} coins.`);
      refreshUser();
    } catch (err) {
      console.error("Ad playback error:", err);
    } finally {
      setIsWatching(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 animate-in slide-in-from-bottom duration-500">
      {/* Banner Section */}
      <div className="relative w-full aspect-[2/1] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-900">
        <img 
          src={settings.banner_url} 
          alt="Promotion" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
          <a href={settings.banner_link} target="_blank" rel="noopener noreferrer" className="text-white font-black text-lg flex items-center gap-2">
            <span>Special Reward</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </a>
        </div>
      </div>

      {/* Notice Section */}
      <div className="bg-blue-600/10 dark:bg-blue-600/20 border-l-4 border-blue-600 p-4 rounded-xl backdrop-blur-sm">
        <div className="animate-marquee whitespace-nowrap text-blue-700 dark:text-blue-400 font-bold text-sm tracking-tight">
          {settings.notice}
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-blue-500 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-blue-100 text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-70">Total Coins</p>
          <h2 className="text-5xl font-black tracking-tight flex items-center gap-3">
            {user.balance.toLocaleString()} 
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">COINS</span>
          </h2>
        </div>
        {/* Animated Background Element */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Watched</p>
          <p className="text-2xl font-black text-gray-800 dark:text-white">{user.total_watched}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Per Video</p>
          <p className="text-2xl font-black text-gray-800 dark:text-white">+{settings.ad_reward}</p>
        </div>
      </div>

      {/* Earning Button */}
      <button
        onClick={handleWatchAd}
        disabled={isWatching}
        className={`w-full py-6 rounded-[1.5rem] font-black text-xl shadow-2xl transform active:scale-95 transition-all flex items-center justify-center gap-4 relative overflow-hidden ${
          isWatching ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <div className={`absolute inset-0 bg-white/10 ${isWatching ? 'animate-pulse' : ''}`}></div>
        <svg className={`w-8 h-8 ${isWatching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="relative z-10">{isWatching ? 'Loading Ad...' : 'Earn Now'}</span>
      </button>
    </div>
  );
};

export default Dashboard;

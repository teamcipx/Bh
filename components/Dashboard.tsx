
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
      showAlert("সার্ভিসটি লোড হচ্ছে, কিছুক্ষণ পর চেষ্টা করুন।");
      return;
    }

    hapticFeedback();
    setIsWatching(true);
    
    try {
      await show_10342982();
      await updateAdWatch(user.uid, settings.ad_reward, user.referred_by);
      showAlert(`সফল হয়েছে! +${settings.ad_reward} কয়েন জমা হয়েছে।`);
      refreshUser();
    } catch (err) {
      console.error("Ad error:", err);
    } finally {
      setIsWatching(false);
    }
  };

  const progress = Math.min(100, (user.balance / settings.min_withdrawal) * 100);
  const bdtEquivalent = (user.balance / 100).toFixed(2);

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 animate-in fade-in duration-700">
      {/* Banner / Promotion */}
      <div className="relative w-full h-44 rounded-[2.5rem] overflow-hidden shadow-xl">
        <img 
          src={settings.banner_url} 
          alt="Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-6">
          <div className="text-white">
            <h3 className="font-black text-xl leading-tight">এলিট রিওয়ার্ডস<br/>প্রোগ্রাম</h3>
            <p className="text-xs text-blue-200 mt-1">১০০০ কয়েন = ১০ টাকা (বিকাশ/নগদ)</p>
          </div>
        </div>
      </div>

      {/* Main Wallet Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-400 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">মোট ব্যালেন্স</p>
              <h2 className="text-5xl font-black tracking-tighter mt-1">
                {user.balance.toLocaleString()}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xl font-black text-white/90">৳ {bdtEquivalent}</span>
                <span className="text-[8px] font-black uppercase opacity-60 tracking-widest">BDT মূল্য</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black border border-white/20">
              COINS
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-80">
              <span>উইথড্রাল প্রগ্রেস</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-[9px] italic opacity-60">টার্গেট: {settings.min_withdrawal.toLocaleString()} কয়েন</p>
          </div>
        </div>
        
        {/* Aesthetic Background Elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-blue-300/20 rounded-full blur-xl"></div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-transform active:scale-95">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
             <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">মোট অ্যাড</p>
          <p className="text-2xl font-black text-gray-800 dark:text-white mt-1">{user.total_watched}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-transform active:scale-95">
          <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-3">
             <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">অ্যাড রিওয়ার্ড</p>
          <p className="text-2xl font-black text-gray-800 dark:text-white mt-1">+{settings.ad_reward}</p>
        </div>
      </div>

      {/* Main CTA */}
      <button
        onClick={handleWatchAd}
        disabled={isWatching}
        className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 relative overflow-hidden group ${
          isWatching ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <div className={`absolute inset-0 bg-white/10 group-active:bg-white/20 ${isWatching ? 'animate-pulse' : ''}`}></div>
        <svg className={`w-8 h-8 ${isWatching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="relative z-10 tracking-tight">{isWatching ? 'অ্যাড লোড হচ্ছে...' : 'কয়েন ইনকাম করুন'}</span>
      </button>

      {/* Footer Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-4 rounded-2xl flex items-center gap-4">
        <div className="w-10 h-10 shrink-0 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-sm text-lg">📢</div>
        <div className="overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-[11px] font-bold text-blue-700 dark:text-blue-400 tracking-tight">
            {settings.notice} • লক্ষ্য পূর্ণ হলে দ্রুত উইথড্র করুন! • ১০০০ কয়েন = ১০ টাকা • 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

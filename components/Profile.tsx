
import React from 'react';
import { UserData } from '../types';
import { hapticFeedback } from '../telegram';

interface ProfileProps {
  user: UserData;
  navigateToAdmin: () => void;
  isAdmin: boolean;
}

const Profile: React.FC<ProfileProps> = ({ user, navigateToAdmin, isAdmin }) => {
  return (
    <div className="p-4 pb-24 animate-in fade-in slide-in-from-bottom duration-500">
      {/* Profile Header Card */}
      <div className="flex flex-col items-center mt-6 bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="w-28 h-28 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl mb-6 relative z-10 rotate-3">
          {(user.firstName || 'U')[0].toUpperCase()}
        </div>
        <div className="text-center relative z-10">
          <h1 className="text-2xl font-black tracking-tight">{user.firstName} {user.lastName}</h1>
          <p className="text-blue-500 font-bold text-sm mt-1">@{user.username || 'unknown'}</p>
        </div>
        <div className="mt-6 px-4 py-1.5 bg-gray-50 dark:bg-black/20 rounded-full text-[10px] font-black text-gray-400 tracking-[0.2em] border border-gray-100 dark:border-gray-800">
          UID: {user.uid}
        </div>
        
        {/* Background blobs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="mt-8 space-y-3">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Balance</p>
            <p className="text-xl font-black text-blue-600">{user.balance.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Ads Viewed</p>
            <p className="text-xl font-black text-indigo-600">{user.total_watched}</p>
          </div>
        </div>

        {/* Member Since Card */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <span className="text-sm font-black text-gray-700 dark:text-gray-200">Registration Date</span>
          </div>
          <span className="text-xs font-bold text-gray-400 tracking-tighter">{new Date(user.createdAt).toLocaleDateString('en-GB')}</span>
        </div>

        {/* Support Button */}
        <button
          onClick={() => {
            hapticFeedback();
            window.open('https://t.me/AdearnX_bot', '_blank');
          }}
          className="w-full bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm active:scale-95 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <span className="text-sm font-black text-gray-700 dark:text-gray-200">Customer Support</span>
          </div>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
        </button>

        {/* Admin Panel Button */}
        {isAdmin && (
          <button
            onClick={() => {
              hapticFeedback();
              navigateToAdmin();
            }}
            className="w-full mt-4 bg-black text-white dark:bg-white dark:text-black p-6 rounded-[2.5rem] flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            System Controller
          </button>
        )}
      </div>

      <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-12 opacity-50">
        CoinEarn v2.1.0 • Stable Build
      </p>
    </div>
  );
};

export default Profile;

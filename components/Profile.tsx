
import React from 'react';
import { UserData } from '../types';
import { hapticFeedback } from '../telegram';

interface ProfileProps {
  user: UserData;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="p-4 pb-24">
      <div className="flex flex-col items-center mt-6">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl mb-4">
          {(user.firstName || 'U')[0].toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
        <p className="text-gray-500">@{user.username || 'unknown'}</p>
        <div className="mt-2 px-3 py-1 bg-[var(--tg-secondary-bg)] rounded-full text-xs font-mono text-gray-500">
          ID: {user.uid}
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <div className="bg-[var(--tg-secondary-bg)] p-5 rounded-2xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-400/20 text-yellow-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold">Total Earnings</span>
          </div>
          <span className="text-xl font-black">{user.balance.toLocaleString()}</span>
        </div>

        <div className="bg-[var(--tg-secondary-bg)] p-5 rounded-2xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-400/20 text-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold">Ads Watched</span>
          </div>
          <span className="text-xl font-black">{user.total_watched}</span>
        </div>

        <div className="bg-[var(--tg-secondary-bg)] p-5 rounded-2xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-400/20 text-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold">Member Since</span>
          </div>
          <span className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <button
        onClick={() => {
          hapticFeedback();
          window.open('https://t.me/YourBotSupport', '_blank');
        }}
        className="w-full mt-10 py-4 text-center text-blue-600 font-bold"
      >
        Contact Support
      </button>
    </div>
  );
};

export default Profile;

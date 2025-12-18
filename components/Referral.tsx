
import React, { useState, useEffect } from 'react';
import { UserData } from '../types';
import { getReferralHistory } from '../firebase';
import { shareApp, hapticFeedback } from '../telegram';

interface ReferralProps {
  user: UserData;
}

const Referral: React.FC<ReferralProps> = ({ user }) => {
  const [history, setHistory] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getReferralHistory(user.uid);
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, [user.uid]);

  const handleInvite = () => {
    hapticFeedback();
    shareApp(user.uid);
  };

  return (
    <div className="p-4 flex flex-col gap-6 pb-24 animate-in slide-in-from-right duration-500">
      {/* Invite Card */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-500 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tighter leading-tight">Grow Your<br/>Earnings.</h2>
          <p className="mt-3 text-blue-100 text-xs font-medium max-w-[180px] leading-relaxed">
            Get 500 coins instantly + 10% commission on every ad your friend watches. Forever.
          </p>
          <button 
            onClick={handleInvite}
            className="mt-6 bg-white text-blue-600 px-6 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Invite Friends
          </button>
        </div>
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute right-8 top-12 opacity-20">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3.005 3.005 0 013.75-2.906z" /></svg>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Direct Bonus</p>
          <p className="text-xl font-black text-indigo-600">+500</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Commission</p>
          <p className="text-xl font-black text-indigo-600">10%</p>
        </div>
      </div>

      {/* Referral History List */}
      <div className="mt-2">
        <h3 className="text-xl font-black px-2 mb-4 flex items-center gap-2">
          My Team 
          <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded-full">
            {history.length}
          </span>
        </h3>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-12 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800 text-center">
            <p className="text-gray-400 font-bold text-sm">No team members yet.</p>
            <p className="text-[10px] text-gray-300 mt-1">Start inviting to grow your passive income!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((member, idx) => (
              <div 
                key={member.uid || idx}
                className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between animate-in fade-in slide-in-from-bottom duration-300"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-blue-600 font-black text-xs">
                    {(member.firstName || 'U')[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-800 dark:text-gray-100 truncate max-w-[120px]">
                      {member.firstName} {member.lastName}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium">
                      Joined {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-green-500 uppercase tracking-tighter">Active</p>
                  <p className="text-xs font-bold text-gray-500">{member.total_watched} ads</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Referral;

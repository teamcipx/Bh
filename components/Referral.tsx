
import React, { useState, useEffect } from 'react';
import { UserData } from '../types';
import { getReferralHistory, submitReferralCode } from '../firebase';
import { hapticFeedback, showAlert } from '../telegram';

interface ReferralProps {
  user: UserData;
  refreshUser: () => void;
}

const Referral: React.FC<ReferralProps> = ({ user, refreshUser }) => {
  const [history, setHistory] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputCode, setInputCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getReferralHistory(user.uid);
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, [user.uid]);

  const handleCopyCode = () => {
    hapticFeedback();
    navigator.clipboard.writeText(user.uid);
    showAlert("Referral code copied to clipboard!");
  };

  const handleSubmitCode = async () => {
    if (!inputCode.trim()) return;
    setIsSubmitting(true);
    hapticFeedback();
    const result = await submitReferralCode(user.uid, inputCode);
    showAlert(result.message);
    if (result.success) {
      setInputCode('');
      refreshUser();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 flex flex-col gap-6 pb-24 animate-in slide-in-from-right duration-500">
      {/* Code Display Card */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-500 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">My Referral Code</p>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl py-4 px-6 border border-white/20 inline-block">
            <h2 className="text-3xl font-black tracking-widest">{user.uid}</h2>
          </div>
          <button 
            onClick={handleCopyCode}
            className="mt-6 w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            Copy Code
          </button>
        </div>
      </div>

      {/* Manual Code Input */}
      {!user.hasSubmittedCode && !user.referred_by && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm animate-in zoom-in duration-300">
          <h3 className="text-sm font-black text-gray-800 dark:text-white mb-4">Redeem a Code</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Enter Friend's Code"
              className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
            />
            <button 
              onClick={handleSubmitCode}
              disabled={isSubmitting || !inputCode.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs disabled:opacity-50 active:scale-95 transition-all"
            >
              {isSubmitting ? '...' : 'Claim'}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-3 font-medium">Enter a code to instantly receive 500 bonus coins.</p>
        </div>
      )}

      {/* Stats Summary */}
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

      {/* Team List */}
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
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((member, idx) => (
              <div 
                key={member.uid || idx}
                className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-black text-xs">
                    {(member.firstName || 'U')[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-black">{member.firstName}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">{new Date(member.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-green-500 tracking-tighter uppercase">Active</p>
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

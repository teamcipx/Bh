
import React, { useState, useEffect, useCallback } from 'react';
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
  const [copied, setCopied] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReferralHistory(user.uid);
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCopyCode = () => {
    hapticFeedback();
    navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showAlert("Code copied! Share it with your friends.");
  };

  const handleSubmitCode = async () => {
    if (!inputCode.trim()) return;
    setIsSubmitting(true);
    hapticFeedback();
    
    try {
      const result = await submitReferralCode(user.uid, inputCode);
      showAlert(result.message);
      if (result.success) {
        setInputCode('');
        refreshUser();
        // Crucial: Refresh history too in case they were already invited but just used code
        await fetchHistory(); 
      }
    } catch (err) {
      showAlert("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6 pb-24 animate-in slide-in-from-right duration-500">
      {/* Code Display Card */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-600 to-blue-500 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-3">Your Referral UID</p>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl py-5 px-6 border border-white/20 inline-block shadow-inner">
            <h2 className="text-3xl font-black tracking-widest font-mono">{user.uid}</h2>
          </div>
          <button 
            onClick={handleCopyCode}
            className={`mt-6 w-full py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
              copied ? 'bg-green-500 text-white' : 'bg-white text-blue-600'
            }`}
          >
            {copied ? (
              <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            )}
            {copied ? 'Copied Successfully!' : 'Copy My Code'}
          </button>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)] pointer-events-none"></div>
      </div>

      {/* Manual Code Input */}
      {!user.hasSubmittedCode && !user.referred_by && (
        <div className="bg-white dark:bg-gray-900 p-7 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm animate-in zoom-in duration-300">
          <h3 className="text-sm font-black text-gray-800 dark:text-white mb-4">Have a referral code?</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste friend's UID here"
              className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold placeholder:text-gray-300"
            />
            <button 
              onClick={handleSubmitCode}
              disabled={isSubmitting || !inputCode.trim()}
              className="bg-blue-600 text-white px-7 py-3 rounded-xl font-black text-xs disabled:opacity-50 active:scale-95 transition-all shadow-md"
            >
              {isSubmitting ? '...' : 'Claim'}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 font-bold flex items-center gap-1">
            <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            Redeem once for a +500 coin instant bonus.
          </p>
        </div>
      )}

      {/* Stats Table */}
      <div className="bg-gray-50 dark:bg-gray-900/40 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Referrals</p>
            <p className="text-2xl font-black text-blue-600">{history.length}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Pending Rewards</p>
            <p className="text-2xl font-black text-green-600">+{history.length * 500}</p>
          </div>
        </div>
      </div>

      {/* Team List with Pull-to-Refresh Feel */}
      <div>
        <div className="flex items-center justify-between mb-5 px-2">
          <h3 className="text-xl font-black tracking-tight">Referral History</h3>
          <button 
            onClick={fetchHistory}
            className={`text-[10px] font-black uppercase text-blue-500 flex items-center gap-1 ${loading ? 'animate-pulse' : ''}`}
          >
            <svg className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Sync
          </button>
        </div>

        {loading && history.length === 0 ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/50 p-12 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <p className="text-gray-400 font-bold text-sm">No referrals found.</p>
            <p className="text-[10px] text-gray-300 mt-2 max-w-[160px] mx-auto leading-relaxed uppercase tracking-widest">Your team list will appear here once users enter your code.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((member, idx) => (
              <div 
                key={member.uid || idx}
                className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-black text-lg border-2 border-white dark:border-gray-800 shadow-sm">
                    {(member.firstName || 'U')[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-800 dark:text-gray-100">{member.firstName}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      UID: {member.uid}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Completed</p>
                  <p className="text-[9px] text-gray-400 font-medium">{new Date(member.createdAt).toLocaleDateString()}</p>
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

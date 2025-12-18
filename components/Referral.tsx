
import React, { useState, useEffect, useCallback } from 'react';
import { UserData } from '../types';
import { getReferralHistory, submitReferralCode } from '../firebase';
import { hapticFeedback, showAlert, shareApp } from '../telegram';

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
    showAlert("UID Copied!");
  };

  const handleShare = () => {
    hapticFeedback();
    shareApp(user.uid);
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
        await fetchHistory(); 
      }
    } catch (err) {
      showAlert("Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6 pb-24 animate-in slide-in-from-right duration-500">
      {/* Code Card */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-500 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60 mb-4">Your Invitation UID</p>
          <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] py-6 px-4 border border-white/20 shadow-inner flex flex-col items-center">
            <h2 className="text-3xl font-black tracking-widest font-mono select-all mb-4">{user.uid}</h2>
            <div className="flex gap-2 w-full">
              <button 
                onClick={handleCopyCode}
                className="flex-1 py-3.5 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg"
              >
                {copied ? 'Copied!' : 'Copy UID'}
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 py-3.5 bg-blue-900/40 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-white/10"
              >
                Share
              </button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
      </div>

      {/* Redeem Section */}
      {!user.hasSubmittedCode && !user.referred_by && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Redeem Bonus</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Friend's UID"
              className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleSubmitCode}
              disabled={isSubmitting || !inputCode.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-all"
            >
              Claim
            </button>
          </div>
          <p className="text-[9px] font-bold text-blue-500 mt-4 leading-relaxed italic uppercase opacity-70">Redeem once for +500 coins instant bonus.</p>
        </div>
      )}

      {/* Stats Table */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Referrals</p>
          <p className="text-xl font-black text-blue-600">{history.length}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 text-right">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Earned</p>
          <p className="text-xl font-black text-green-600">{(history.length * 500).toLocaleString()}</p>
        </div>
      </div>

      {/* Team List */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-lg font-black tracking-tight">Your Team</h3>
          <button onClick={fetchHistory} className={`text-[10px] font-black uppercase text-blue-500 ${loading ? 'animate-pulse' : ''}`}>Sync</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : history.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/40 p-10 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800 text-center">
            <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">Team is empty</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((member, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-black text-sm uppercase">
                    {(member.firstName || 'U')[0]}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-800 dark:text-gray-100">{member.firstName}</h4>
                    <p className="text-[8px] text-gray-400 font-bold font-mono">ID:{member.uid}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-green-500 uppercase">+500</p>
                  <p className="text-[8px] text-gray-300 font-medium">{new Date(member.createdAt).toLocaleDateString()}</p>
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

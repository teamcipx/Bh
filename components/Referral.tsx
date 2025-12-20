
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
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showAlert("Referral Code Copied!");
  };

  const handleShare = () => {
    hapticFeedback();
    // Pass referralCode instead of UID for sharing
    const link = `https://t.me/AdearnX_bot/app`;
    const text = `Join CoinEarn and start earning! 💸\n\nUse my 4-digit code: ${user.referralCode}\nGet +500 coins instantly!`;
    try {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
    } catch (e) {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleSubmitCode = async () => {
    if (!inputCode.trim()) return;
    if (inputCode.trim().length !== 4) {
      showAlert("Code must be 4 digits.");
      return;
    }
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
      {/* Referral Guide Section */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 mb-5 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Invite & Earn
        </h3>
        <div className="space-y-5">
          {[
            { step: "1", title: "Share 4-Digit Code", desc: "Share your unique 4-digit referral code with friends." },
            { step: "2", title: "Friend Redeems", desc: "Your friend enters the code. Only 1 code can be redeemed per user." },
            { step: "3", title: "Instant 500", desc: "Both get +500 coins instantly! You need 3 refers to withdraw." },
            { step: "4", title: "10% Forever", desc: "Earn 10% commission on every ad they watch, every day." }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                {item.step}
              </div>
              <div>
                <h4 className="text-[12px] font-black text-gray-800 dark:text-gray-100">{item.title}</h4>
                <p className="text-[10px] text-gray-400 font-bold leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Card */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-600 to-indigo-500 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60 mb-4">Your Invitation Code</p>
          <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] py-6 px-4 border border-white/20 shadow-inner flex flex-col items-center">
            <h2 className="text-4xl font-black tracking-[0.5em] font-mono select-all mb-4 pl-4">{user.referralCode}</h2>
            <div className="flex gap-2 w-full">
              <button 
                onClick={handleCopyCode}
                className="flex-1 py-3.5 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg"
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 py-3.5 bg-indigo-900/40 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-white/10"
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
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm animate-in zoom-in duration-300">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Redeem Bonus</h3>
          <div className="flex gap-2">
            <input 
              type="number" 
              maxLength={4}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.slice(0, 4))}
              placeholder="Enter 4-digit code"
              className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleSubmitCode}
              disabled={isSubmitting || inputCode.length !== 4}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-all"
            >
              Claim
            </button>
          </div>
          <p className="text-[9px] font-bold text-blue-500 mt-4 leading-relaxed italic uppercase opacity-70">One-time redeem for +500 coins bonus.</p>
        </div>
      )}

      {/* Stats Table */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Referrals</p>
          <p className="text-xl font-black text-blue-600">{user.referralCount || 0}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 text-right">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Bonus</p>
          <p className="text-xl font-black text-green-600">{((user.referralCount || 0) * 500).toLocaleString()}</p>
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
            <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">No friends invited yet</p>
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
                    <p className="text-[8px] text-gray-400 font-bold font-mono">CODE: {member.referralCode}</p>
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

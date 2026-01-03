
import React, { useState, useEffect } from 'react';
import { UserData, AppSettings, WithdrawalRequest } from '../types';
import { createWithdrawal, getWithdrawalHistory } from '../firebase';
import { hapticFeedback, showAlert } from '../telegram';

interface WithdrawalProps {
  user: UserData;
  settings: AppSettings;
  refreshUser: () => void;
}

const Withdrawal: React.FC<WithdrawalProps> = ({ user, settings, refreshUser }) => {
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<string>('bkash');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const referralCount = user.referralCount || 0;
  const accountAgeHours = (Date.now() - user.createdAt) / (1000 * 60 * 60);
  const isAccountDayOld = accountAgeHours >= 24;
  const hasMinRefers = referralCount >= 3;
  const hasMinBalance = user.balance >= settings.min_withdrawal;

  const canWithdraw = hasMinRefers && isAccountDayOld && hasMinBalance;

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getWithdrawalHistory(user.uid);
      setHistory(data);
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 15000);
    return () => clearInterval(interval);
  }, [user.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasMinBalance) {
      showAlert(`উইথড্র করার জন্য কমপক্ষে ${settings.min_withdrawal} কয়েন প্রয়োজন।`);
      return;
    }

    if (!hasMinRefers) {
      showAlert("উইথড্র করতে কমপক্ষে ৩টি সফল ইনভাইট প্রয়োজন।");
      return;
    }

    if (!isAccountDayOld) {
      showAlert("অ্যাকাউন্টটি কমপক্ষে ২৪ ঘণ্টা পুরনো হতে হবে।");
      return;
    }

    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount < settings.min_withdrawal) {
      showAlert(`কমপক্ষে ${settings.min_withdrawal} কয়েন দিন।`);
      return;
    }

    if (numAmount > user.balance) {
      showAlert("পর্যাপ্ত ব্যালেন্স নেই।");
      return;
    }

    if (!details) {
      showAlert("পেমেন্ট ডিটেইলস দিন।");
      return;
    }

    setIsSubmitting(true);
    hapticFeedback();

    try {
      await createWithdrawal({
        user_id: user.uid,
        amount: numAmount,
        method,
        details,
        status: 'pending',
        timestamp: Date.now()
      });
      showAlert("আবেদন জমা হয়েছে!");
      setAmount('');
      setDetails('');
      refreshUser();
      fetchHistory(); 
    } catch (err) {
      showAlert("ব্যর্থ হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'rejected': return 'text-red-500 bg-red-500/10';
      default: return 'text-yellow-600 bg-yellow-500/10';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('bn-BD', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const requestBdtValue = amount ? (parseInt(amount) / 100).toFixed(2) : "0.00";

  return (
    <div className="p-4 pb-24">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 rounded-[2.5rem] p-8 text-white mb-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-sm font-bold opacity-60 uppercase tracking-widest">ওয়ালেট ব্যালেন্স</h2>
          <div className="flex items-end gap-3 mt-2">
            <span className="text-5xl font-black">{user.balance.toLocaleString()}</span>
            <span className="text-sm font-black opacity-30 uppercase mb-2">কয়েন</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-2xl font-black text-green-400">৳ {(user.balance / 80).toFixed(2)}</span>
            <span className="text-[10px] font-black opacity-50 uppercase">BDT মূল্য</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Withdrawal Conditions Checklist */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 mb-6 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">উইথড্র শর্তাবলী</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">ন্যূনতম ব্যালেন্স ({settings.min_withdrawal})</span>
            {hasMinBalance ? <CheckIcon /> : <CrossIcon />}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">৩টি সফল ইনভাইট ({referralCount}/৩)</span>
            {hasMinRefers ? <CheckIcon /> : <CrossIcon />}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">অ্যাকাউন্ট ২৪ ঘণ্টা পুরনো</span>
            {isAccountDayOld ? <CheckIcon /> : <CrossIcon />}
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className={`bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 mb-8 shadow-sm transition-opacity ${!canWithdraw ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-gray-800 dark:text-white">টাকা উত্তোলন</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-2">
            {['bkash', 'binance', 'nagad', 'usdt'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`py-3 rounded-xl border-2 transition-all font-black uppercase text-[10px] tracking-widest ${
                  method === m 
                    ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20' 
                    : 'border-transparent bg-gray-50 dark:bg-black/20 text-gray-400'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`কয়েন (কমপক্ষে ${settings.min_withdrawal})`}
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 text-lg font-black"
              required
            />
            <p className="text-[10px] font-bold text-green-500 mt-2 ml-2">সম্ভাব্য মূল্য: ৳ {requestBdtValue} BDT</p>
          </div>

          <input
            type="text"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="অ্যাকাউন্ট নম্বর বা ওয়ালেট এড্রেস"
            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting || !canWithdraw}
            className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl mt-2 flex items-center justify-center gap-3 transition-all active:scale-95 ${
              isSubmitting || !canWithdraw
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-blue-600 text-white shadow-blue-500/20'
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'উইথড্র করুন'
            )}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="mt-8">
        <h3 className="text-xl font-black tracking-tight mb-6 px-2">উইথড্র ইতিহাস</h3>
        {loadingHistory && history.length === 0 ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div></div>
        ) : history.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/50 p-12 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800 text-center text-gray-300 font-black uppercase text-[10px] tracking-widest">
            এখনো কোনো ইতিহাস নেই
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((req) => (
              <div 
                key={req.id} 
                className="bg-white dark:bg-gray-900 p-5 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-sm">{req.amount.toLocaleString()}</p>
                    <span className="text-[8px] bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full uppercase font-black text-blue-600">{req.method}</span>
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase truncate max-w-[150px]">{req.details}</p>
                  <p className="text-[8px] text-gray-300 mt-1">{formatDate(req.timestamp)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-current/20 ${getStatusColor(req.status)}`}>
                  {req.status === 'completed' ? 'সফল' : req.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমান'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white">
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
  </div>
);

const CrossIcon = () => (
  <div className="w-5 h-5 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-red-600">
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
  </div>
);

export default Withdrawal;

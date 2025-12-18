
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

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const data = await getWithdrawalHistory(user.uid);
    setHistory(data);
    setLoadingHistory(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount);

    if (isNaN(numAmount) || numAmount < settings.min_withdrawal) {
      showAlert(`Minimum withdrawal is ${settings.min_withdrawal} coins.`);
      return;
    }

    if (numAmount > user.balance) {
      showAlert("Insufficient balance.");
      return;
    }

    if (!details) {
      showAlert("Please enter payment details.");
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
      showAlert("Withdrawal request submitted successfully!");
      setAmount('');
      setDetails('');
      refreshUser();
      fetchHistory(); // Refresh the list
    } catch (err) {
      showAlert("Error submitting request. Try again.");
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
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 pb-24">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2rem] p-8 text-white mb-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-sm font-bold opacity-60 uppercase tracking-widest">Available Balance</h2>
          <div className="text-4xl font-black mt-2 flex items-center gap-2">
            {user.balance.toLocaleString()}
            <span className="text-sm font-black opacity-30 uppercase">Coins</span>
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full inline-block border border-white/10 text-yellow-400">
            Min Goal: {settings.min_withdrawal}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 mb-8 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-gray-800 dark:text-white">New Request</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-wider">Method</label>
            <div className="grid grid-cols-2 gap-2">
              {['bkash', 'binance', 'nagad', 'usdt'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-3.5 rounded-2xl border-2 transition-all font-black uppercase text-[10px] tracking-widest ${
                    method === m 
                      ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20' 
                      : 'border-transparent bg-gray-50 dark:bg-black/20 text-gray-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-wider">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min ${settings.min_withdrawal}`}
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 text-lg font-black"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-wider">Payment Details</label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Number / Wallet Address"
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || user.balance < settings.min_withdrawal}
            className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl mt-2 flex items-center justify-center gap-3 transition-all active:scale-95 ${
              isSubmitting || user.balance < settings.min_withdrawal
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-blue-600 text-white shadow-blue-500/20'
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                Send Request
              </>
            )}
          </button>
        </form>
      </div>

      {/* History Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xl font-black tracking-tight">Withdraw History</h3>
          <button 
            onClick={fetchHistory}
            className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:opacity-50"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync
          </button>
        </div>

        {loadingHistory ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/50 p-12 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">No history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((req) => (
              <div 
                key={req.id} 
                className="bg-white dark:bg-gray-900 p-5 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-black/20 flex items-center justify-center text-blue-600 border border-gray-100 dark:border-gray-800 shadow-inner">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-black text-sm">{req.amount.toLocaleString()}</p>
                      <span className="text-[8px] bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full uppercase font-black text-blue-600">
                        {req.method}
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter truncate max-w-[120px]">
                      {req.details}
                    </p>
                    <p className="text-[8px] text-gray-300 mt-1 font-medium">{formatDate(req.timestamp)}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-current/20 ${getStatusColor(req.status)}`}>
                  {req.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdrawal;

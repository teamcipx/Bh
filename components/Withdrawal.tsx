
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
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white mb-6 shadow-xl">
        <h2 className="text-xl font-bold opacity-80">Available Balance</h2>
        <div className="text-4xl font-black mt-2 flex items-center gap-2">
          {user.balance.toLocaleString()}
          <span className="text-lg font-normal opacity-60">Coins</span>
        </div>
        <p className="mt-4 text-sm text-yellow-400 font-medium">
          Min. Withdrawal: {settings.min_withdrawal} Coins
        </p>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-[var(--tg-secondary-bg)] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 mb-8">
        <h3 className="text-lg font-bold mb-4">Request New Withdrawal</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {['bkash', 'binance', 'nagad', 'usdt'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-3 rounded-xl border-2 transition-all font-bold capitalize text-sm ${
                    method === m 
                      ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20' 
                      : 'border-transparent bg-white dark:bg-black/20 text-gray-500'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min ${settings.min_withdrawal}`}
              className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">Account Details</label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Phone Number or Address"
              className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || user.balance < settings.min_withdrawal}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg mt-2 flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isSubmitting || user.balance < settings.min_withdrawal
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-[var(--tg-button)] text-[var(--tg-button-text)] hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* History Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xl font-black">History</h3>
          <button 
            onClick={fetchHistory}
            className="text-blue-600 text-sm font-bold flex items-center gap-1 active:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loadingHistory ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-[var(--tg-secondary-bg)] p-10 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400 font-medium">No history yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((req) => (
              <div 
                key={req.id} 
                className="bg-[var(--tg-secondary-bg)] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-black/20 flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-black flex items-center gap-2 capitalize">
                      {req.amount.toLocaleString()} 
                      <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded uppercase font-bold text-gray-500">
                        {req.method}
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">{formatDate(req.timestamp)}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(req.status)}`}>
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

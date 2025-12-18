
import React, { useState } from 'react';
import { UserData, AppSettings } from '../types';
import { createWithdrawal } from '../firebase';
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
    } catch (err) {
      showAlert("Error submitting request. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 pb-24">
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold mb-2">Select Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            {['bkash', 'binance', 'nagad', 'usdt'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`py-3 rounded-xl border-2 transition-all font-bold capitalize ${
                  method === m 
                    ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Amount to Withdraw</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min ${settings.min_withdrawal}`}
            className="w-full bg-[var(--tg-secondary-bg)] border border-gray-200 dark:border-gray-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Account Details (Phone / ID)</label>
          <input
            type="text"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Enter your payment account details"
            className="w-full bg-[var(--tg-secondary-bg)] border border-gray-200 dark:border-gray-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || user.balance < settings.min_withdrawal}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg mt-4 flex items-center justify-center gap-2 ${
            isSubmitting || user.balance < settings.min_withdrawal
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-[var(--tg-button)] text-[var(--tg-button-text)]'
          }`}
        >
          {isSubmitting ? 'Processing...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default Withdrawal;

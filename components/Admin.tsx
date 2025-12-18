
import React, { useState, useEffect } from 'react';
import { AppSettings, WithdrawalRequest } from '../types';
import { updateAppSettings, getAllWithdrawals, updateWithdrawalStatus } from '../firebase';
import { hapticFeedback, showAlert } from '../telegram';

interface AdminProps {
  settings: AppSettings;
  refreshSettings: () => void;
}

const Admin: React.FC<AdminProps> = ({ settings, refreshSettings }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'withdrawals'>('settings');
  const [form, setForm] = useState<AppSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);

  useEffect(() => {
    if (activeTab === 'withdrawals') {
      loadWithdrawals();
    }
  }, [activeTab]);

  const loadWithdrawals = async () => {
    setLoadingWithdrawals(true);
    const data = await getAllWithdrawals();
    setWithdrawals(data);
    setLoadingWithdrawals(false);
  };

  const handleSave = async () => {
    setSaving(true);
    hapticFeedback();
    try {
      await updateAppSettings(form);
      showAlert("Settings synced!");
      refreshSettings();
    } catch (e) {
      showAlert("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (req: WithdrawalRequest, status: 'completed' | 'rejected') => {
    if (!req.id) return;
    hapticFeedback();
    try {
      await updateWithdrawalStatus(req.id, status, req.user_id, req.amount);
      showAlert(`Marked as ${status}`);
      loadWithdrawals();
    } catch (e) {
      showAlert("Status update failed.");
    }
  };

  return (
    <div className="p-4 pb-24 animate-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black">Admin Panel</h2>
          <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Root Controller</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'settings' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400'}`}
          >
            Settings
          </button>
          <button 
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'withdrawals' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400'}`}
          >
            Withdrawals
          </button>
        </div>
      </div>

      {activeTab === 'settings' ? (
        <div className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">System Notice</label>
              <textarea 
                value={form.notice}
                onChange={(e) => setForm({...form, notice: e.target.value})}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-xl p-4 text-sm font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Ad Reward</label>
                <input 
                  type="number"
                  value={form.ad_reward}
                  onChange={(e) => setForm({...form, ad_reward: parseInt(e.target.value)})}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-xl p-4 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Min. Goal</label>
                <input 
                  type="number"
                  value={form.min_withdrawal}
                  onChange={(e) => setForm({...form, min_withdrawal: parseInt(e.target.value)})}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-xl p-4 text-sm font-bold"
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            {saving ? 'Syncing...' : 'Save Configuration'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Requests</span>
            <button onClick={loadWithdrawals} className="text-blue-500 text-[10px] font-black uppercase">Refresh</button>
          </div>
          {loadingWithdrawals ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-bold uppercase text-xs">No pending requests.</div>
          ) : (
            withdrawals.map(req => (
              <div key={req.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-sm text-gray-900 dark:text-white">{req.amount.toLocaleString()} Coins</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{req.method} • {req.details}</p>
                    <p className="text-[8px] text-gray-300 font-mono mt-0.5">UID: {req.user_id}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    req.status === 'completed' ? 'bg-green-100 text-green-600' : 
                    req.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {req.status}
                  </span>
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusUpdate(req, 'completed')}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(req, 'rejected')}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;

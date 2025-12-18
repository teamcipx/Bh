
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { updateAppSettings } from '../firebase';
import { hapticFeedback, showAlert } from '../telegram';

interface AdminProps {
  settings: AppSettings;
  refreshSettings: () => void;
}

const Admin: React.FC<AdminProps> = ({ settings, refreshSettings }) => {
  const [form, setForm] = useState<AppSettings>(settings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    hapticFeedback();
    try {
      await updateAppSettings(form);
      showAlert("System configuration updated!");
      refreshSettings();
    } catch (e) {
      showAlert("Update failed. Check console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 pb-24 animate-in zoom-in duration-300">
      <div className="flex items-center gap-4 mb-8">
         <div className="w-12 h-12 bg-black text-white dark:bg-white dark:text-black rounded-2xl flex items-center justify-center shadow-xl">
           <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
         </div>
         <div>
            <h2 className="text-xl font-black">Admin Panel</h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Global Configuration</p>
         </div>
      </div>

      <div className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">System Notice</label>
            <textarea 
              value={form.notice}
              onChange={(e) => setForm({...form, notice: e.target.value})}
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Ad Reward</label>
              <input 
                type="number"
                value={form.ad_reward}
                onChange={(e) => setForm({...form, ad_reward: parseInt(e.target.value)})}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Min. Withdraw</label>
              <input 
                type="number"
                value={form.min_withdrawal}
                onChange={(e) => setForm({...form, min_withdrawal: parseInt(e.target.value)})}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Banner Image URL</label>
            <input 
              type="text"
              value={form.banner_url}
              onChange={(e) => setForm({...form, banner_url: e.target.value})}
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Banner Link URL</label>
            <input 
              type="text"
              value={form.banner_link}
              onChange={(e) => setForm({...form, banner_link: e.target.value})}
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? 'Synchronizing...' : 'Save Changes'}
        </button>
      </div>

      <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50">
         <p className="text-[10px] font-black uppercase text-indigo-500 mb-2 tracking-widest">Server Logic</p>
         <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium leading-relaxed italic">
           All changes are applied instantly to all connected clients via Firestore synchronization.
         </p>
      </div>
    </div>
  );
};

export default Admin;

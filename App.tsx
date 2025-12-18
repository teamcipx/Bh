
import React, { useState, useEffect, useCallback } from 'react';
import { UserData, AppSettings, Tab } from './types';
import { registerUser, getUserData, getAppSettings } from './firebase';
import { getTelegramUser, getStartParam, tg, hapticFeedback } from './telegram';
import Dashboard from './components/Dashboard';
import Referral from './components/Referral';
import Withdrawal from './components/Withdrawal';
import Profile from './components/Profile';

const App: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initApp = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tgUser = getTelegramUser();
      const referralCode = getStartParam();
      
      const config = await getAppSettings();
      setSettings(config);

      const registered = await registerUser(tgUser.id.toString(), referralCode, {
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
      });
      
      setUser(registered);

      tg?.expand();
      tg?.ready();
    } catch (err: any) {
      console.error("Initialization error:", err);
      setError(err.message || "Connection issue. Retrying...");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    if (!user) return;
    try {
      const updated = await getUserData(user.uid);
      if (updated) setUser(updated);
    } catch (e) {
      console.warn("Refresh failed", e);
    }
  };

  useEffect(() => {
    initApp();
  }, [initApp]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[var(--tg-bg)] text-[var(--tg-text)] p-8 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-xl font-bold">CoinEarn</h1>
        <p className="text-gray-500 mt-2">Connecting to Secure Backend...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[var(--tg-bg)] text-[var(--tg-text)] p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold">Network Offline</h1>
        <p className="text-gray-500 mt-2 mb-6">Device operates in offline mode. Sync will resume automatically.</p>
        <button 
          onClick={initApp}
          className="bg-[var(--tg-button)] text-[var(--tg-button-text)] px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const renderContent = () => {
    if (!user || !settings) return null;
    switch (activeTab) {
      case 'home': return <Dashboard user={user} settings={settings} refreshUser={refreshUser} />;
      case 'referral': return <Referral user={user} />;
      case 'withdraw': return <Withdrawal user={user} settings={settings} refreshUser={refreshUser} />;
      case 'profile': return <Profile user={user} />;
      default: return <Dashboard user={user} settings={settings} refreshUser={refreshUser} />;
    }
  };

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg> },
    { id: 'referral', label: 'Invite', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg> },
    { id: 'withdraw', label: 'Wallet', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg> },
    { id: 'profile', label: 'Profile', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4.553 16.776c.112-.223.298-.407.535-.527L8 15h8l2.912 1.249c.237.12.423.304.535.527a3.352 3.352 0 01.353 1.503V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-1.721c0-.535.123-1.062.353-1.503z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg> },
  ];

  if (!user || !settings) return null;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--tg-bg)] text-[var(--tg-text)] relative pb-20 overflow-x-hidden">
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 backdrop-blur-md bg-white/80 dark:bg-black/80">
        <h1 className="text-xl font-black text-blue-600">CoinEarn</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
          <span className="font-bold text-sm">{user.balance.toLocaleString()}</span>
        </div>
      </header>

      <main>
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[var(--tg-bg)] border-t border-gray-100 dark:border-gray-800 px-2 py-3 flex justify-around items-center z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              hapticFeedback();
              setActiveTab(item.id);
            }}
            className={`flex flex-col items-center gap-1 min-w-[64px] transition-all ${
              activeTab === item.id ? 'text-blue-600 scale-110' : 'text-gray-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;

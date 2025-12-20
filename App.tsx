
import React, { useState, useEffect, useCallback } from 'react';
import { UserData, AppSettings, Tab } from './types';
import { registerUser, getUserData, getAppSettings, completeTutorial } from './firebase';
import { getTelegramUser, tg, hapticFeedback } from './telegram';
import Dashboard from './components/Dashboard';
import Referral from './components/Referral';
import Withdrawal from './components/Withdrawal';
import Profile from './components/Profile';
import Chat from './components/Chat';
import Admin from './components/Admin';
import Tutorial from './components/Tutorial';

const ADMIN_ID = '7360769822';

const App: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  const initApp = useCallback(async () => {
    try {
      setLoading(true);
      
      const tgUser = getTelegramUser();
      const config = await getAppSettings();
      setSettings(config);

      const registered = await registerUser(tgUser.id.toString(), {
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
      });
      
      setUser(registered);

      if (registered && registered.hasSeenTutorial === false) {
        setShowTutorial(true);
      }

      tg?.expand();
      tg?.ready();
    } catch (err: any) {
      console.error("Initialization error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFinishTutorial = async () => {
    if (!user) return;
    setShowTutorial(false);
    await completeTutorial(user.uid);
    refreshUser();
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const updated = await getUserData(user.uid);
      if (updated) setUser(updated);
    } catch (e) {
      console.warn("Refresh failed", e);
    }
  };

  const refreshSettings = async () => {
    const config = await getAppSettings();
    setSettings(config);
  };

  useEffect(() => {
    initApp();
  }, [initApp]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[var(--tg-bg)] text-[var(--tg-text)] p-8 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-xl"></div>
        <h1 className="text-2xl font-black tracking-tighter text-blue-600 animate-pulse">CoinEarn</h1>
        <p className="text-gray-400 mt-2 font-bold uppercase text-[10px] tracking-widest">লোডিং হচ্ছে...</p>
      </div>
    );
  }

  if (showTutorial) {
    return <Tutorial onFinish={handleFinishTutorial} />;
  }

  const renderContent = () => {
    if (!user || !settings) return null;
    switch (activeTab) {
      case 'home': return <Dashboard user={user} settings={settings} refreshUser={refreshUser} />;
      case 'chat': return <Chat user={user} />;
      case 'referral': return <Referral user={user} refreshUser={refreshUser} />;
      case 'withdraw': return <Withdrawal user={user} settings={settings} refreshUser={refreshUser} />;
      case 'profile': return <Profile user={user} navigateToAdmin={() => setActiveTab('admin')} isAdmin={user.uid === ADMIN_ID} />;
      case 'admin': return user.uid === ADMIN_ID ? <Admin settings={settings} refreshSettings={refreshSettings} /> : null;
      default: return <Dashboard user={user} settings={settings} refreshUser={refreshUser} />;
    }
  };

  if (!user || !settings) return null;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--tg-bg)] text-[var(--tg-text)] relative pb-20 overflow-x-hidden select-none">
      <header className="sticky top-0 z-[60] px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 backdrop-blur-xl bg-white/70 dark:bg-black/70 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
             <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none tracking-tight">CoinEarn</h1>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[8px] font-black uppercase text-green-500 tracking-widest">লাইভ নেটওয়ার্ক</span>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => { hapticFeedback(); setActiveTab('withdraw'); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 text-orange-600 border border-orange-100 dark:border-orange-800/30 rounded-2xl shadow-sm active:scale-95 transition-all"
        >
          <span className="font-black text-sm tracking-tight">{(user.balance ?? 0).toLocaleString()}</span>
          <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
             <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 px-2 py-4 flex justify-around items-center z-[70]">
        {[
          { id: 'home', label: 'ড্যাশবোর্ড', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} /></svg> },
          { id: 'chat', label: 'ইনবক্স', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
          { id: 'referral', label: 'ইনভাইট', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} /></svg> },
          { id: 'withdraw', label: 'ওয়ালেট', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} /></svg> },
          { id: 'profile', label: 'প্রোফাইল', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4.553 16.776c.112-.223.298-.407.535-.527L8 15h8l2.912 1.249c.237.12.423.304.535.527a3.352 3.352 0 01.353 1.503V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-1.721c0-.535.123-1.062.353-1.503z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} /></svg> },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              hapticFeedback();
              setActiveTab(item.id as Tab);
            }}
            className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-all duration-300 relative ${
              activeTab === item.id ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            {activeTab === item.id && (
               <div className="absolute -top-4 w-8 h-1 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
            )}
            {item.icon}
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;


import React, { useState, useEffect, useRef } from 'react';
import { UserData, Message } from '../types';
import { getMessages } from '../firebase';

interface ChatProps {
  user: UserData;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      const data = await getMessages(user.uid);
      setMessages(data.reverse());
      setLoading(false);
    };
    fetch();
    const interval = setInterval(fetch, 6000); 
    return () => clearInterval(interval);
  }, [user.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#F8FAFC] dark:bg-black/20">
      {/* Bot Header */}
      <div className="p-5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg relative">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
          </div>
          <div>
            <h2 className="font-black text-sm text-gray-800 dark:text-white">CoinEarn AI Bot</h2>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active System Status</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-hide"
      >
        {loading ? (
          <div className="flex justify-center py-10 opacity-30">
             <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <p className="text-xs font-bold uppercase tracking-widest">Awaiting Messages...</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={m.id || i} className="flex flex-col items-start animate-in slide-in-from-left duration-500">
              <div className="max-w-[85%] bg-white dark:bg-gray-800 p-4 rounded-[1.5rem] rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-800">
                <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200 leading-relaxed">
                  {m.text}
                </p>
                <div className="flex items-center justify-end gap-1 mt-2">
                  <span className="text-[8px] text-gray-400 font-black uppercase">{formatTime(m.timestamp)}</span>
                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="bg-gray-50 dark:bg-black/20 px-6 py-3 rounded-2xl text-[9px] text-center text-gray-400 font-black uppercase tracking-[0.2em]">
          Read-Only Notification System
        </div>
      </div>
    </div>
  );
};

export default Chat;

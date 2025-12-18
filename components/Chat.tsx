
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
    const interval = setInterval(fetch, 5000); // Polling every 5 seconds for "SMS" feel
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
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#f0f2f5] dark:bg-black/40">
      {/* Bot Header */}
      <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-lg">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </div>
          <div>
            <h2 className="font-black text-sm text-gray-800 dark:text-white">CoinEarn Support Bot</h2>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-green-500 font-bold uppercase">Online SMS Bot</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
      >
        {loading ? (
          <div className="flex justify-center py-10 opacity-50">
             <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-12 h-12 opacity-20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm italic">No notifications yet.</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={m.id || i} className="flex flex-col animate-in slide-in-from-left duration-300">
              <div className="max-w-[90%] bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none shadow-md border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
                  {m.text}
                </p>
                <div className="flex items-center justify-end gap-1 mt-2">
                  <span className="text-[9px] text-gray-400 font-mono uppercase">{formatTime(m.timestamp)}</span>
                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="bg-gray-50 dark:bg-black/20 px-4 py-3 rounded-xl text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
          ⚠️ This is a read-only notification channel
        </div>
      </div>
    </div>
  );
};

export default Chat;


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
    const interval = setInterval(fetch, 10000); // Poll every 10s
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
    <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-50 dark:bg-black/40">
      <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="font-black text-sm">CoinEarn Bot</h2>
          <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Online
          </p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {loading ? (
          <div className="flex justify-center py-10 opacity-50">Loading history...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm italic">
            No messages yet. Start earning to see bot updates!
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={m.id || i} className="flex flex-col animate-in slide-in-from-left duration-300">
              <div className="max-w-[85%] bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                <p className="text-[9px] text-gray-400 text-right mt-1 font-mono uppercase">{formatTime(m.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
        <div className="flex-1 bg-gray-100 dark:bg-black/20 px-4 py-2.5 rounded-full text-xs text-gray-400 italic flex items-center">
          You cannot reply to bot messages
        </div>
      </div>
    </div>
  );
};

export default Chat;

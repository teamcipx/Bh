
import React, { useState } from 'react';

interface TutorialProps {
  onFinish: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onFinish }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "CoinEarn-এ স্বাগতম!",
      desc: "প্রতিদিন সহজ বিজ্ঞাপন দেখে এবং বন্ধুদের ইনভাইট করে কয়েন ইনকাম শুরু করুন।",
      icon: (
        <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50 animate-bounce">
           <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
        </div>
      )
    },
    {
      title: "কীভাবে ইনকাম করবেন?",
      desc: "ড্যাশবোর্ড থেকে বিজ্ঞাপন দেখুন। ১০০০ কয়েন সমান ১০ টাকা (BDT)। ইনভাইট করলে পাবেন বোনাস!",
      icon: (
        <div className="flex gap-4">
           <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg"><span className="text-2xl text-white font-black">Ad</span></div>
           <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg"><span className="text-2xl text-white font-black">৳</span></div>
        </div>
      )
    },
    {
      title: "টাকা তুলুন সহজে",
      desc: "বিকাশ, নগদ বা বাইনান্সের মাধ্যমে সরাসরি আপনার অ্যাকাউন্টে টাকা তুলে নিন।",
      icon: (
        <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl rotate-12">
           <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      <div className="mb-12">
        {steps[step].icon}
      </div>
      
      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
        {steps[step].title}
      </h2>
      
      <p className="text-gray-500 dark:text-gray-400 font-bold leading-relaxed max-w-xs mb-12">
        {steps[step].desc}
      </p>

      <div className="flex gap-2 mb-10">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200 dark:bg-gray-800'}`}></div>
        ))}
      </div>

      <button
        onClick={nextStep}
        className="w-full max-w-xs py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-500/30 active:scale-95 transition-all"
      >
        {step === steps.length - 1 ? 'শুরু করি' : 'পরবর্তী'}
      </button>

      {step < steps.length - 1 && (
        <button onClick={onFinish} className="mt-6 text-[10px] font-black uppercase tracking-widest text-gray-400">বাদ দিন</button>
      )}
    </div>
  );
};

export default Tutorial;

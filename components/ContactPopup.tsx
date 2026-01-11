
import React from 'react';
import { translations } from '../translations';

interface ContactPopupProps {
  onClose: () => void;
  language: 'en' | 'ta';
}

export const ContactPopup: React.FC<ContactPopupProps> = ({ onClose, language }) => {
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-white/40 dark:bg-black/40 animate-in">
      <div className="bg-white dark:bg-slate-950 w-full max-w-sm p-10 shadow-2xl border border-slate-300 dark:border-white/10 space-y-10">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4">
          <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">{t.contactUs}</h3>
          <button onClick={onClose} className="text-rose-600 font-black text-[10px] tracking-widest uppercase">CLOSE</button>
        </div>

        <div className="space-y-6">
          <a 
            href="https://www.instagram.com/d__codes?igsh=a3R5MTB1M21wNHQ2" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 group hover:border-indigo-600 transition-all"
          >
            <span className="text-xs font-black tracking-widest uppercase text-slate-700 dark:text-white/70">INSTAGRAM</span>
            <span className="text-[10px] text-indigo-600 group-hover:translate-x-1 transition-transform">D__CODES →</span>
          </a>

          <a 
            href="mailto:davidcodes2105@gmail.com" 
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 group hover:border-indigo-600 transition-all"
          >
            <span className="text-xs font-black tracking-widest uppercase text-slate-700 dark:text-white/70">EMAIL</span>
            <span className="text-[10px] text-indigo-600 group-hover:translate-x-1 transition-transform">DAVIDCODES... →</span>
          </a>
        </div>
        
        <p className="text-[8px] text-center tracking-[0.2em] font-black text-slate-400 dark:text-white/10 uppercase">
          Standard Response Protocol: 24-48 Hours
        </p>
      </div>
    </div>
  );
};

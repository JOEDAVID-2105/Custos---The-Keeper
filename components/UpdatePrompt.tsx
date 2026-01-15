
import React from 'react';
import { translations } from '../translations';

interface UpdatePromptProps {
  onUpdate: () => void;
  onLater: () => void;
  language: 'en' | 'ta';
}

export const UpdatePrompt: React.FC<UpdatePromptProps> = ({ onUpdate, onLater, language }) => {
  const t = translations[language].systemUpdate;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-md animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-600 text-white p-6 shadow-3xl border border-white/10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </div>
          <div>
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase">{t.available}</h4>
            <p className="text-[8px] opacity-60 tracking-widest mt-1 uppercase">Sovereign Protocol Refinement Detected</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={onUpdate}
            className="flex-1 bg-white text-indigo-600 py-3 text-[9px] font-black tracking-widest uppercase hover:bg-slate-900 hover:text-white transition-all font-noto"
          >
            {t.action}
          </button>
          <button 
            onClick={onLater}
            className="px-6 py-3 bg-black/20 text-white/60 text-[9px] font-black tracking-widest uppercase hover:bg-black/40 hover:text-white transition-all font-noto"
          >
            {t.later}
          </button>
        </div>
      </div>
    </div>
  );
};

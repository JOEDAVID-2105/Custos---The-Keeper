
import React, { useState } from 'react';
import { translations } from '../translations';
import { ContactPopup } from './ContactPopup';

interface AboutProps {
  onBack: () => void;
  onNavigateToFeedback: (type: 'issue' | 'update') => void;
  language: 'en' | 'ta';
}

export const About: React.FC<AboutProps> = ({ onBack, onNavigateToFeedback, language }) => {
  const [showContact, setShowContact] = useState(false);
  const t = translations[language];

  return (
    <div className="animate-in w-full max-w-4xl mx-auto space-y-16 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase font-noto">{t.aboutApp}</h2>
          <p className="text-slate-800 dark:text-white/30 tracking-[0.4em] text-[10px] mt-1 uppercase font-black">{t.theKeeper}</p>
        </div>
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
        >
          {t.backToProfile}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-12 border-t border-slate-300 dark:border-white/5">
        <div className="space-y-8">
          <div>
            <h3 className="text-[9px] tracking-[0.5em] font-black text-slate-500 dark:text-white/20 uppercase mb-4">{t.about.missionTitle}</h3>
            <p className="text-xl md:text-3xl font-light tracking-tight text-slate-900 dark:text-white/90 leading-tight font-noto">
              {t.about.missionBody}
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-[9px] tracking-[0.5em] font-black text-slate-500 dark:text-white/20 uppercase">{t.about.updatesTitle}</h3>
            <ul className="space-y-2">
              <li className="text-xs font-bold text-slate-700 dark:text-white/60 uppercase tracking-widest">• {t.about.update1}</li>
              <li className="text-xs font-bold text-slate-700 dark:text-white/60 uppercase tracking-widest">• {t.about.update2}</li>
              <li className="text-xs font-bold text-slate-700 dark:text-white/60 uppercase tracking-widest">• {t.about.update3}</li>
            </ul>
          </div>
        </div>

        <div className="space-y-8 bg-slate-100 dark:bg-white/[0.02] p-8 md:p-12 border border-slate-300 dark:border-white/10">
          <div className="space-y-6">
            <button 
              onClick={() => setShowContact(true)}
              className="w-full py-4 border border-indigo-600/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all shadow-md"
            >
              {t.contactUs}
            </button>
            <button 
              onClick={() => onNavigateToFeedback('issue')}
              className="w-full py-4 border border-rose-500/30 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all shadow-md"
            >
              {t.reportIssue}
            </button>
            <button 
              onClick={() => onNavigateToFeedback('update')}
              className="w-full py-4 border border-slate-400 dark:border-white/20 text-slate-600 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-950 transition-all shadow-md"
            >
              {t.suggestUpdate}
            </button>
          </div>

          <div className="pt-8 border-t border-slate-300 dark:border-white/5 space-y-2">
             <p className="text-[8px] tracking-[0.2em] font-black text-slate-500 dark:text-white/20 uppercase">{t.about.version}: 1.2.0 [CONFIDO]</p>
             <p className="text-[8px] tracking-[0.2em] font-black text-slate-500 dark:text-white/20 uppercase">{t.about.proprietor}: D'CODES / DAVID CODES</p>
          </div>
        </div>
      </div>

      {showContact && <ContactPopup onClose={() => setShowContact(false)} language={language} />}
    </div>
  );
};

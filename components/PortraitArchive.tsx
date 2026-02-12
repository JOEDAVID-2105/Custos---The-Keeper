
import React from 'react';
import { translations } from '../translations';

// Define a more specific type for the language prop
type Language = keyof typeof translations;

interface PortraitArchiveProps {
  onUpdateProfile: (photoURL: string) => void;
  onBack: () => void;
  language: Language;
}

const base = 'https://ybjcohweyeyasokqnlnv.supabase.co/storage/v1/object/public/pfps/pfp_';
const m_indices = [1, 11, 3, 4, 5, 6, 7, 8, 9, 10];
const f_indices = [2, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const M_PORTRAITS = m_indices.map(i => `${base}${i.toString().padStart(2, '0')}.png`);
const F_PORTRAITS = f_indices.map(i => `${base}${i.toString().padStart(2, '0')}.png`);

export const PortraitArchive: React.FC<PortraitArchiveProps> = ({ onUpdateProfile, onBack, language }) => {
  const t = translations[language];

  const handleSelect = (url: string) => {
    onUpdateProfile(url);
    onBack();
  };

  const handleRemovePFP = () => {
    onUpdateProfile('');
    onBack();
  };

  return (
    <div className="w-full animate-in space-y-12">
      <div className="text-center">
        <h2 className="text-5xl font-black tracking-tighter uppercase text-slate-900 dark:text-white font-noto">{t.portraitArchive}</h2>
        <p className="text-slate-800 dark:text-white/50 tracking-[0.5em] text-[10px] mt-3 uppercase font-noto">{t.selectYourGuardian}</p>
      </div>

      <div className="space-y-10">
        <div className="space-y-6">
          <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900 dark:text-white font-noto">{t.masculine}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {M_PORTRAITS.map(p => (
              <button key={p} onClick={() => handleSelect(p)} className="aspect-square bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-lg hover:scale-105 hover:shadow-indigo-500/30 transition-all duration-300">
                <img src={p} alt="Masculine Portrait" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900 dark:text-white font-noto">{t.feminine}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {F_PORTRAITS.map(p => (
              <button key={p} onClick={() => handleSelect(p)} className="aspect-square bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-lg hover:scale-105 hover:shadow-indigo-500/30 transition-all duration-300">
                <img src={p} alt="Feminine Portrait" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="pt-12 border-t border-slate-300 dark:border-white/5 flex flex-col items-center justify-center gap-4">
        <button 
          onClick={handleRemovePFP}
          className="text-sm tracking-[0.3em] font-black uppercase text-rose-600 hover:text-rose-400 transition-colors font-noto"
        >
          {t.removePFP}
        </button>
        <p className="text-slate-500 dark:text-white/30 tracking-widest text-[10px] uppercase font-noto">{t.removePFPDesc}</p>
      </div>
    </div>
  );
};

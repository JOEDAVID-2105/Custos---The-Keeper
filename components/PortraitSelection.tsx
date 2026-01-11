
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { translations } from '../translations';
import { InitialShield } from './InitialShield';

interface PortraitSelectionProps {
  profile: UserProfile;
  onUpdate: (p: UserProfile) => void;
  onBack: () => void;
  language: 'en' | 'ta';
}

export const PortraitSelection: React.FC<PortraitSelectionProps> = ({ 
  profile, 
  onUpdate, 
  onBack, 
  language 
}) => {
  const t = translations[language];
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Assets organized by gender folders as requested
  const menPortraits = Array.from({ length: 10 }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0');
    return `./assets/men/pfp_${num}.png`;
  });

  const womenPortraits = Array.from({ length: 10 }, (_, i) => {
    const num = (i + 11).toString().padStart(2, '0'); // Assuming 11-20 are women
    return `./assets/women/pfp_${num}.png`;
  });

  const selectPortrait = (url: string | undefined) => {
    onUpdate({ ...profile, photoURL: url });
    onBack();
  };

  const handleImageError = (url: string) => {
    setBrokenImages(prev => ({ ...prev, [url]: true }));
  };

  const PortraitGrid = ({ title, items, subtitle }: { title: string, subtitle: string, items: string[] }) => (
    <div className="space-y-8 animate-in">
       <div className="border-l-2 border-indigo-600 pl-4 py-1">
         <h3 className="text-sm font-black tracking-[0.4em] text-slate-900 dark:text-white uppercase font-noto">{title}</h3>
         <p className="text-[8px] tracking-[0.3em] text-slate-500 dark:text-white/30 uppercase mt-1 font-noto">{subtitle}</p>
       </div>
       <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-3">
          {items.map((url, idx) => {
            const isSelected = profile.photoURL === url;
            const isBroken = brokenImages[url];
            return (
              <button 
                key={url}
                onClick={() => selectPortrait(url)}
                className={`aspect-square relative overflow-hidden border transition-all duration-500 group ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-600/20 z-10 scale-105' : 'border-slate-300 dark:border-white/5 opacity-40 hover:opacity-100 hover:border-indigo-600/40'}`}
              >
                {!isBroken ? (
                  <img 
                    src={url} 
                    alt={`PFP ${idx+1}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    onError={() => handleImageError(url)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-white/[0.02]">
                    <span className="text-[10px] font-black text-slate-400 dark:text-white/10 uppercase">#{idx+1}</span>
                  </div>
                )}
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-indigo-600/50"></div>
                )}
              </button>
            );
          })}
       </div>
    </div>
  );

  return (
    <div className="animate-in w-full max-w-4xl mx-auto space-y-16 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase font-noto">{t.profile.portraitArchive}</h2>
          <p className="text-slate-800 dark:text-white/30 tracking-[0.4em] text-[10px] mt-1 uppercase font-black font-noto">{t.profile.selectIdentity}</p>
        </div>
        <button 
          onClick={onBack}
          className="px-8 py-3 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-white/50 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 transition-all font-noto"
        >
          {t.profile.cancel}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-12 border-t border-slate-300 dark:border-white/5">
         <div className="space-y-16">
            <PortraitGrid 
              title={t.profile.masculineArchive} 
              subtitle="PATRIARCH COLLECTION"
              items={menPortraits} 
            />
            
            <PortraitGrid 
              title={t.profile.feminineArchive} 
              subtitle="MATRIARCH COLLECTION"
              items={womenPortraits} 
            />
         </div>

         <div className="space-y-12">
            <div className="p-10 border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.02] flex flex-col items-center gap-8 text-center sticky top-24">
               <h3 className="text-[10px] font-black tracking-[0.4em] text-slate-500 dark:text-white/30 uppercase font-noto">CURRENT RESOLUTION</h3>
               <div className="w-40 h-40 border border-slate-400 dark:border-white/10 p-4 shadow-3xl bg-white dark:bg-transparent">
                  {profile.photoURL ? (
                    <img src={profile.photoURL} alt="Active" className="w-full h-full object-cover" />
                  ) : (
                    <InitialShield name={profile.displayName} size="lg" />
                  )}
               </div>
               <div className="space-y-6 w-full">
                  <div className="space-y-2">
                     <p className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white font-noto">{profile.displayName}</p>
                     <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{t.guardian}</p>
                  </div>
                  
                  <button 
                    onClick={() => selectPortrait(undefined)}
                    className="w-full py-5 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all font-noto shadow-lg group"
                  >
                    <span className="block">{t.profile.dissolvePortrait}</span>
                    <span className="block text-[7px] opacity-40 group-hover:opacity-100 mt-1">{t.profile.dissolvePortraitDesc}</span>
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

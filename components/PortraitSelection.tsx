
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

const SilhouetteIcon = ({ type, seed }: { type: 'men' | 'women' | 'mixed', seed: number }) => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full p-6 opacity-20">
      <defs>
        <linearGradient id={`grad-${type}-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: '#4f46e5', stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="35" r="15" fill="currentColor" />
      <path 
        d={type === 'women' 
          ? "M25 90 Q25 65 50 65 Q75 65 75 90" 
          : "M20 90 Q20 60 50 60 Q80 60 80 90"} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
      />
      <rect x="0" y="0" width="100" height="100" fill={`url(#grad-${type}-${seed})`} />
    </svg>
  );
};

export const PortraitSelection: React.FC<PortraitSelectionProps> = ({ 
  profile, 
  onUpdate, 
  onBack, 
  language 
}) => {
  const t = translations[language];
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [activeBroken, setActiveBroken] = useState(false);

  /**
   * PHOTO ARCHIVE PROTOCOL:
   * Supporting up to 202 portraits as requested.
   * Path format: /assets/pfp_XX.png
   */
  const portraits = Array.from({ length: 202 }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0');
    return `/assets/pfp_${num}.png`;
  });

  // Batching the 202 images for cleaner display
  const batches = [
    { name: "ARCHIVE ALPHA", start: 0, end: 50 },
    { name: "ARCHIVE BETA", start: 50, end: 100 },
    { name: "ARCHIVE GAMMA", start: 100, end: 150 },
    { name: "ARCHIVE DELTA", start: 150, end: 202 }
  ];

  const selectPortrait = (url: string | undefined) => {
    onUpdate({ ...profile, photoURL: url });
    onBack();
  };

  const handleImageError = (url: string) => {
    setBrokenImages(prev => ({ ...prev, [url]: true }));
    setLoadingImages(prev => ({ ...prev, [url]: false }));
  };

  const handleImageLoad = (url: string) => {
    setLoadingImages(prev => ({ ...prev, [url]: false }));
  };

  const PortraitGrid = ({ title, items, type, subtitle }: { title: string, subtitle: string, items: string[], type: 'men' | 'women' | 'mixed' }) => (
    <div className="space-y-8 animate-in">
       <div className="border-l-2 border-indigo-600 pl-4 py-1">
         <h3 className="text-sm font-black tracking-[0.4em] text-slate-900 dark:text-white uppercase font-noto">{title}</h3>
         <p className="text-[8px] tracking-[0.3em] text-slate-500 dark:text-white/30 uppercase mt-1 font-noto">{subtitle}</p>
       </div>
       <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {items.map((url, idx) => {
            const isSelected = profile.photoURL === url;
            const isBroken = brokenImages[url];
            const isLoading = loadingImages[url] !== false;
            
            return (
              <button 
                key={url}
                onClick={() => selectPortrait(url)}
                className={`aspect-square relative overflow-hidden border transition-all duration-700 group flex items-center justify-center ${isSelected ? 'border-indigo-600 ring-4 ring-indigo-600/10 z-10 scale-105 bg-indigo-600/5' : 'border-slate-300 dark:border-white/5 opacity-80 hover:opacity-100 hover:border-indigo-600/40 bg-slate-100 dark:bg-white/[0.02]'}`}
              >
                {!isBroken ? (
                  <>
                    <img 
                      src={url} 
                      alt="PFP" 
                      className={`w-full h-full object-cover transition-all duration-1000 ${isLoading ? 'opacity-0 scale-90' : 'opacity-100 scale-100 group-hover:scale-125'}`} 
                      onLoad={() => handleImageLoad(url)}
                      onError={() => handleImageError(url)}
                    />
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-white/5">
                        <div className="w-4 h-4 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-white/10 transition-colors group-hover:text-indigo-500">
                    <SilhouetteIcon type={type} seed={idx} />
                  </div>
                )}
                <div className={`absolute inset-0 transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'} bg-indigo-600/10`}></div>
              </button>
            );
          })}
       </div>
    </div>
  );

  return (
    <div className="animate-in w-full max-w-5xl mx-auto space-y-16 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase font-noto">{t.profile.portraitArchive}</h2>
          <p className="text-slate-800 dark:text-white/30 tracking-[0.4em] text-[10px] mt-1 uppercase font-black font-noto">{t.profile.selectIdentity}</p>
        </div>
        <button 
          onClick={onBack}
          className="px-10 py-3 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-white/50 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-noto shadow-xl"
        >
          {t.profile.cancel}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-12 border-t border-slate-300 dark:border-white/5">
         <div className="lg:col-span-8 space-y-20">
            {batches.map((batch, i) => (
              <PortraitGrid 
                key={batch.name}
                title={batch.name} 
                subtitle={`COLLECTION INDEX ${i + 1}`}
                type="mixed"
                items={portraits.slice(batch.start, batch.end)} 
              />
            ))}
         </div>

         <div className="lg:col-span-4">
            <div className="p-10 border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.01] flex flex-col items-center gap-10 text-center sticky top-24">
               <div className="space-y-2">
                 <h3 className="text-[10px] font-black tracking-[0.4em] text-slate-500 dark:text-white/20 uppercase font-noto">ACTIVE IDENTITY</h3>
                 <div className="h-px w-12 bg-indigo-600 mx-auto"></div>
               </div>
               
               <div className="w-48 h-48 border border-slate-400 dark:border-white/10 p-4 shadow-3xl bg-white dark:bg-transparent overflow-hidden relative group">
                  {profile.photoURL && !activeBroken ? (
                    <img 
                      src={profile.photoURL} 
                      alt="Active" 
                      className="w-full h-full object-cover transition-transform duration-700" 
                      onError={() => setActiveBroken(true)}
                    />
                  ) : (
                    <InitialShield name={profile.displayName} size="lg" />
                  )}
                  <div className="absolute inset-0 border border-indigo-600/20 group-hover:scale-95 transition-transform duration-500 pointer-events-none"></div>
               </div>

               <div className="space-y-8 w-full">
                  <div className="space-y-2">
                     <p className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white font-noto">{profile.displayName}</p>
                     <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{t.guardian}</p>
                  </div>
                  
                  <div className="pt-8 border-t border-slate-200 dark:border-white/5 space-y-4">
                    <button 
                      onClick={() => selectPortrait(undefined)}
                      className="w-full py-5 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all font-noto shadow-lg group"
                    >
                      <span className="block">{t.profile.dissolvePortrait}</span>
                      <span className="block text-[7px] opacity-40 group-hover:opacity-100 mt-1">{t.profile.dissolvePortraitDesc}</span>
                    </button>
                    <p className="text-[8px] text-slate-400 dark:text-white/20 uppercase tracking-widest font-noto">
                      Changes are synchronized across the household protocol instantly.
                    </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { CURRENCIES, TrashIcon } from '../constants';
import { StorageService } from '../services/storageService';
import { auth } from '../services/firebase';
import { translations } from '../translations';
import { InitialShield } from './InitialShield';

interface ProfileProps {
  profile: UserProfile;
  onUpdate: (p: UserProfile) => void;
  onToggleLanguage: () => void;
  onGoCloud: () => void;
  onNavigateToEditLimits: () => void;
  onOpenContact: () => void;
  deferredPrompt?: any;
  fontSize: number;
  setFontSize: (s: number) => void;
}

export const Profile: React.FC<ProfileProps> = ({ 
  profile, 
  onUpdate, 
  onGoCloud,
  onOpenContact,
  deferredPrompt,
  fontSize,
  setFontSize
}) => {
  const [joinId, setJoinId] = useState('');
  const [familyMetadata, setFamilyMetadata] = useState<{ name: string; creatorId: string } | null>(null);
  const [familyMembers, setFamilyMembers] = useState<UserProfile[]>([]);
  const [isNamingFamily, setIsNamingFamily] = useState(false);
  const [tempFamilyName, setTempFamilyName] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  
  // Font States
  const [previewFontSize, setPreviewFontSize] = useState(fontSize);
  const [isLocked, setIsLocked] = useState(true);
  const [unlockProgress, setUnlockProgress] = useState(0);
  const unlockTimerRef = useRef<any>(null);

  const familyId = profile.familyId;
  const language = profile.language || 'en';
  const t = translations[language];

  useEffect(() => {
    setPreviewFontSize(fontSize);
  }, [fontSize]);

  // Live Preview Font Effect
  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size', `${previewFontSize}px`);
  }, [previewFontSize]);

  useEffect(() => {
    if (familyId) {
      const unsubMeta = StorageService.subscribeToFamilyMetadata(familyId, (data) => {
        setFamilyMetadata(data);
      });
      const unsubMembers = StorageService.subscribeToFamilyMembers(familyId, (users) => {
        setFamilyMembers(users);
      });
      return () => {
        unsubMeta();
        unsubMembers();
      };
    } else {
      setFamilyMetadata(null);
      setFamilyMembers([]);
    }
  }, [familyId]);

  const handleApplyFont = () => {
    setFontSize(previewFontSize);
    setIsLocked(true);
  };

  const handleRevertFont = () => {
    setPreviewFontSize(fontSize);
    setIsLocked(true);
  };

  const startUnlock = () => {
    let progress = 0;
    unlockTimerRef.current = setInterval(() => {
      progress += 10; // 10% every 100ms = 100% in 1s
      setUnlockProgress(progress);
      if (progress >= 100) {
        setIsLocked(false);
        setUnlockProgress(0);
        clearInterval(unlockTimerRef.current);
      }
    }, 100);
  };

  const stopUnlock = () => {
    if (!isLocked) return;
    clearInterval(unlockTimerRef.current);
    setUnlockProgress(0);
  };

  const createFamily = async () => {
    if (!tempFamilyName.trim()) return;
    const newId = await StorageService.createFamily(tempFamilyName.trim());
    if (newId) {
      onUpdate({ ...profile, familyId: newId });
      setIsNamingFamily(false);
      setTempFamilyName('');
    }
  };

  const joinFamily = async () => {
    if (!joinId.trim()) return;
    await StorageService.joinFamily(joinId.trim());
    onUpdate({ ...profile, familyId: joinId.trim() });
    setJoinId('');
  };

  const leaveFamily = async () => {
    await StorageService.leaveFamily();
    onUpdate({ ...profile, familyId: undefined });
  };

  const updateFamilyName = async (name: string) => {
    if (familyId && name.trim() && familyMetadata?.creatorId === auth.currentUser?.uid) {
      await StorageService.updateFamilyName(familyId, name.trim());
    }
  };

  const handleCopyId = () => {
    if (familyId) {
      navigator.clipboard.writeText(familyId);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const removeMember = async (memberUid: string) => {
    if (confirm("Remove this member from the sovereign household?")) {
      await StorageService.removeMemberFromFamily(memberUid);
    }
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        }
      });
    }
  };

  const isFamilyCreator = familyMetadata?.creatorId === auth.currentUser?.uid;

  return (
    <div className="animate-in w-full space-y-16 pb-20">
      <div className="text-center">
        <h2 className="text-5xl font-black tracking-tighter uppercase text-slate-900 dark:text-white font-noto">{t.identity}</h2>
        <p className="text-slate-800 dark:text-white/50 tracking-[0.5em] text-[10px] mt-3 uppercase font-noto">{t.guardianConfig}</p>
      </div>

      <div className="space-y-12">
        <div className="flex flex-col items-center gap-8">
          {!auth.currentUser && (
            <button 
              onClick={onGoCloud}
              className="w-full max-sm py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-900 transition-all rounded-sm shadow-xl font-noto"
            >
              {t.profile.goCloud}
            </button>
          )}

          <div className="w-32 h-32 border border-slate-400 dark:border-white/10 p-3 bg-slate-50 dark:bg-white/[0.02] shadow-2xl flex items-center justify-center">
            <InitialShield name={profile.displayName} size="lg" />
          </div>

          <div className="text-center space-y-2">
             <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white font-noto">{profile.displayName}</p>
             <div className="inline-flex items-center gap-2 px-3 py-1 border border-indigo-500/20 bg-indigo-500/5">
                <div className={`w-1 h-1 rounded-full ${profile.isCloudGuardian ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'}`}></div>
                <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest font-noto">
                  {profile.isCloudGuardian ? t.profile.syncActive : t.profile.syncLocal}
                </p>
             </div>
          </div>
        </div>

        {deferredPrompt && (
          <div className="pt-8 border-t border-slate-300 dark:border-white/5">
             <button 
               onClick={handleInstallClick}
               className="w-full py-5 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-emerald-700 transition-all shadow-lg font-noto"
             >
               {t.install.button}
             </button>
          </div>
        )}

        {/* Font Control Interface */}
        <div className="pt-16 border-t border-slate-300 dark:border-white/5">
          <div className="flex justify-between items-end mb-8">
            <p className="text-[9px] tracking-[0.5em] font-black text-slate-800 dark:text-white/50 uppercase font-noto">{t.profile.fontSize}</p>
            <div className="flex items-center gap-3">
              <span className={`text-[8px] font-black uppercase tracking-widest ${isLocked ? 'text-rose-500' : 'text-emerald-500 animate-pulse'}`}>
                {isLocked ? t.profile.locked : t.profile.unlocked}
              </span>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{previewFontSize}px</p>
            </div>
          </div>
          
          <div className="px-4 space-y-10 relative">
            <div className={`transition-all duration-500 ${isLocked ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
              <input 
                type="range" 
                min="12" 
                max="24" 
                step="1" 
                value={previewFontSize} 
                onChange={(e) => setPreviewFontSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full appearance-none accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between mt-4">
                <span className="text-[8px] font-black text-slate-400 dark:text-white/30 uppercase">{language === 'ta' ? 'சிறியது' : 'compact'}</span>
                <span className="text-[8px] font-black text-slate-400 dark:text-white/30 uppercase">{language === 'ta' ? 'சாதாரணமானது' : 'standard'}</span>
                <span className="text-[8px] font-black text-slate-400 dark:text-white/30 uppercase">{language === 'ta' ? 'பெரியது' : 'magnified'}</span>
              </div>
            </div>

            {isLocked && (
              <div className="flex flex-col items-center gap-4 py-4">
                <button 
                  onMouseDown={startUnlock}
                  onMouseUp={stopUnlock}
                  onMouseLeave={stopUnlock}
                  onTouchStart={startUnlock}
                  onTouchEnd={stopUnlock}
                  className="relative px-8 py-3 bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-white/50 overflow-hidden"
                >
                  <div 
                    className="absolute inset-0 bg-indigo-600/20 transition-all duration-100 ease-linear"
                    style={{ width: `${unlockProgress}%` }}
                  />
                  <span className="relative z-10">{t.profile.holdToUnlock}</span>
                </button>
              </div>
            )}

            {!isLocked && (
              <div className="flex flex-wrap justify-center gap-4 animate-in">
                <button 
                  onClick={handleApplyFont}
                  className="px-8 py-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-xl font-noto"
                >
                  {t.profile.applyChanges}
                </button>
                <button 
                  onClick={handleRevertFont}
                  className="px-8 py-3 border border-slate-300 dark:border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-white/50 font-noto"
                >
                  {t.profile.revert}
                </button>
                <button 
                  onClick={() => { setPreviewFontSize(16); handleApplyFont(); }}
                  className="px-8 py-3 border border-indigo-600/30 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 font-noto"
                >
                  {t.profile.resetToDefault}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-16 border-t border-slate-300 dark:border-white/5 space-y-10">
          <div className="flex flex-col gap-2">
            <p className="text-[9px] tracking-[0.5em] font-black text-slate-800 dark:text-white/50 uppercase font-noto">{t.profile.householdSovereignty}</p>
            {familyMetadata ? (
              <p className="text-3xl font-black tracking-tighter text-indigo-600 uppercase transition-all font-noto">{familyMetadata.name}</p>
            ) : (
              <p className="text-lg font-light tracking-tight text-slate-600 dark:text-white/30 italic font-noto">{t.profile.noHousehold}</p>
            )}
          </div>
          
          {familyId ? (
            <div className="space-y-12 animate-in">
              <div className="space-y-6">
                 <h3 className="text-[9px] tracking-[0.5em] font-black text-slate-800 dark:text-white/50 uppercase font-noto">{t.profile.householdMembers}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {familyMembers.map(member => (
                       <div key={member.uid} className="flex items-center justify-between p-4 border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
                          <div className="flex items-center gap-4">
                             <div>
                                <p className="text-xs font-black uppercase text-slate-900 dark:text-white truncate">{member.displayName}</p>
                                <p className="text-[7px] font-black text-indigo-600 uppercase tracking-widest">
                                   {member.uid === familyMetadata?.creatorId ? t.profile.headOfHousehold : t.profile.member}
                                </p>
                             </div>
                          </div>
                          {isFamilyCreator && member.uid !== auth.currentUser?.uid && (
                             <button 
                                onClick={() => removeMember(member.uid)}
                                className="text-rose-500 hover:text-rose-400 transition-colors p-2"
                                title="Remove Member"
                             >
                                <TrashIcon className="w-4 h-4" />
                             </button>
                          )}
                       </div>
                    ))}
                 </div>
              </div>

              {isFamilyCreator && (
                <div className="space-y-4 max-w-lg">
                  <label className="text-[9px] tracking-[0.4em] font-black text-slate-800 dark:text-white/50 uppercase font-noto">{t.profile.renameHousehold}</label>
                  <div className="relative">
                    <input type="text" defaultValue={familyMetadata?.name} onBlur={(e) => updateFamilyName(e.target.value)} className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none focus:border-indigo-600 text-sm font-black uppercase tracking-widest placeholder:text-slate-400/10 text-slate-900 dark:text-white font-noto" placeholder="..." />
                    <div className="absolute right-0 bottom-3 text-[8px] font-black text-indigo-500/40 uppercase tracking-widest font-noto">{t.profile.creatorControls}</div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] tracking-[0.4em] font-black text-slate-800 dark:text-white/50 uppercase font-noto">{t.profile.uniqueSignature}</label>
                  {showCopied && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-in font-noto">{t.profile.sigCopied}</span>}
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 bg-slate-200 dark:bg-white/[0.03] border border-slate-300 dark:border-white/10 p-5 font-mono text-[10px] select-all truncate uppercase tracking-widest text-indigo-600 font-bold">
                    {familyId}
                  </div>
                  <button onClick={handleCopyId} className={`px-4 md:px-8 text-[10px] font-black uppercase tracking-widest transition-all font-noto ${showCopied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                    {showCopied ? t.profile.copied : t.profile.copyKey}
                  </button>
                </div>
              </div>

              <button onClick={leaveFamily} className="w-full py-5 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all font-noto">
                {t.profile.dissolve}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {!isNamingFamily ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button onClick={() => setIsNamingFamily(true)} className="w-full py-6 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-900 transition-all rounded-sm shadow-xl font-noto">
                    {t.profile.foundNew}
                  </button>
                  <div className="flex gap-1">
                    <input type="text" placeholder={t.profile.inviteKey} value={joinId} onChange={(e) => setJoinId(e.target.value)} className="flex-1 bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none focus:border-indigo-600 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white font-noto" />
                    <button onClick={joinFamily} className="px-8 text-[11px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-600/20 hover:bg-indigo-600 hover:text-white transition-all font-noto">
                      {t.profile.join}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-10 border border-indigo-600/30 bg-indigo-600/[0.02] animate-in space-y-8">
                  <h3 className="text-xl font-black tracking-tight uppercase text-slate-900 dark:text-white font-noto">{t.profile.establishName}</h3>
                  <div className="flex flex-col md:flex-row gap-4">
                    <input type="text" placeholder="..." autoFocus value={tempFamilyName} onChange={(e) => setTempFamilyName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createFamily()} className="flex-1 bg-transparent border-b border-indigo-600 py-4 outline-none text-base font-black uppercase tracking-[0.2em] placeholder:text-slate-400/20 text-slate-900 dark:text-white font-noto" />
                    <div className="flex gap-2">
                      <button onClick={createFamily} className="bg-indigo-600 text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg font-noto">FOUND</button>
                      <button onClick={() => setIsNamingFamily(false)} className="text-slate-600 dark:text-white/30 px-6 text-[10px] font-black uppercase tracking-widest font-noto">CANCEL</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 border-t border-slate-300 dark:border-white/5 pt-16">
          <div className="space-y-4">
            <label className="text-[9px] tracking-[0.5em] font-black text-slate-800 dark:text-white/50 uppercase font-noto">{t.profile.alias}</label>
            <input type="text" value={profile.displayName} onChange={(e) => onUpdate({ ...profile, displayName: e.target.value })} className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-4 outline-none focus:border-indigo-600 transition-all text-sm font-bold tracking-widest text-slate-900 dark:text-white font-noto" />
          </div>
          <div className="space-y-4">
            <label className="text-[9px] tracking-[0.5em] font-black text-slate-800 dark:text-white/50 uppercase font-noto">{t.profile.denomination}</label>
            <select value={profile.currency} onChange={(e) => onUpdate({ ...profile, currency: e.target.value })} className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-4 outline-none focus:border-indigo-600 transition-all text-sm font-bold uppercase tracking-[0.2em] cursor-pointer appearance-none text-slate-900 dark:text-white font-noto">
              {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.code} — {c.symbol}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-16 border-t border-slate-300 dark:border-white/5">
          <p className="text-[9px] tracking-[0.5em] font-black text-slate-800 dark:text-white/50 uppercase mb-8 font-noto">{t.profile.geographicJurisdiction}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-2">
              <label className="text-[8px] tracking-widest font-black text-slate-500 dark:text-white/30 uppercase font-noto">{t.profile.jurisdiction}</label>
              <input type="text" value={profile.country || ''} onChange={(e) => onUpdate({ ...profile, country: e.target.value })} className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none focus:border-indigo-600 text-xs font-bold uppercase text-slate-900 dark:text-white font-noto" placeholder={language === 'ta' ? 'நாடு' : 'Country'} />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] tracking-widest font-black text-slate-500 dark:text-white/30 uppercase font-noto">{t.profile.state}</label>
              <input type="text" value={profile.state || ''} onChange={(e) => onUpdate({ ...profile, state: e.target.value })} className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none focus:border-indigo-600 text-xs font-bold uppercase text-slate-900 dark:text-white font-noto" placeholder={language === 'ta' ? 'மாநிலம்' : 'State/Province'} />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] tracking-widest font-black text-slate-500 dark:text-white/30 uppercase font-noto">{t.profile.city}</label>
              <input type="text" value={profile.city || ''} onChange={(e) => onUpdate({ ...profile, city: e.target.value })} className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none focus:border-indigo-600 text-xs font-bold uppercase text-slate-900 dark:text-white font-noto" placeholder={language === 'ta' ? 'நகரம்' : 'City'} />
            </div>
          </div>
        </div>

        <div className="pt-20 border-t border-slate-300 dark:border-white/5 flex flex-col items-center gap-12">
          <div className="w-full max-w-sm flex flex-col items-center gap-6">
            <div className="flex items-center gap-6 text-[11px] font-black tracking-[0.2em] uppercase font-noto">
               <span className="text-indigo-400/80 pb-1 cursor-default">{t.profile.issueLabel}</span>
               <span className="opacity-10 text-slate-400">|</span>
               <span className="text-amber-400/80 pb-1 cursor-default">{t.profile.suggestUpdateLabel}</span>
            </div>
            
            <button 
              onClick={onOpenContact}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-indigo-600 dark:hover:bg-indigo-600 dark:hover:text-white transition-all font-noto shadow-lg"
            >
              {t.contactUs}
            </button>
          </div>

          <div className="w-full border-t border-slate-200 dark:border-white/5 pt-12 space-y-2 text-center">
             <p className="text-[8px] tracking-[0.3em] font-black text-slate-400 dark:text-white/30 uppercase font-noto">
                VERSION: 1.1.0 ALPHA
             </p>
             <p className="text-[8px] tracking-[0.3em] font-black text-slate-400 dark:text-white/30 uppercase font-noto">
                PROPRIETOR: D'CODES / DAVID CODES
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

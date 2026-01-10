
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { CURRENCIES } from '../constants';
import { StorageService } from '../services/storageService';
import { auth } from '../services/firebase';
import { translations } from '../translations';

interface ProfileProps {
  profile: UserProfile;
  onUpdate: (p: UserProfile) => void;
  onToggleTheme: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ profile, onUpdate, onToggleTheme }) => {
  const [joinId, setJoinId] = useState('');
  const [familyMetadata, setFamilyMetadata] = useState<{ name: string; creatorId: string } | null>(null);
  const [isNamingFamily, setIsNamingFamily] = useState(false);
  const [tempFamilyName, setTempFamilyName] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  
  const familyId = profile.familyId;
  const language = profile.language || 'en';
  const t = translations[language];

  useEffect(() => {
    if (familyId) {
      const unsub = StorageService.subscribeToFamilyMetadata(familyId, (data) => {
        setFamilyMetadata(data);
      });
      return unsub;
    } else {
      setFamilyMetadata(null);
    }
  }, [familyId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...profile, photoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    onUpdate({ ...profile, photoURL: undefined });
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

  const isFamilyCreator = familyMetadata?.creatorId === auth.currentUser?.uid;

  return (
    <div className="animate-in w-full space-y-16 pb-20">
      <div className="text-center">
        <h2 className="text-5xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">{t.identity}</h2>
        <p className="text-slate-400 dark:text-white/30 tracking-[0.5em] text-[10px] mt-3 uppercase">{t.guardianConfig}</p>
      </div>

      <div className="space-y-12">
        <div className="flex flex-col items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 border border-slate-200 dark:border-white/10 p-3 relative cursor-pointer overflow-hidden bg-slate-50 dark:bg-white/[0.02] shadow-2xl">
              {profile.photoURL ? (
                <img src={profile.photoURL} className="w-full h-full object-cover grayscale brightness-90 hover:brightness-100 transition-all" alt="Guardian Avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase text-slate-300 dark:text-white/10 tracking-[0.4em] text-center px-2 leading-relaxed font-noto">
                  {t.profile.securePortrait.split(' ').join('\n')}
                </div>
              )}
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                title="Update Avatar"
              />
              <div className="absolute inset-0 bg-indigo-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[10px] font-black text-white uppercase tracking-widest font-noto">{t.profile.sealNewImage}</span>
              </div>
            </div>
            {profile.photoURL && (
              <button 
                onClick={removePhoto}
                className="absolute -right-16 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors bg-white dark:bg-slate-950 p-2 border border-rose-500/20 shadow-xl"
              >
                {t.purge}
              </button>
            )}
          </div>
          <div className="text-center space-y-2">
             <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white font-noto">{profile.displayName}</p>
             <div className="inline-flex items-center gap-2 px-3 py-1 border border-indigo-500/20 bg-indigo-500/5">
                <div className={`w-1 h-1 rounded-full ${profile.isCloudGuardian ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'}`}></div>
                <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest font-noto">
                  {profile.isCloudGuardian ? t.profile.syncActive : t.profile.syncLocal}
                </p>
             </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <button 
            onClick={onToggleTheme}
            className="group relative px-12 py-5 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.5em] hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-950 transition-all rounded-sm overflow-hidden text-slate-900 dark:text-white"
          >
            <span className="relative z-10 font-noto">{profile.theme === 'dark' ? t.profile.transitionLight : t.profile.transitionDark}</span>
            <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></div>
          </button>
        </div>

        <div className="pt-16 border-t border-slate-200 dark:border-white/5 space-y-10">
          <div className="flex flex-col gap-2">
            <p className="text-[9px] tracking-[0.5em] font-black text-slate-400 dark:text-white/20 uppercase">{t.profile.householdSovereignty}</p>
            {familyMetadata ? (
              <p className="text-3xl font-black tracking-tighter text-indigo-600 uppercase transition-all font-noto">{familyMetadata.name}</p>
            ) : (
              <p className="text-lg font-light tracking-tight text-slate-300 dark:text-white/10 italic font-noto">{t.profile.noHousehold}</p>
            )}
          </div>
          
          {familyId ? (
            <div className="space-y-8 animate-in">
              {isFamilyCreator && (
                <div className="space-y-4 max-w-lg">
                  <label className="text-[9px] tracking-[0.4em] font-black text-slate-400 dark:text-white/20 uppercase">{t.profile.renameHousehold}</label>
                  <div className="relative">
                    <input 
                      type="text"
                      defaultValue={familyMetadata?.name}
                      onBlur={(e) => updateFamilyName(e.target.value)}
                      className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-3 outline-none focus:border-indigo-600 text-sm font-black uppercase tracking-widest placeholder:text-slate-400/10 text-slate-900 dark:text-white font-noto"
                      placeholder="..."
                    />
                    <div className="absolute right-0 bottom-3 text-[8px] font-black text-indigo-500/40 uppercase tracking-widest">{t.profile.creatorControls}</div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] tracking-[0.4em] font-black text-slate-400 dark:text-white/20 uppercase">{t.profile.uniqueSignature}</label>
                  {showCopied && (
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-in font-noto">{t.profile.sigCopied}</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-5 font-mono text-xs select-all truncate uppercase tracking-widest text-indigo-500 font-bold">
                    {familyId}
                  </div>
                  <button 
                    onClick={handleCopyId}
                    className={`px-8 text-[10px] font-black uppercase tracking-widest transition-all font-noto ${showCopied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  >
                    {showCopied ? t.profile.copied : t.profile.copyKey}
                  </button>
                </div>
              </div>

              <button 
                onClick={leaveFamily}
                className="w-full py-5 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm font-noto"
              >
                {t.profile.dissolve}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {!isNamingFamily ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button 
                    onClick={() => setIsNamingFamily(true)}
                    className="w-full py-6 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-950 transition-all rounded-sm shadow-xl font-noto"
                  >
                    {t.profile.foundNew}
                  </button>
                  <div className="flex gap-1 group">
                    <input 
                      type="text"
                      placeholder={t.profile.inviteKey}
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value)}
                      className="flex-1 bg-transparent border-b border-slate-200 dark:border-white/10 py-3 outline-none focus:border-indigo-600 text-xs font-bold uppercase tracking-widest transition-all text-slate-900 dark:text-white font-noto"
                    />
                    <button 
                      onClick={joinFamily}
                      className="px-8 text-[11px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-600/20 hover:bg-indigo-600 hover:text-white transition-all rounded-sm font-noto"
                    >
                      {t.profile.join}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-10 border border-indigo-600/30 bg-indigo-600/[0.02] animate-in space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight uppercase text-slate-900 dark:text-white font-noto">{t.profile.establishName}</h3>
                    <p className="text-[9px] tracking-widest text-slate-400 dark:text-white/20 uppercase font-noto">{t.profile.titleShared}</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <input 
                      type="text"
                      placeholder="..."
                      autoFocus
                      value={tempFamilyName}
                      onChange={(e) => setTempFamilyName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && createFamily()}
                      className="flex-1 bg-transparent border-b border-indigo-600 py-4 outline-none text-base font-black uppercase tracking-[0.2em] placeholder:text-slate-400/20 text-slate-900 dark:text-white font-noto"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={createFamily}
                        className="bg-indigo-600 text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg font-noto"
                      >
                        {t.profile.foundHousehold}
                      </button>
                      <button 
                        onClick={() => setIsNamingFamily(false)}
                        className="text-slate-400 dark:text-white/30 px-6 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors font-noto"
                      >
                        {t.profile.cancel}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 border-t border-slate-200 dark:border-white/5 pt-16">
          <div className="space-y-4">
            <label className="text-[9px] tracking-[0.5em] font-black text-slate-400 dark:text-white/20 uppercase">{t.profile.alias}</label>
            <input 
              type="text"
              value={profile.displayName}
              onChange={(e) => onUpdate({ ...profile, displayName: e.target.value })}
              className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-4 outline-none focus:border-indigo-600 transition-all text-sm font-bold tracking-widest text-slate-900 dark:text-white font-noto"
              placeholder="..."
            />
          </div>
          <div className="space-y-4">
            <label className="text-[9px] tracking-[0.5em] font-black text-slate-400 dark:text-white/20 uppercase">{t.profile.denomination}</label>
            <select 
              value={profile.currency}
              onChange={(e) => onUpdate({ ...profile, currency: e.target.value })}
              className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-4 outline-none focus:border-indigo-600 transition-all text-sm font-bold uppercase tracking-[0.2em] cursor-pointer appearance-none text-slate-900 dark:text-white"
            >
              {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.code} — {c.symbol}</option>)}
            </select>
          </div>
          
          <div className="space-y-4">
            <label className="text-[9px] tracking-[0.5em] font-black text-slate-400 dark:text-white/20 uppercase">{t.profile.jurisdiction}</label>
            <input 
              type="text"
              value={profile.country || ''}
              onChange={(e) => onUpdate({ ...profile, country: e.target.value })}
              className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-4 outline-none focus:border-indigo-600 transition-all text-sm font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white font-noto"
              placeholder="..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-4">
                <label className="text-[9px] tracking-[0.5em] font-black text-slate-400 dark:text-white/20 uppercase">{t.profile.state}</label>
                <input 
                  type="text"
                  value={profile.state || ''}
                  onChange={(e) => onUpdate({ ...profile, state: e.target.value })}
                  className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-4 outline-none focus:border-indigo-600 transition-all text-sm font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white font-noto"
                  placeholder="..."
                />
             </div>
             <div className="space-y-4">
                <label className="text-[9px] tracking-[0.5em] font-black text-slate-400 dark:text-white/20 uppercase">{t.profile.city}</label>
                <input 
                  type="text"
                  value={profile.city || ''}
                  onChange={(e) => onUpdate({ ...profile, city: e.target.value })}
                  className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-4 outline-none focus:border-indigo-600 transition-all text-sm font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white font-noto"
                  placeholder="..."
                />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

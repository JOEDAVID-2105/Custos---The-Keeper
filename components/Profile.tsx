
import React, { useState, useEffect } from 'react';
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
  onNavigateToAbout: () => void;
  deferredPrompt?: any;
}

export const Profile: React.FC<ProfileProps> = ({ 
  profile, 
  onUpdate, 
  onToggleLanguage, 
  onGoCloud,
  onNavigateToEditLimits,
  onNavigateToAbout,
}) => {
  const [joinId, setJoinId] = useState('');
  const [familyMetadata, setFamilyMetadata] = useState<{ name: string; creatorId: string } | null>(null);
  const [familyMembers, setFamilyMembers] = useState<UserProfile[]>([]);
  const [isNamingFamily, setIsNamingFamily] = useState(false);
  const [tempFamilyName, setTempFamilyName] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const [showVisionModal, setShowVisionModal] = useState(false);
  
  const familyId = profile.familyId;
  const language = profile.language || 'en';
  const t = translations[language];

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

  const isFamilyCreator = familyMetadata?.creatorId === auth.currentUser?.uid;

  return (
    <div className="animate-in w-full space-y-16 pb-20">
      <div className="text-center">
        <h2 className="text-5xl font-black tracking-tighter uppercase text-slate-900 dark:text-white font-noto">{t.identity}</h2>
        <p className="text-slate-800 dark:text-white/30 tracking-[0.5em] text-[10px] mt-3 uppercase font-noto">{t.guardianConfig}</p>
      </div>

      <div className="space-y-12">
        <div className="flex flex-col items-center gap-8">
          {!auth.currentUser && (
            <button 
              onClick={onGoCloud}
              className="w-full max-w-sm py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-900 transition-all rounded-sm shadow-xl font-noto"
            >
              {t.profile.goCloud}
            </button>
          )}

          <div className="relative group">
            <button 
              onClick={() => setShowVisionModal(true)}
              className="w-32 h-32 border border-slate-400 dark:border-white/10 p-3 relative cursor-pointer bg-slate-50 dark:bg-white/[0.02] shadow-2xl transition-transform hover:scale-105 flex items-center justify-center"
            >
              <InitialShield name={profile.displayName} size="lg" />
            </button>
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

        {/* Secure Vision Modal (Large InitialShield View) */}
        {showVisionModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in">
            <div className="w-full max-w-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 p-10 space-y-10 shadow-3xl">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-6">
                <h3 className="text-xl font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Secure Vision</h3>
                <button onClick={() => setShowVisionModal(false)} className="text-rose-600 hover:text-rose-400 transition-colors text-[10px] font-black uppercase tracking-widest">CLOSE</button>
              </div>

              <div className="aspect-square w-full max-w-[320px] mx-auto border border-slate-200 dark:border-white/5 p-4 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center">
                <InitialShield name={profile.displayName} size="xl" />
              </div>

              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-white/20">Identity Protected by Sovereign Core</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-16 border-t border-slate-300 dark:border-white/5 space-y-10">
          <div className="flex flex-col gap-2">
            <p className="text-[9px] tracking-[0.5em] font-black text-slate-800 dark:text-white/20 uppercase font-noto">{t.profile.householdSovereignty}</p>
            {familyMetadata ? (
              <p className="text-3xl font-black tracking-tighter text-indigo-600 uppercase transition-all font-noto">{familyMetadata.name}</p>
            ) : (
              <p className="text-lg font-light tracking-tight text-slate-600 dark:text-white/10 italic font-noto">{t.profile.noHousehold}</p>
            )}
          </div>
          
          {familyId ? (
            <div className="space-y-12 animate-in">
              <div className="space-y-6">
                 <h3 className="text-[9px] tracking-[0.5em] font-black text-slate-800 dark:text-white/20 uppercase font-noto">Household Guardians</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {familyMembers.map(member => (
                       <div key={member.uid} className="flex items-center justify-between p-4 border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 border border-slate-300 dark:border-white/10 p-1 flex items-center justify-center">
                                <InitialShield name={member.displayName} size="sm" />
                             </div>
                             <div>
                                <p className="text-xs font-black uppercase text-slate-900 dark:text-white truncate">{member.displayName}</p>
                                <p className="text-[7px] font-black text-indigo-600 uppercase tracking-widest">
                                   {member.uid === familyMetadata?.creatorId ? 'Head of Household' : 'Guardian'}
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
                  <label className="text-[9px] tracking-[0.4em] font-black text-slate-800 dark:text-white/20 uppercase font-noto">{t.profile.renameHousehold}</label>
                  <div className="relative">
                    <input type="text" defaultValue={familyMetadata?.name} onBlur={(e) => updateFamilyName(e.target.value)} className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none focus:border-indigo-600 text-sm font-black uppercase tracking-widest placeholder:text-slate-400/10 text-slate-900 dark:text-white font-noto" placeholder="..." />
                    <div className="absolute right-0 bottom-3 text-[8px] font-black text-indigo-500/40 uppercase tracking-widest font-noto">{t.profile.creatorControls}</div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] tracking-[0.4em] font-black text-slate-800 dark:text-white/20 uppercase font-noto">{t.profile.uniqueSignature}</label>
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
                  <button onClick={() => setIsNamingFamily(true)} className="w-full py-6 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-900 transition-all rounded-sm font-noto shadow-xl">
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
            <label className="text-[9px] tracking-[0.5em] font-black text-slate-800 dark:text-white/20 uppercase font-noto">{t.profile.alias}</label>
            <input type="text" value={profile.displayName} onChange={(e) => onUpdate({ ...profile, displayName: e.target.value })} className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-4 outline-none focus:border-indigo-600 transition-all text-sm font-bold tracking-widest text-slate-900 dark:text-white font-noto" />
          </div>
          <div className="space-y-4">
            <label className="text-[9px] tracking-[0.5em] font-black text-slate-800 dark:text-white/20 uppercase font-noto">{t.profile.denomination}</label>
            <select value={profile.currency} onChange={(e) => onUpdate({ ...profile, currency: e.target.value })} className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-4 outline-none focus:border-indigo-600 transition-all text-sm font-bold uppercase tracking-[0.2em] cursor-pointer appearance-none text-slate-900 dark:text-white font-noto">
              {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.code} — {c.symbol}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-20 border-t border-slate-300 dark:border-white/5 flex flex-col items-center gap-6">
          <button 
            onClick={onNavigateToEditLimits}
            className="w-full max-w-sm py-5 border border-indigo-600/30 bg-indigo-600/[0.02] text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-indigo-600 hover:text-white transition-all font-noto shadow-lg"
          >
            {t.classAmountEdit}
          </button>
          
          <button 
            onClick={onNavigateToAbout}
            className="w-full max-w-sm py-5 border border-slate-400 dark:border-white/10 text-slate-700 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-950 transition-all font-noto shadow-lg"
          >
            {t.aboutApp}
          </button>
        </div>
      </div>
    </div>
  );
};

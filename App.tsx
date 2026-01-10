
import React, { useState, useEffect, useMemo } from 'react';
import { Vault } from './components/Vault';
import { Records } from './components/Records';
import { AIAdvisor } from './components/AIAdvisor';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { BudgetTracker } from './components/BudgetTracker';
import { ShieldIcon, CURRENCIES } from './constants';
import { translations } from './translations';
import { Transaction, UserProfile } from './types';
import { StorageService } from './services/storageService';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vault' | 'history' | 'ai' | 'profile' | 'auth'>('vault');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showSplash, setShowSplash] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile>({
    uid: 'local-user',
    displayName: 'The Local Guardian',
    email: '',
    currency: 'USD',
    country: 'United States',
    isCloudGuardian: false,
    theme: 'dark',
    language: 'en'
  });
  const [loading, setLoading] = useState(true);

  const t = translations[profile.language || 'en'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4500);

    const handleBeforeInstall = (e: Event) => {
      console.log('[PWA] Ready for installation');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      console.log('[PWA] Successfully installed');
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const isDark = profile.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

  useEffect(() => {
    const localTx = StorageService.getLocalTransactions();
    setTransactions(localTx);
    
    let unsubscribeTxs: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (unsubscribeTxs) unsubscribeTxs();

      if (user) {
        const cloudProfile = await StorageService.getProfile(user.uid);
        if (cloudProfile) {
          setProfile({ ...cloudProfile, language: cloudProfile.language || 'en' });
          unsubscribeTxs = StorageService.subscribeToTransactions(user.uid, cloudProfile.familyId, (txs) => {
            setTransactions(txs);
          });
        } else {
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'The Guardian',
            email: user.email || '',
            currency: 'USD',
            country: 'United States',
            state: '',
            city: '',
            isCloudGuardian: true,
            theme: 'dark',
            language: 'en'
          };
          setProfile(newProfile);
          await StorageService.saveProfile(newProfile);
          unsubscribeTxs = StorageService.subscribeToTransactions(user.uid, null, (txs) => {
            setTransactions(txs);
          });
        }
        setLoading(false);
      } else {
        const localPrefs = StorageService.getUserPrefs();
        setProfile(localPrefs || {
          uid: 'local-user',
          displayName: 'The Local Guardian',
          email: '',
          currency: 'USD',
          country: 'United States',
          isCloudGuardian: false,
          theme: 'dark',
          language: 'en'
        });
        setTransactions(StorageService.getLocalTransactions());
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeTxs) unsubscribeTxs();
    };
  }, []);

  const addTransaction = async (tx: Transaction) => {
    const enrichedT = { ...tx, familyId: profile.familyId, userId: profile.uid };
    setTransactions(prev => [...prev, enrichedT]);
    if (auth.currentUser) await StorageService.syncTransaction(enrichedT);
    else StorageService.saveLocalTransaction(enrichedT);
  };

  const updateTransaction = async (tx: Transaction) => {
    setTransactions(prev => prev.map(item => item.id === tx.id ? tx : item));
    if (auth.currentUser) await StorageService.updateTransaction(tx);
    else StorageService.updateLocalTransaction(tx);
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    if (auth.currentUser) await StorageService.removeTransaction(id);
    else StorageService.deleteLocalTransaction(id);
  };

  const updateProfile = async (p: UserProfile) => {
    setProfile(p);
    StorageService.saveUserPrefs(p);
    if (auth.currentUser) await StorageService.saveProfile(p);
  };

  const toggleLanguage = () => {
    const newLang = profile.language === 'en' ? 'ta' : 'en';
    updateProfile({ ...profile, language: newLang });
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install outcome: ${outcome}`);
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const currencySymbol = useMemo(() => {
    return CURRENCIES.find(c => c.code === profile.currency)?.symbol || '$';
  }, [profile.currency]);

  const renderContent = () => {
    if (activeTab === 'auth') return <Auth language={profile.language} onSuccess={() => setActiveTab('profile')} />;
    
    switch (activeTab) {
      case 'vault': return <Vault onAdd={addTransaction} currencySymbol={currencySymbol} transactions={transactions} language={profile.language} />;
      case 'history': return (
        <div className="space-y-12 max-w-4xl mx-auto">
          <Records 
            transactions={transactions} 
            onDelete={deleteTransaction} 
            onUpdate={updateTransaction}
            currencySymbol={currencySymbol} 
            currentUserId={profile.uid}
            language={profile.language}
          />
          <BudgetTracker transactions={transactions} currencySymbol={currencySymbol} />
        </div>
      );
      case 'ai': return <div className="max-w-3xl mx-auto"><AIAdvisor transactions={transactions} currency={profile.currency} language={profile.language} /></div>;
      case 'profile': return (
        <div className="space-y-12 max-w-3xl mx-auto">
          <Profile 
            profile={profile} 
            onUpdate={updateProfile} 
            onToggleTheme={() => updateProfile({...profile, theme: profile.theme === 'dark' ? 'light' : 'dark'})} 
            onToggleLanguage={toggleLanguage}
            onGoCloud={() => setActiveTab('auth')}
            deferredPrompt={deferredPrompt}
            onInstall={handleInstall}
          />
          {auth.currentUser && (
            <div className="pt-12 border-t border-slate-200 dark:border-white/5 flex justify-center">
              <button 
                onClick={() => signOut(auth)}
                className="text-[10px] tracking-[0.3em] font-black uppercase text-rose-500 hover:text-rose-400 transition-colors font-noto"
              >
                {t.terminateSession}
              </button>
            </div>
          )}
        </div>
      );
    }
  };

  const navItems = [
    { id: 'vault', label: t.vault },
    { id: 'history', label: t.ledger },
    { id: 'ai', label: t.advisor },
    { id: 'profile', label: t.prefs },
  ];

  const displayedUserName = useMemo(() => {
    if (profile.uid === 'local-user') return t.common.localGuardian;
    return profile.displayName;
  }, [profile.uid, profile.displayName, t]);

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-[100] animate-out fade-out fill-mode-forwards duration-1000 delay-[4000ms]">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
             <img 
               src="https://img.icons8.com/fluency/240/royal-crown.png" 
               className="w-44 h-44 animate-in zoom-in-50 duration-1000 delay-200 drop-shadow-[0_0_50px_rgba(79,70,229,0.4)]"
               alt="Custos Shield"
             />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-6xl font-black tracking-[-0.15em] text-white animate-in slide-in-from-bottom-10 duration-1000 delay-500">CUSTOS</h1>
            <p className="text-[11px] tracking-[0.9em] text-indigo-400 font-bold uppercase animate-in fade-in duration-1000 delay-900">{t.theKeeper}</p>
          </div>
        </div>
        <div className="absolute top-1/2 mt-56 flex flex-col items-center gap-3">
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 w-full animate-progress-fast"></div>
            </div>
            <p className="text-[7px] tracking-[0.5em] text-white/10 uppercase font-black">Establishing Sovereignty</p>
        </div>
        <div className="absolute bottom-12 flex flex-col items-center gap-1 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 text-center">
          <span className="text-[9px] tracking-[0.8em] text-white/30 uppercase font-black">DAVID'S CODES</span>
          <div className="w-12 h-px bg-indigo-600/30 my-2"></div>
          <span className="text-[7px] tracking-[0.4em] text-indigo-500/40 uppercase font-bold">V3.0 PRIME ENGINE</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col md:flex-row bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white selection:bg-indigo-500/30">
      <div className="shield-watermark text-indigo-600/5 dark:text-indigo-500/10 no-print">
        <ShieldIcon className="w-full h-full" />
      </div>

      <aside className="hidden md:flex w-64 h-screen flex-col border-r border-slate-200 dark:border-white/5 p-10 sticky top-0 bg-white/50 dark:bg-[#020617]/50 backdrop-blur-xl z-20 no-print">
        <div className="mb-16">
          <h1 className="text-3xl font-black tracking-tighter">CUSTOS</h1>
          <p className="text-[9px] tracking-[0.4em] font-bold text-indigo-600 mt-1 uppercase font-noto">{t.theKeeper}</p>
        </div>

        <nav className="flex-1 space-y-8">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`block w-full text-left text-[10px] tracking-[0.3em] font-black uppercase transition-all font-noto ${activeTab === item.id ? 'text-indigo-600 translate-x-1' : 'text-slate-400 dark:text-white/20 hover:text-indigo-600'}`}
            >
              {item.label}
            </button>
          ))}
          {!auth.currentUser && (
            <button
              onClick={() => setActiveTab('auth')}
              className={`block w-full text-left text-[10px] tracking-[0.3em] font-black uppercase transition-all pt-8 mt-8 border-t border-slate-200 dark:border-white/5 font-noto ${activeTab === 'auth' ? 'text-indigo-600' : 'text-slate-400 dark:text-white/20 hover:text-indigo-600'}`}
            >
              {t.authAction}
            </button>
          )}
        </nav>

        <div className="pt-10 space-y-6">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1 border border-indigo-600/20 text-[10px] font-black tracking-widest hover:bg-indigo-600 hover:text-white transition-all font-noto"
          >
            <span className={profile.language === 'en' ? 'text-indigo-600' : ''}>EN</span>
            <span className="opacity-20">/</span>
            <span className={profile.language === 'ta' ? 'text-indigo-600' : ''}>தமிழ்</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-slate-200 dark:border-white/10 p-1 flex-shrink-0">
              {profile.photoURL ? (
                <img src={profile.photoURL} className="w-full h-full object-cover grayscale" alt="Profile" />
              ) : (
                <div className="w-full h-full bg-indigo-600/10 flex items-center justify-center font-black text-indigo-600 text-[10px]">
                  {profile.displayName.charAt(0)}
                </div>
              )}
            </div>
            <div className="truncate">
              <p className="text-[9px] font-black tracking-widest uppercase truncate font-noto">{displayedUserName}</p>
            </div>
          </div>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-14 glass z-50 flex items-center justify-around rounded-none border border-slate-200 dark:border-white/10 no-print">
         {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`text-[8px] tracking-[0.2em] font-black uppercase transition-all font-noto ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 dark:text-white/30'}`}
            >
              {item.label}
            </button>
          ))}
      </nav>

      <main className="flex-1 p-6 md:p-12 pb-24 md:pb-12 relative z-10 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;

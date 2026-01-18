
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Vault } from './components/Vault';
import { Records } from './components/Records';
import { AIAdvisor } from './components/AIAdvisor';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { BudgetEdit } from './components/BudgetEdit';
import { ClassWiseOutflow } from './components/ClassWiseOutflow';
import { FiltersPage } from './components/FiltersPage';
import { ContactPopup } from './components/ContactPopup';
import { ConfirmationModal } from './components/ConfirmationModal';
import { UpdatePrompt } from './components/UpdatePrompt';
import { ShieldIcon, CURRENCIES, DEFAULT_CATEGORIES } from './constants';
import { translations } from './translations';
import { Transaction, UserProfile } from './types';
import { StorageService } from './services/storageService';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";

type AppTab = 'vault' | 'history' | 'ai' | 'profile' | 'auth' | 'outflow' | 'budget-edit' | 'filters';

interface SnackbarState {
  isVisible: boolean;
  message: string;
  onUndo: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  uid: 'local-user',
  displayName: 'The Local User',
  email: '',
  currency: 'INR',
  country: '',
  state: '',
  city: '',
  isCloudGuardian: false,
  theme: 'dark',
  language: 'en',
  budgetLimits: {},
  customCategories: []
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    const saved = localStorage.getItem('custos_active_tab');
    return (saved as AppTab) || 'vault';
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [familyMembers, setFamilyMembers] = useState<UserProfile[]>([]);
  const [showSplash, setShowSplash] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [authResolved, setAuthResolved] = useState(false);
  
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    isVisible: false,
    message: '',
    onUndo: () => {}
  });
  
  const snackbarTimeoutRef = useRef<any>(null);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: string }>({ 
    isOpen: false, 
    category: '' 
  });

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const t = translations[profile.language || 'en'];

  const allCategories = useMemo(() => {
    return [...new Set([...DEFAULT_CATEGORIES, 'Other', ...(profile.customCategories || [])])];
  }, [profile.customCategories]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size', `${fontSize}px`);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('custos_active_tab', activeTab);
    window.history.replaceState({ tab: activeTab }, '');
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (tab: AppTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    window.history.pushState({ tab }, '');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleUpdateAvailable = () => {
      setShowUpdatePrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('custos-update-available', handleUpdateAvailable);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('custos-update-available', handleUpdateAvailable);
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

  const detectLocationInfo = async (): Promise<{country: string, state: string, city: string}> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ country: '', state: '', city: '' });
        return;
      }

      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`);
          const data = await res.json();
          const addr = data.address || {};
          resolve({
            country: addr.country || '',
            state: addr.state || addr.region || '',
            city: addr.city || addr.town || addr.village || addr.suburb || ''
          });
        } catch (e) {
          resolve({ country: '', state: '', city: '' });
        }
      }, () => resolve({ country: '', state: '', city: '' }));
    });
  };

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).then(() => {
      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          await StorageService.syncLocalToCloud(user.uid, user.displayName || 'User');
          let cloudProfile = await StorageService.getProfile(user.uid);
          
          if (!cloudProfile) {
            const loc = await detectLocationInfo();
            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || 'The User',
              email: user.email || '',
              currency: 'INR',
              country: loc.country,
              state: loc.state,
              city: loc.city,
              isCloudGuardian: true,
              theme: 'dark',
              language: 'en',
              budgetLimits: {},
              customCategories: []
            };
            await StorageService.saveProfile(newProfile);
            setProfile(newProfile);
          } else {
            setProfile({ ...cloudProfile, language: cloudProfile.language || 'en' });
          }
        } else {
          const localPrefs = StorageService.getUserPrefs();
          setProfile(localPrefs || DEFAULT_PROFILE);
          setTransactions(StorageService.getLocalTransactions());
        }
        setAuthResolved(true);
      });
      return () => unsubscribeAuth();
    });
  }, []);

  useEffect(() => {
    if (!authResolved) return;
    let unsubscribeTxs: (() => void) | undefined;
    let unsubscribeMembers: (() => void) | undefined;

    if (auth.currentUser) {
      unsubscribeTxs = StorageService.subscribeToTransactions(profile.uid, profile.familyId, setTransactions);
      if (profile.familyId) {
        unsubscribeMembers = StorageService.subscribeToFamilyMembers(profile.familyId, setFamilyMembers);
      } else {
        setFamilyMembers([]);
      }
    } else {
      setTransactions(StorageService.getLocalTransactions());
      setFamilyMembers([]);
    }

    return () => {
      if (unsubscribeTxs) unsubscribeTxs();
      if (unsubscribeMembers) unsubscribeMembers();
    };
  }, [authResolved, profile.uid, profile.familyId]);

  const triggerSnackbar = (message: string, onUndo: () => void) => {
    if (snackbarTimeoutRef.current) clearTimeout(snackbarTimeoutRef.current);
    setSnackbar({ isVisible: true, message, onUndo });
    snackbarTimeoutRef.current = setTimeout(() => {
      setSnackbar(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  const updateProfile = async (p: UserProfile) => {
    setProfile(p);
    StorageService.saveUserPrefs(p);
    if (auth.currentUser) await StorageService.saveProfile(p);
  };

  const addTransaction = async (tx: Transaction) => {
    setTransactions(prev => [...prev, tx]);
    if (auth.currentUser) {
       try {
         await StorageService.syncTransaction(tx);
       } catch (err) {
         console.error("Cloud sync heartbeat failure:", err);
       }
    } else {
       StorageService.saveLocalTransaction(tx);
    }
  };

  const updateTransaction = async (tx: Transaction) => {
    setTransactions(prev => prev.map(item => item.id === tx.id ? tx : item));
    if (auth.currentUser) await StorageService.updateTransaction(tx);
    else StorageService.updateLocalTransaction(tx);
  };

  const deleteTransaction = async (id: string) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return;
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    if (auth.currentUser) await StorageService.removeTransaction(id);
    else StorageService.deleteLocalTransaction(id);
    triggerSnackbar(t.itemDeleted, () => addTransaction(txToDelete));
  };

  const confirmDeleteCategory = async () => {
    const catName = deleteModal.category;
    const oldCustom = [...(profile.customCategories || [])];
    const oldLimits = { ...(profile.budgetLimits || {}) };
    const newCustom = oldCustom.filter(c => c !== catName);
    const newLimits = { ...oldLimits };
    delete newLimits[catName];
    await updateProfile({ ...profile, customCategories: newCustom, budgetLimits: newLimits });
    setDeleteModal({ isOpen: false, category: '' });
    triggerSnackbar(t.categoryDeleted, () => updateProfile({ ...profile, customCategories: oldCustom, budgetLimits: oldLimits }));
  };

  const renameCategory = async (oldName: string, newName: string) => {
    if (DEFAULT_CATEGORIES.includes(oldName)) return;
    const trimmedNew = newName.trim();
    if (!trimmedNew || oldName === trimmedNew) return;
    const newCustom = (profile.customCategories || []).map(c => c === oldName ? trimmedNew : c);
    const newLimits = { ...(profile.budgetLimits || {}) };
    if (newLimits[oldName] !== undefined) {
      newLimits[trimmedNew] = newLimits[oldName];
      delete newLimits[oldName];
    }
    await updateProfile({ ...profile, customCategories: newCustom, budgetLimits: newLimits });
    const affected = transactions.filter(tx => tx.category === oldName);
    for (const tx of affected) {
      await updateTransaction({ ...tx, category: trimmedNew });
    }
  };

  const toggleLanguage = () => {
    const newLang = profile.language === 'en' ? 'ta' : 'en';
    updateProfile({ ...profile, language: newLang });
  };

  const toggleTheme = () => {
    const newTheme = profile.theme === 'dark' ? 'light' : 'dark';
    updateProfile({ ...profile, theme: newTheme });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfile(DEFAULT_PROFILE);
      setTransactions(StorageService.getLocalTransactions());
      setFamilyMembers([]);
      setActiveTab('vault');
      localStorage.setItem('custos_active_tab', 'vault');
    } catch (error) {
      console.error("Sovereign session termination failed:", error);
    }
  };

  const handleApplyUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage('skipWaiting');
        }
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  const currencySymbol = useMemo(() => {
    return CURRENCIES.find(c => c.code === profile.currency)?.symbol || '₹';
  }, [profile.currency]);

  const renderContent = () => {
    if (!authResolved) return null;
    if (activeTab === 'auth') return <Auth language={profile.language} onSuccess={() => navigateTo('profile')} />;
    
    switch (activeTab) {
      case 'vault': return (
        <Vault 
          onAdd={addTransaction} 
          currencySymbol={currencySymbol} 
          transactions={transactions} 
          language={profile.language} 
          categories={allCategories}
          onNavigateToEditLimits={() => navigateTo('budget-edit')}
          familyId={profile.familyId}
          familyMembers={familyMembers}
          userAlias={profile.displayName}
        />
      );
      case 'history': return (
        <Records 
          transactions={transactions} 
          onDelete={deleteTransaction} 
          onUpdate={updateTransaction}
          onNavigateToOutflow={() => navigateTo('outflow')}
          onNavigateToFilters={() => navigateTo('filters')}
          search={search}
          typeFilter={typeFilter}
          startDate={startDate}
          endDate={endDate}
          sortBy={sortBy}
          sortOrder={sortOrder}
          currencySymbol={currencySymbol} 
          currentUserId={profile.uid}
          language={profile.language}
          categories={allCategories}
          familyId={profile.familyId}
          familyMembers={familyMembers}
        />
      );
      case 'filters': return (
        <FiltersPage 
          search={search} setSearch={setSearch}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
          sortBy={sortBy} setSortBy={setSortBy}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          onBack={() => navigateTo('history')}
          onClear={() => { setSearch(''); setTypeFilter('all'); setStartDate(''); setEndDate(''); setSortBy('date'); setSortOrder('desc'); }}
          language={profile.language}
        />
      );
      case 'outflow': return (
        <ClassWiseOutflow 
          transactions={transactions} 
          profile={profile} 
          onBack={() => navigateTo('history')} 
          language={profile.language} 
          categories={allCategories}
        />
      );
      case 'budget-edit': return (
        <BudgetEdit 
          profile={profile} 
          onUpdate={updateProfile} 
          onDeleteCategory={(cat) => setDeleteModal({ isOpen: true, category: cat })}
          onRenameCategory={renameCategory}
          onBack={() => navigateTo('vault')} 
          language={profile.language} 
        />
      );
      case 'ai': return <div className="max-w-3xl mx-auto"><AIAdvisor transactions={transactions} currency={profile.currency} language={profile.language} /></div>;
      case 'profile': return (
        <div className="space-y-12 max-w-3xl mx-auto">
          <Profile 
            profile={profile} 
            onUpdate={updateProfile} 
            onToggleLanguage={toggleLanguage}
            onGoCloud={() => navigateTo('auth')}
            onNavigateToEditLimits={() => navigateTo('budget-edit')}
            onNavigateToPortraitSelection={() => {}} 
            onOpenContact={() => setShowContactPopup(true)}
            deferredPrompt={deferredPrompt}
            fontSize={fontSize}
            setFontSize={setFontSize}
            familyMembers={familyMembers}
          />
          {auth.currentUser && (
            <div className="pt-12 border-t border-slate-300 dark:border-white/5 flex justify-center">
              <button 
                onClick={handleLogout}
                className="text-[10px] tracking-[0.3em] font-black uppercase text-rose-600 hover:text-rose-400 transition-colors font-noto"
              >
                {t.terminateSession}
              </button>
            </div>
          )}
        </div>
      );
      default: return null;
    }
  };

  const navItems = [
    { id: 'vault', label: t.vault },
    { id: 'history', label: t.ledger },
    { id: 'ai', label: t.advisor },
    { id: 'profile', label: t.prefs },
  ];

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-[100] animate-out fade-out fill-mode-forwards duration-1000 delay-[3000ms]">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-8xl font-black tracking-[-0.15em] text-white animate-in slide-in-from-bottom-10 duration-1000 delay-500 uppercase">Custos</h1>
          <p className="text-[11px] tracking-[0.9em] text-indigo-400 font-bold uppercase animate-in fade-in duration-1000 delay-900">{t.theKeeper}</p>
        </div>
        <div className="absolute bottom-20 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2">
               <p className="text-[7px] tracking-[0.4em] text-white/20 uppercase font-black">a product by</p>
               <p className="text-[10px] tracking-[0.6em] text-white/60 uppercase font-black">D'codes</p>
            </div>
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 w-full animate-progress-fast"></div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col md:flex-row bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="shield-watermark text-indigo-600/5 dark:text-indigo-500/10 no-print">
        <ShieldIcon className="w-full h-full" />
      </div>
      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        title="Dissolve Category"
        message={`Are you sure you want to dissolve '${deleteModal.category}'? Transactions mapped to this category will persist but the category itself will be removed from your palette.`}
        confirmLabel="DISSOLVE"
        cancelLabel="PRESERVE"
        onConfirm={confirmDeleteCategory}
        onCancel={() => setDeleteModal({ isOpen: false, category: '' })}
        language={profile.language}
      />
      {showContactPopup && <ContactPopup onClose={() => setShowContactPopup(false)} language={profile.language} />}
      {showUpdatePrompt && <UpdatePrompt onUpdate={handleApplyUpdate} onLater={() => setShowUpdatePrompt(false)} language={profile.language} />}
      
      <div className="fixed top-6 right-6 z-[100] flex items-center gap-4 no-print">
        <button onClick={toggleLanguage} className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 overflow-hidden">
          <span className={`text-[16px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 font-noto flex items-center justify-center w-full h-full transition-transform duration-300 ${profile.language === 'en' ? 'translate-x-[0px] -translate-y-[2.5px]' : ''}`}>
            {profile.language === 'en' ? 'த' : 'EN'}
          </span>
        </button>
        <button onClick={toggleTheme} className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 group overflow-hidden">
          <div className={`relative w-full h-full flex items-center justify-center transition-transform duration-700 ${profile.theme === 'dark' ? 'rotate-0' : 'rotate-[360deg]'}`}>
            {profile.theme === 'dark' ? (
              <svg className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" transform="rotate(0, 12, 12)" /><line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" transform="rotate(45, 12, 12)" /><line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" transform="rotate(90, 12, 12)" /><line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" transform="rotate(135, 12, 12)" /><line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" transform="rotate(180, 12, 12)" /><line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" transform="rotate(225, 12, 12)" /><line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" transform="rotate(270, 12, 12)" /><line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" transform="rotate(315, 12, 12)" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-indigo-600 fill-indigo-600" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </div>
        </button>
      </div>
      <aside className="hidden md:flex w-64 h-screen flex-col border-r border-slate-300 dark:border-white/5 p-10 sticky top-0 bg-white/50 dark:bg-[#020617]/50 backdrop-blur-xl z-20 no-print">
        <div className="mb-16"><h1 className="brand-text text-4xl">Custos</h1><p className="text-[9px] tracking-[0.4em] font-bold text-indigo-600 mt-2 uppercase font-noto">{t.theKeeper}</p></div>
        <nav className="flex-1 space-y-8">
          {navItems.map(item => (
            <button key={item.id} onClick={() => navigateTo(item.id as any)} className={`block w-full text-left text-[10px] tracking-[0.3em] font-black uppercase transition-all font-noto ${activeTab === item.id ? 'text-indigo-600 translate-x-1' : 'text-slate-500 dark:text-white/50 hover:text-indigo-600'}`}>{item.label}</button>
          ))}
          {!auth.currentUser && (
            <button onClick={() => navigateTo('auth')} className={`block w-full text-left text-[10px] tracking-[0.3em] font-black uppercase transition-all pt-8 mt-8 border-t border-slate-300 dark:border-white/5 font-noto ${activeTab === 'auth' ? 'text-indigo-600' : 'text-slate-500 dark:text-white/50 hover:text-indigo-600'}`}>{t.authAction}</button>
          )}
        </nav>
      </aside>
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-14 glass z-50 flex items-center justify-around rounded-none border border-slate-300 dark:border-white/10 no-print">
         {navItems.map(item => (
            <button key={item.id} onClick={() => navigateTo(item.id as any)} className={`text-[8px] tracking-[0.2em] font-black uppercase transition-all font-noto ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-500 dark:text-white/50'}`}>{item.label}</button>
          ))}
      </nav>
      {snackbar.isVisible && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-6 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4">
          <p className="text-[10px] font-black tracking-widest uppercase">{snackbar.message}</p>
          <button onClick={() => { snackbar.onUndo(); setSnackbar(prev => ({ ...prev, isVisible: false })); }} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">{t.undo}</button>
        </div>
      )}
      <main className="flex-1 p-6 md:p-12 pb-24 md:pb-12 relative z-10 overflow-y-auto">
        <header className="md:hidden mb-12 flex justify-between items-center"><h1 className="brand-text text-3xl">Custos</h1></header>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;

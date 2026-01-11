
import React, { useState, useEffect, useMemo } from 'react';
import { Vault } from './components/Vault';
import { Records } from './components/Records';
import { AIAdvisor } from './components/AIAdvisor';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { BudgetEdit } from './components/BudgetEdit';
import { ClassWiseOutflow } from './components/ClassWiseOutflow';
import { FiltersPage } from './components/FiltersPage';
import { Feedback } from './components/Feedback';
import { ContactPopup } from './components/ContactPopup';
import { InitialShield } from './components/InitialShield';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ShieldIcon, CURRENCIES, DEFAULT_CATEGORIES } from './constants';
import { translations } from './translations';
import { Transaction, UserProfile } from './types';
import { StorageService } from './services/storageService';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";

type AppTab = 'vault' | 'history' | 'ai' | 'profile' | 'auth' | 'outflow' | 'budget-edit' | 'filters' | 'feedback';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('vault');
  const [feedbackType, setFeedbackType] = useState<'issue' | 'update'>('issue');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showSplash, setShowSplash] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    uid: 'local-user',
    displayName: 'The Local User',
    email: '',
    currency: 'INR',
    country: 'India',
    isCloudGuardian: false,
    theme: 'dark',
    language: 'en',
    budgetLimits: {},
    customCategories: []
  });
  const [loading, setLoading] = useState(true);

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
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4500);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
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
        await StorageService.syncLocalToCloud(user.uid, user.displayName || 'User');
        
        const cloudProfile = await StorageService.getProfile(user.uid);
        if (cloudProfile) {
          setProfile({ ...cloudProfile, language: cloudProfile.language || 'en' });
          unsubscribeTxs = StorageService.subscribeToTransactions(user.uid, cloudProfile.familyId, (txs) => {
            setTransactions(txs);
          });
        } else {
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'The User',
            email: user.email || '',
            currency: 'INR',
            country: 'India',
            state: '',
            city: '',
            isCloudGuardian: true,
            theme: 'dark',
            language: 'en',
            budgetLimits: {},
            customCategories: []
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
          displayName: 'The Local User',
          email: '',
          currency: 'INR',
          country: 'India',
          isCloudGuardian: false,
          theme: 'dark',
          language: 'en',
          budgetLimits: {},
          customCategories: []
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

  const updateProfile = async (p: UserProfile) => {
    setProfile(p);
    StorageService.saveUserPrefs(p);
    if (auth.currentUser) await StorageService.saveProfile(p);
  };

  const addTransaction = async (tx: Transaction) => {
    const enrichedT = { ...tx, familyId: profile.familyId, userId: profile.uid };
    if (auth.currentUser) {
       await StorageService.syncTransaction(enrichedT);
    } else {
       StorageService.saveLocalTransaction(enrichedT);
       setTransactions(prev => [...prev, enrichedT]);
    }
  };

  const updateTransaction = async (tx: Transaction) => {
    if (auth.currentUser) await StorageService.updateTransaction(tx);
    else {
      StorageService.updateLocalTransaction(tx);
      setTransactions(prev => prev.map(item => item.id === tx.id ? tx : item));
    }
  };

  const deleteTransaction = async (id: string) => {
    if (auth.currentUser) await StorageService.removeTransaction(id);
    else {
      StorageService.deleteLocalTransaction(id);
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    }
  };

  const deleteCategory = (catName: string) => {
    if (DEFAULT_CATEGORIES.includes(catName)) return;
    setDeleteModal({ isOpen: true, category: catName });
  };

  const confirmDeleteCategory = async () => {
    const catName = deleteModal.category;
    const newCustom = (profile.customCategories || []).filter(c => c !== catName);
    const newLimits = { ...(profile.budgetLimits || {}) };
    delete newLimits[catName];
    
    await updateProfile({ ...profile, customCategories: newCustom, budgetLimits: newLimits });
    setDeleteModal({ isOpen: false, category: '' });
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

  const currencySymbol = useMemo(() => {
    return CURRENCIES.find(c => c.code === profile.currency)?.symbol || '₹';
  }, [profile.currency]);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const renderContent = () => {
    if (activeTab === 'auth') return <Auth language={profile.language} onSuccess={() => setActiveTab('profile')} />;
    
    switch (activeTab) {
      case 'vault': return <Vault onAdd={addTransaction} currencySymbol={currencySymbol} transactions={transactions} language={profile.language} categories={allCategories} />;
      case 'history': return (
        <Records 
          transactions={transactions} 
          onDelete={deleteTransaction} 
          onUpdate={updateTransaction}
          onNavigateToOutflow={() => setActiveTab('outflow')}
          onNavigateToFilters={() => setActiveTab('filters')}
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
          onBack={() => setActiveTab('history')}
          onClear={clearFilters}
          language={profile.language}
        />
      );
      case 'outflow': return (
        <ClassWiseOutflow 
          transactions={transactions} 
          profile={profile} 
          onBack={() => setActiveTab('history')} 
          language={profile.language} 
          categories={allCategories}
        />
      );
      case 'budget-edit': return (
        <BudgetEdit 
          profile={profile} 
          onUpdate={updateProfile} 
          onDeleteCategory={deleteCategory}
          onRenameCategory={renameCategory}
          onBack={() => setActiveTab('profile')} 
          language={profile.language} 
        />
      );
      case 'feedback': return (
        <Feedback 
          type={feedbackType} 
          profile={profile} 
          language={profile.language} 
          onBack={() => setActiveTab('profile')} 
        />
      );
      case 'ai': return <div className="max-w-3xl mx-auto"><AIAdvisor transactions={transactions} currency={profile.currency} language={profile.language} /></div>;
      case 'profile': return (
        <div className="space-y-12 max-w-3xl mx-auto">
          <Profile 
            profile={profile} 
            onUpdate={updateProfile} 
            onToggleLanguage={toggleLanguage}
            onGoCloud={() => setActiveTab('auth')}
            onNavigateToEditLimits={() => setActiveTab('budget-edit')}
            onNavigateToFeedback={(type) => {
              setFeedbackType(type);
              setActiveTab('feedback');
            }}
            onOpenContact={() => setShowContactPopup(true)}
            deferredPrompt={deferredPrompt}
          />
          {auth.currentUser && (
            <div className="pt-12 border-t border-slate-300 dark:border-white/5 flex justify-center">
              <button 
                onClick={() => signOut(auth)}
                className="text-[10px] tracking-[0.3em] font-black uppercase text-rose-600 hover:text-rose-400 transition-colors font-noto"
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

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-[100] animate-out fade-out fill-mode-forwards duration-1000 delay-[4000ms]">
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
        title="Dissolve Asset Class"
        message={`Are you sure you want to dissolve '${deleteModal.category}'? Transactions mapped to this class will persist but the class itself will be removed from your palette.`}
        confirmLabel="DISSOLVE"
        cancelLabel="PRESERVE"
        onConfirm={confirmDeleteCategory}
        onCancel={() => setDeleteModal({ isOpen: false, category: '' })}
        language={profile.language}
      />

      {showContactPopup && <ContactPopup onClose={() => setShowContactPopup(false)} language={profile.language} />}

      <button 
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-[100] w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 group overflow-hidden no-print"
        aria-label="Toggle Theme"
      >
        <div className={`relative w-full h-full flex items-center justify-center transition-transform duration-700 ${profile.theme === 'dark' ? 'rotate-0' : 'rotate-[360deg]'}`}>
          {profile.theme === 'dark' ? (
            <svg className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                <line 
                  key={deg} 
                  x1="12" y1="1" x2="12" y2="4" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  transform={`rotate(${deg}, 12, 12)`}
                />
              ))}
            </svg>
          ) : (
            <svg className="w-6 h-6 text-indigo-600 fill-indigo-600" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </div>
        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>

      <aside className="hidden md:flex w-64 h-screen flex-col border-r border-slate-300 dark:border-white/5 p-10 sticky top-0 bg-white/50 dark:bg-[#020617]/50 backdrop-blur-xl z-20 no-print">
        <div className="mb-16">
          <h1 className="brand-text text-4xl">Custos</h1>
          <p className="text-[9px] tracking-[0.4em] font-bold text-indigo-600 mt-2 uppercase font-noto">{t.theKeeper}</p>
        </div>

        <nav className="flex-1 space-y-8">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`block w-full text-left text-[10px] tracking-[0.3em] font-black uppercase transition-all font-noto ${activeTab === item.id ? 'text-indigo-600 translate-x-1' : 'text-slate-500 dark:text-white/20 hover:text-indigo-600'}`}
            >
              {item.label}
            </button>
          ))}
          {!auth.currentUser && (
            <button
              onClick={() => setActiveTab('auth')}
              className={`block w-full text-left text-[10px] tracking-[0.3em] font-black uppercase transition-all pt-8 mt-8 border-t border-slate-300 dark:border-white/5 font-noto ${activeTab === 'auth' ? 'text-indigo-600' : 'text-slate-500 dark:text-white/20 hover:text-indigo-600'}`}
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
            <div className="w-10 h-10 border border-slate-300 dark:border-white/10 p-1 flex-shrink-0 flex items-center justify-center">
              <InitialShield name={profile.displayName} size="sm" />
            </div>
            <div className="truncate">
              <p className="text-[9px] font-black tracking-widest uppercase truncate font-noto">{profile.displayName}</p>
            </div>
          </div>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-14 glass z-50 flex items-center justify-around rounded-none border border-slate-300 dark:border-white/10 no-print">
         {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`text-[8px] tracking-[0.2em] font-black uppercase transition-all font-noto ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-500 dark:text-white/30'}`}
            >
              {item.label}
            </button>
          ))}
      </nav>

      <main className="flex-1 p-6 md:p-12 pb-24 md:pb-12 relative z-10 overflow-y-auto">
        <header className="md:hidden mb-12 flex justify-between items-center">
          <h1 className="brand-text text-3xl">Custos</h1>
          <button onClick={() => setActiveTab('profile')} className="w-10 h-10 border border-indigo-600/20 shadow-md flex items-center justify-center overflow-hidden">
            <InitialShield name={profile.displayName} size="sm" />
          </button>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;

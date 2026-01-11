
import React from 'react';
import { Transaction, UserProfile } from '../types';
import { BudgetTracker } from './BudgetTracker';
import { translations } from '../translations';
import { CURRENCIES } from '../constants';

interface ClassWiseOutflowProps {
  transactions: Transaction[];
  profile: UserProfile;
  onBack: () => void;
  language: 'en' | 'ta';
  categories: string[];
}

export const ClassWiseOutflow: React.FC<ClassWiseOutflowProps> = ({ transactions, profile, onBack, language, categories }) => {
  const t = translations[language];
  const currencySymbol = CURRENCIES.find(c => c.code === profile.currency)?.symbol || '₹';

  return (
    <div className="animate-in w-full max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase font-noto">{t.categoryWiseExpenditure}</h2>
          <p className="text-slate-800 dark:text-white/30 tracking-[0.4em] text-[10px] mt-1 uppercase font-black">{t.ledger} / BREAKDOWN</p>
        </div>
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
        >
          {t.backToLedger}
        </button>
      </div>

      <div className="pt-12 border-t border-slate-300 dark:border-white/5">
        <BudgetTracker 
          transactions={transactions} 
          currencySymbol={currencySymbol} 
          limits={profile.budgetLimits}
          categories={categories}
        />
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { UserProfile } from '../types';
import { CURRENCIES, DEFAULT_CATEGORIES, TrashIcon } from '../constants';
import { translations } from '../translations';

interface BudgetEditProps {
  profile: UserProfile;
  onUpdate: (p: UserProfile) => void;
  onBack: () => void;
  language: 'en' | 'ta';
}

export const BudgetEdit: React.FC<BudgetEditProps> = ({ profile, onUpdate, onBack, language }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);
  const t = translations[language];
  const currencySymbol = CURRENCIES.find(c => c.code === profile.currency)?.symbol || '₹';

  const updateLimit = (cat: string, val: number) => {
    const newLimits = { ...(profile.budgetLimits || {}), [cat]: val };
    onUpdate({ ...profile, budgetLimits: newLimits });
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    
    // Check if it already exists in base or custom
    if (DEFAULT_CATEGORIES.includes(name) || profile.customCategories?.includes(name)) {
      setNewCategoryName('');
      return;
    }

    const newCustom = [...(profile.customCategories || []), name];
    onUpdate({ ...profile, customCategories: newCustom });
    setNewCategoryName('');
    setShowConfirmAdd(true);
    setTimeout(() => setShowConfirmAdd(false), 2000);
  };

  const removeCategory = (name: string) => {
    // Only allow removing custom categories
    if (DEFAULT_CATEGORIES.includes(name)) return;
    
    if (confirm(`Dissolve Asset Class: ${name}?`)) {
      const newCustom = (profile.customCategories || []).filter(c => c !== name);
      // Also cleanup limits
      const newLimits = { ...(profile.budgetLimits || {}) };
      delete newLimits[name];
      
      onUpdate({ ...profile, customCategories: newCustom, budgetLimits: newLimits });
    }
  };

  const allCategories = [...DEFAULT_CATEGORIES, ...(profile.customCategories || [])];

  return (
    <div className="animate-in w-full max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase font-noto">{t.classAmountEdit}</h2>
          <p className="text-slate-800 dark:text-white/30 tracking-[0.4em] text-[10px] mt-1 uppercase font-black">{t.guardianConfig} / REFINEMENT</p>
        </div>
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
        >
          {t.backToProfile}
        </button>
      </div>

      {/* Add New Category Section */}
      <div className="p-8 bg-indigo-600/[0.03] border border-indigo-600/20 relative overflow-hidden">
        {showConfirmAdd && (
          <div className="absolute inset-0 bg-emerald-600 flex items-center justify-center animate-in z-10">
            <span className="text-white text-[10px] font-black tracking-widest uppercase">CLASS ESTABLISHED</span>
          </div>
        )}
        <label className="text-[10px] tracking-[0.4em] font-black text-slate-800 dark:text-white/40 uppercase block mb-4">Establish New Asset Class</label>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            className="flex-1 bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none focus:border-indigo-600 text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white font-noto"
            placeholder="Class Name..."
          />
          <button 
            onClick={addCategory}
            className="px-10 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg"
          >
            Add Class
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8 border-t border-slate-300 dark:border-white/5">
        {allCategories.filter(c => c !== 'Income').map(cat => {
          const isBase = DEFAULT_CATEGORIES.includes(cat);
          return (
            <div key={cat} className="glass p-6 border border-slate-300 dark:border-white/10 group focus-within:border-indigo-600 transition-all relative">
              <div className="flex justify-between items-start mb-4">
                <label className="text-[8px] tracking-[0.3em] font-black uppercase text-slate-700 dark:text-white/30 block">
                  {(t.categories as any)[cat] || cat}
                </label>
                {!isBase && (
                  <button 
                    onClick={() => removeCategory(cat)}
                    className="text-rose-600 hover:scale-110 transition-transform p-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-light text-slate-400 dark:text-white/10">{currencySymbol}</span>
                <input 
                  type="number" 
                  value={profile.budgetLimits?.[cat] || 0}
                  onChange={(e) => updateLimit(cat, Number(e.target.value))}
                  className="flex-1 bg-transparent outline-none text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white font-noto placeholder:text-slate-200"
                  placeholder="0"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

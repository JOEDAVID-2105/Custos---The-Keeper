
import React, { useMemo } from 'react';
import { DEFAULT_CATEGORIES } from '../constants';
import { Transaction, Budget, Category } from '../types';
import { translations } from '../translations';

interface BudgetTrackerProps {
  transactions: Transaction[];
  currencySymbol: string;
  onUpdateLimit?: (category: string, limit: number) => void;
  limits?: Record<string, number>;
  categories?: string[];
  language?: 'en' | 'ta';
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ transactions, currencySymbol, limits = {}, categories = DEFAULT_CATEGORIES, language = 'en' }) => {
  const t = translations[language];
  const budgets: Budget[] = useMemo(() => {
    return categories.map(cat => {
      if (cat === 'Income') return null;
      const spent = transactions
        .filter(t => t.category === cat && t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);
      
      return { category: cat as Category, limit: limits[cat] || 5000, spent };
    }).filter(b => b !== null) as Budget[];
  }, [transactions, limits, categories]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
      {budgets.map(b => {
        const percentage = Math.min((b.spent / b.limit) * 100, 100);
        let color = 'bg-emerald-500';
        if (percentage > 70) color = 'bg-amber-500';
        if (percentage >= 100) color = 'bg-rose-500';

        return (
          <div key={b.category} className="glass p-5 md:p-6 border border-white/5 relative group/budget">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 dark:text-white/50 font-noto">
                {(t.categories as any)[b.category] || b.category}
              </span>
              <div className="flex flex-col items-end">
                <span className="text-[10px] md:text-xs font-black text-slate-900 dark:text-white font-noto">
                  {currencySymbol}{b.spent.toLocaleString()} / {b.limit.toLocaleString()}
                </span>
                <span className="text-[6px] font-black uppercase text-indigo-500 opacity-0 group-hover/budget:opacity-100 transition-opacity font-noto">Protocol limit</span>
              </div>
            </div>
            <div className="w-full h-1 bg-slate-200 dark:bg-white/5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${color}`} 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};


import React from 'react';
import { CATEGORIES } from '../constants';
import { Transaction, Budget, Category } from '../types';

interface BudgetTrackerProps {
  transactions: Transaction[];
  currencySymbol: string;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ transactions, currencySymbol }) => {
  const budgets: Budget[] = CATEGORIES.map(cat => {
    if (cat === 'Income') return null;
    const spent = transactions
      .filter(t => t.category === cat && t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    // For demo: Mocking a fixed limit of 5000 per category
    return { category: cat as Category, limit: 5000, spent };
  }).filter(b => b !== null) as Budget[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {budgets.map(b => {
        const percentage = Math.min((b.spent / b.limit) * 100, 100);
        let color = 'bg-emerald-500';
        if (percentage > 70) color = 'bg-amber-500';
        if (percentage >= 100) color = 'bg-rose-500';

        return (
          <div key={b.category} className="glass p-6 border border-white/5">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">{b.category}</span>
              <span className="text-xs font-black">{currencySymbol}{b.spent.toLocaleString()} / {b.limit.toLocaleString()}</span>
            </div>
            <div className="w-full h-1 bg-white/5 overflow-hidden">
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

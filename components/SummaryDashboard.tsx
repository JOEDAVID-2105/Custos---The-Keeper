
import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { translations } from '../translations';

interface SummaryDashboardProps {
  transactions: Transaction[];
  currencySymbol: string;
  language: 'en' | 'ta';
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ transactions, currencySymbol, language }) => {
  const t = translations[language];
  const summary = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const retentionRate = income > 0 ? Math.max(0, Math.min(100, ((income - expense) / income) * 100)) : 0;
    const expenseRatio = income > 0 ? Math.min(100, (expense / income) * 100) : (expense > 0 ? 100 : 0);
    
    return { income, expense, balance: income - expense, retentionRate, expenseRatio };
  }, [transactions]);

  return (
    <div className="flex flex-col border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden w-full max-w-full">
      {/* Metrics Row - Multi-row on mobile, single on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-white/10">
        <div className="p-4 md:p-8 group hover:bg-emerald-500/[0.02] transition-colors border-r border-slate-200 dark:border-white/10">
          <p className="text-[7px] md:text-[8px] tracking-[0.2em] md:tracking-[0.4em] font-black text-emerald-600 dark:text-emerald-500/50 uppercase mb-2 md:mb-4">{t.totalInflow}</p>
          <p className="text-base md:text-2xl font-black tracking-tighter text-emerald-700 dark:text-emerald-500">
            {currencySymbol}{summary.income.toLocaleString()}
          </p>
        </div>

        <div className="p-4 md:p-8 group hover:bg-rose-500/[0.02] transition-colors">
          <p className="text-[7px] md:text-[8px] tracking-[0.2em] md:tracking-[0.4em] font-black text-rose-600 dark:text-rose-500/50 uppercase mb-2 md:mb-4">{t.totalOutflow}</p>
          <p className="text-base md:text-2xl font-black tracking-tighter text-rose-700 dark:text-rose-500">
            {currencySymbol}{summary.expense.toLocaleString()}
          </p>
        </div>

        <div className="p-4 md:p-8 group bg-slate-50 dark:bg-white/[0.01] col-span-2 md:col-span-1 border-t border-slate-200 dark:border-white/10 md:border-t-0">
          <p className="text-[7px] md:text-[8px] tracking-[0.2em] md:tracking-[0.4em] font-black text-slate-500 dark:text-white/30 uppercase mb-2 md:mb-4">{t.currentBalance}</p>
          <p className="text-2xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
            {currencySymbol}{summary.balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Balance Shift Progress Bar */}
      <div className="px-4 md:px-8 pb-4 md:pb-8 pt-2">
        <div className="flex justify-between items-center mb-2 md:mb-3">
          <span className="text-[7px] md:text-[8px] tracking-[0.3em] md:tracking-[0.5em] font-black text-slate-500 dark:text-white/20 uppercase">
            {t.retention}
          </span>
          <span className={`text-[8px] md:text-[10px] font-black tracking-widest uppercase ${summary.retentionRate > 20 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
            {summary.retentionRate.toFixed(1)}% {t.secured}
          </span>
        </div>
        <div className="relative w-full h-1 md:h-1.5 bg-slate-200 dark:bg-white/5 overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-rose-500/40 transition-all duration-1000 ease-out"
            style={{ width: `${summary.expenseRatio}%` }}
          />
          <div 
            className="absolute top-0 right-0 h-full bg-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: `${summary.retentionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};

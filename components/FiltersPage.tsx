
import React from 'react';
import { translations } from '../translations';

interface FiltersPageProps {
  search: string;
  setSearch: (v: string) => void;
  typeFilter: 'all' | 'income' | 'expense';
  setTypeFilter: (v: 'all' | 'income' | 'expense') => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  sortBy: 'date' | 'amount';
  setSortBy: (v: 'date' | 'amount') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (v: 'asc' | 'desc') => void;
  onBack: () => void;
  onClear: () => void;
  language: 'en' | 'ta';
}

export const FiltersPage: React.FC<FiltersPageProps> = ({
  search, setSearch,
  typeFilter, setTypeFilter,
  startDate, setStartDate,
  endDate, setEndDate,
  sortBy, setSortBy,
  sortOrder, setSortOrder,
  onBack, onClear,
  language
}) => {
  const t = translations[language];

  return (
    <div className="animate-in w-full max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase font-noto">{t.filtersLabel}</h2>
          <p className="text-slate-800 dark:text-white/30 tracking-[0.4em] text-[10px] mt-1 uppercase font-black">{t.ledger} / REFINEMENT</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onClear}
            className="px-8 py-3 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-white/50 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            {t.clearFilters}
          </button>
          <button 
            onClick={onBack}
            className="px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
          >
            {t.applyFilters}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-300 dark:border-white/5">
        <div className="space-y-2">
          <label className="text-[9px] tracking-[0.4em] font-black uppercase text-slate-800 dark:text-white/30">{t.filters.keyword}</label>
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none text-sm md:text-base font-bold text-slate-900 dark:text-white font-noto" 
            placeholder="..." 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] tracking-[0.4em] font-black uppercase text-slate-800 dark:text-white/30">{t.filters.flow}</label>
          <select 
            value={typeFilter} 
            onChange={e => setTypeFilter(e.target.value as any)} 
            className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none text-sm md:text-base font-bold text-slate-900 dark:text-white uppercase"
          >
            <option value="all">ALL</option>
            <option value="income">{t.inflow}</option>
            <option value="expense">{t.outflow}</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] tracking-[0.4em] font-black uppercase text-slate-800 dark:text-white/30">{t.filters.start}</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
            className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none text-sm md:text-base font-bold text-slate-900 dark:text-white" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] tracking-[0.4em] font-black uppercase text-slate-800 dark:text-white/30">{t.filters.end}</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
            className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none text-sm md:text-base font-bold text-slate-900 dark:text-white" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] tracking-[0.4em] font-black uppercase text-slate-800 dark:text-white/30">{t.filters.sortBy}</label>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value as any)} 
            className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none text-sm md:text-base font-bold text-slate-900 dark:text-white uppercase"
          >
            <option value="date">{t.sequence}</option>
            <option value="amount">{t.magnitude}</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] tracking-[0.4em] font-black uppercase text-slate-800 dark:text-white/30">{t.filters.order}</label>
          <select 
            value={sortOrder} 
            onChange={e => setSortOrder(e.target.value as any)} 
            className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none text-sm md:text-base font-bold text-slate-900 dark:text-white uppercase"
          >
            <option value="desc">{t.filters.desc}</option>
            <option value="asc">{t.filters.asc}</option>
          </select>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '../types';
import { SummaryDashboard } from './SummaryDashboard';
import { translations } from '../translations';
import { TrashIcon } from '../constants';

interface RecordsProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onUpdate: (transaction: Transaction) => void;
  onNavigateToOutflow: () => void;
  onNavigateToFilters: () => void;
  search: string;
  typeFilter: 'all' | 'income' | 'expense';
  startDate: string;
  endDate: string;
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
  currencySymbol: string;
  currentUserId: string;
  language: 'en' | 'ta';
  categories: string[];
}

const LocationIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

export const Records: React.FC<RecordsProps> = ({ 
  transactions, onDelete, onUpdate, onNavigateToOutflow, onNavigateToFilters,
  search, typeFilter, startDate, endDate, sortBy, sortOrder,
  currencySymbol, currentUserId, language, categories
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Transaction>>({});

  const t = translations[language];

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (search) {
      const term = search.toLowerCase();
      list = list.filter(tx => 
        (tx.note?.toLowerCase().includes(term)) || 
        (tx.category?.toLowerCase().includes(term)) ||
        (tx.userName?.toLowerCase().includes(term))
      );
    }

    if (typeFilter !== 'all') {
      list = list.filter(tx => tx.type === typeFilter);
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      list = list.filter(tx => tx.timestamp >= start);
    }

    if (endDate) {
      const end = new Date(endDate).getTime() + 86399999;
      list = list.filter(tx => tx.timestamp <= end);
    }

    return list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') comparison = a.timestamp - b.timestamp;
      else comparison = a.amount - b.amount;
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [transactions, search, typeFilter, startDate, endDate, sortBy, sortOrder]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      const dateKey = new Date(tx.timestamp).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions]);

  const startEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditValues({ ...tx });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = () => {
    if (editingId && editValues) {
      onUpdate(editValues as Transaction);
      setEditingId(null);
    }
  };

  return (
    <div className="animate-in w-full pb-20 max-w-full overflow-hidden">
      <div className="flex flex-col mb-8 md:mb-16 gap-4 md:gap-8 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex-1">
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">{t.ledger}</h2>
            <p className="text-slate-800 dark:text-white/30 tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-[10px] mt-1 uppercase font-black">Archive of Sovereignty</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onClick={onNavigateToOutflow}
              className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg font-noto"
            >
              {t.categoryWiseExpenditure}
            </button>
            <button 
              onClick={onNavigateToFilters}
              className="flex-1 md:flex-none px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all border border-transparent dark:border-white/10 font-noto"
            >
              {t.filtersLabel}
            </button>
          </div>
        </div>

        <SummaryDashboard transactions={transactions} currencySymbol={currencySymbol} language={language} />
      </div>

      <div className="flex flex-col w-full max-w-full overflow-hidden">
        <div className="overflow-x-auto w-full -mx-4 md:mx-0 px-4 md:px-0 scrollbar-hide">
          <table className="w-full text-left border-collapse print:text-black min-w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-[7px] md:text-[8px] tracking-[0.5em] text-slate-800 dark:text-white/20 uppercase font-black">
                <th className="pb-4 px-2 md:px-6 font-normal">TIME & ALIAS</th>
                <th className="pb-4 font-normal">CATEGORY</th>
                <th className="pb-4 font-normal">DESC</th>
                <th className="pb-4 font-normal text-right">VAL</th>
                <th className="pb-4 px-2 md:px-6 font-normal text-right no-print">ACT</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(groupedTransactions) as [string, Transaction[]][]).map(([date, txs]) => (
                <React.Fragment key={date}>
                  <tr className="bg-slate-200/50 dark:bg-white/[0.03] print:bg-slate-50 border-y border-slate-200 dark:border-white/5">
                    <td colSpan={5} className="py-2 px-2 md:px-6 border-l-4 border-indigo-600">
                      <h3 className="text-[10px] md:text-sm font-black tracking-widest uppercase text-slate-900 dark:text-white/90 print:text-black">{date}</h3>
                    </td>
                  </tr>
                  {txs.map(tx => {
                    const isOwner = tx.userId === currentUserId || tx.userId === 'local-user';
                    const isEditing = editingId === tx.id;

                    return (
                      <tr key={tx.id} className="border-b border-slate-300 dark:border-white/[0.03] transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.01]">
                        <td className="py-3 px-2 md:px-6">
                           <div className="flex flex-col">
                             <div className="flex items-center gap-1.5">
                                <span className="text-[9px] md:text-[11px] font-black text-slate-900 dark:text-white/80 font-mono tracking-tighter md:tracking-widest print:text-black">
                                  {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </span>
                                {tx.location && <LocationIcon className="w-2 h-2 text-indigo-500 opacity-60" />}
                             </div>
                             <span className="text-[7px] md:text-[8px] font-black text-slate-400 dark:text-white/10 uppercase tracking-widest truncate max-w-[80px]">
                               {tx.userName || 'LOCAL'}
                             </span>
                           </div>
                        </td>
                        <td className="py-3">
                          {isEditing ? (
                            <select value={editValues.category} onChange={e => setEditValues({...editValues, category: e.target.value})} className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-[8px] p-1 uppercase font-black outline-none focus:border-indigo-600 text-slate-900 dark:text-white">
                              {categories.map(cat => <option key={cat} value={cat}>{(t.categories as any)[cat] || cat}</option>)}
                            </select>
                          ) : (
                            <span className={`text-[6px] md:text-[8px] tracking-[0.1em] px-1.5 md:px-2 py-0.5 border uppercase font-black ${tx.type === 'income' ? 'border-emerald-600/50 text-emerald-900 dark:text-emerald-400 bg-emerald-500/10' : 'border-slate-500 dark:border-white/10 text-slate-900 dark:text-white/60 bg-slate-200 dark:bg-white/5'}`}>
                              {(t.categories as any)[tx.category] || tx.category}
                            </span>
                          )}
                        </td>
                        <td className="py-3 max-w-[70px] md:max-w-none">
                          {isEditing ? (
                            <input type="text" value={editValues.note} onChange={e => setEditValues({...editValues, note: e.target.value})} className="bg-transparent border-b border-slate-400 dark:border-white/10 text-[10px] outline-none w-full py-1 text-slate-900 dark:text-white font-noto" />
                          ) : (
                            <span className="text-[9px] md:text-sm font-medium tracking-tight text-slate-900 dark:text-white/70 print:text-black font-noto truncate block">
                              {tx.note || '...'}
                            </span>
                          )}
                        </td>
                        <td className={`py-3 text-right font-black text-xs md:text-xl tracking-tighter ${tx.type === 'income' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white print:text-black'}`}>
                          {isEditing ? (
                            <input type="number" value={editValues.amount} onChange={e => setEditValues({...editValues, amount: Number(e.target.value)})} className="bg-transparent border-b border-slate-400 dark:border-white/10 text-sm outline-none w-16 text-right font-black text-slate-900 dark:text-white" />
                          ) : (
                            <>{tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}</>
                          )}
                        </td>
                        <td className="py-3 px-2 md:px-6 text-right no-print">
                          {isOwner ? (
                            <div className="flex justify-end gap-2 md:gap-4 items-center">
                              {isEditing ? (
                                <>
                                  <button onClick={saveEdit} className="text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest font-noto">SAVE</button>
                                  <button onClick={cancelEdit} className="text-slate-600 dark:text-white/40 text-[8px] font-black uppercase tracking-widest font-noto">EXIT</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => startEdit(tx)} className="text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase tracking-widest underline decoration-2 decoration-indigo-600/20 font-noto">EDIT</button>
                                  <button onClick={() => onDelete(tx.id)} className="text-rose-600 hover:scale-110 transition-transform p-1">
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-[6px] font-black uppercase tracking-widest text-slate-500 dark:text-white/5 italic">LOCKED</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

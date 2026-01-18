
import React, { useState, useMemo } from 'react';
import { Transaction, Category, UserProfile } from '../types';
import { SummaryDashboard } from './SummaryDashboard';
import { translations } from '../translations';
import { TrashIcon, PAYMENT_METHODS } from '../constants';
import { InitialShield } from './InitialShield';

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
  familyId?: string;
  familyMembers?: UserProfile[];
}

const LocationPinIcon = ({ className, onClick }: { className?: string, onClick?: () => void }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={`${className} cursor-pointer hover:text-indigo-600 transition-all active:scale-90`}
    onClick={onClick}
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

export const Records: React.FC<RecordsProps> = ({ 
  transactions, onDelete, onUpdate, onNavigateToOutflow, onNavigateToFilters,
  search, typeFilter, startDate, endDate, sortBy, sortOrder,
  currencySymbol, currentUserId, language, categories, familyId, familyMembers = []
}) => {
  const [viewingTx, setViewingTx] = useState<Transaction | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Transaction>>({});
  const [viewMode, setViewMode] = useState<'private' | 'family'>(familyId ? 'family' : 'private');

  const t = translations[language];

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (viewMode === 'family') {
       list = list.filter(tx => tx.familyId === familyId && tx.familyId !== undefined && tx.familyId !== null);
    } else {
       list = list.filter(tx => !tx.familyId || tx.familyId === null);
    }

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
  }, [transactions, search, typeFilter, startDate, endDate, sortBy, sortOrder, viewMode, familyId]);

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
      setViewingTx(editValues as Transaction);
      setEditingId(null);
    }
  };

  const handleOpenMap = (tx: Transaction) => {
    if (tx.location) {
      const url = `https://www.google.com/maps/search/?api=1&query=${tx.location.lat},${tx.location.lng}`;
      window.open(url, '_blank');
    }
  };

  const handleRowClick = (tx: Transaction) => {
    setViewingTx(tx);
  };

  const closePopup = () => {
    setViewingTx(null);
    setEditingId(null);
  };

  const formatTimestampForInput = (ts: number) => {
    const d = new Date(ts);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="animate-in w-full pb-20 max-w-full overflow-hidden">
      <div className="flex flex-col mb-8 md:mb-16 gap-4 md:gap-8 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex-1">
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">{t.ledger}</h2>
            <div className="flex items-center gap-4 mt-1">
               <p className="text-slate-800 dark:text-white/50 tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-[10px] uppercase font-black">Archive of Sovereignty</p>
               {familyId && familyMembers.length > 0 && (
                 <div className="flex -space-x-2 animate-in fade-in slide-in-from-left-2">
                    {familyMembers.map((member) => (
                      <div key={member.uid} className="relative group/member">
                        <div className="w-6 h-6 rounded-full border border-slate-50 dark:border-slate-950 bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center overflow-hidden transition-transform hover:scale-110 hover:z-20">
                           <InitialShield name={member.displayName} size="sm" />
                        </div>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[6px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover/member:opacity-100 transition-opacity pointer-events-none z-[100]">
                          {member.displayName}
                        </span>
                      </div>
                    ))}
                 </div>
               )}
            </div>
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
              className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all border border-transparent dark:border-white/10 font-noto flex-1 md:flex-none"
            >
              {t.filtersLabel}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
           <label className="text-[8px] tracking-[0.4em] font-black text-slate-800 dark:text-white/50 uppercase font-noto">{t.modeLabel}</label>
           <select 
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="w-full max-w-sm bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer uppercase tracking-widest text-[10px] font-black text-slate-900 dark:text-white font-noto"
           >
              <option value="private" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t.private}</option>
              {familyId && (
                <option value="family" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t.family}</option>
              )}
           </select>
        </div>

        <SummaryDashboard transactions={filteredTransactions} currencySymbol={currencySymbol} language={language} />
      </div>

      <div className="flex flex-col w-full max-w-full overflow-hidden">
        <div className="overflow-x-auto w-full -mx-4 md:mx-0 px-4 md:px-0 scrollbar-hide">
          <table className="w-full text-left border-collapse print:text-black min-w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-[7px] md:text-[8px] tracking-[0.5em] text-slate-800 dark:text-white/50 uppercase font-black">
                <th className="pb-4 px-2 md:px-6 font-normal">{t.ledgerHeaders.timeAndAlias}</th>
                <th className="pb-4 font-normal">{t.ledgerHeaders.category}</th>
                <th className="pb-4 font-normal">{t.ledgerHeaders.desc}</th>
                <th className="pb-4 font-normal">{t.ledgerHeaders.modeOfPay}</th>
                <th className="pb-4 px-2 md:px-6 font-normal text-right">{t.ledgerHeaders.val}</th>
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
                    return (
                      <tr 
                        key={tx.id} 
                        onClick={() => handleRowClick(tx)}
                        className="border-b border-slate-300 dark:border-white/[0.03] transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.05] cursor-pointer group"
                      >
                        <td className="py-4 px-2 md:px-6">
                           <div className="flex flex-col">
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] md:text-[11px] font-black text-slate-900 dark:text-white/80 font-mono tracking-tighter md:tracking-widest print:text-black group-hover:text-indigo-600">
                                  {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </span>
                                {tx.location && (
                                  <LocationPinIcon className="w-3 h-3 text-indigo-500/40" />
                                )}
                             </div>
                             <span className="text-[7px] md:text-[8px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest truncate max-w-[80px]">
                                {tx.userName || 'LOCAL'}
                             </span>
                           </div>
                        </td>
                        <td className="py-4">
                           <span className={`text-[6px] md:text-[8px] tracking-[0.1em] px-1.5 md:px-2 py-0.5 border uppercase font-black ${tx.type === 'income' ? 'border-emerald-600/50 text-emerald-900 dark:text-emerald-400 bg-emerald-500/10' : 'border-slate-500 dark:border-white/10 text-slate-900 dark:text-white/60 bg-slate-200 dark:bg-white/5'}`}>
                              {(t.categories as any)[tx.category] || tx.category}
                            </span>
                        </td>
                        <td className="py-4">
                           <span className="text-[9px] md:text-sm font-medium tracking-tight text-slate-900 dark:text-white/70 print:text-black font-noto truncate block max-w-[100px] md:max-w-none">
                              {tx.note || '...'}
                            </span>
                        </td>
                        <td className="py-4">
                           <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">
                              {(t.methods as any)[tx.paymentMethod] || tx.paymentMethod}
                            </span>
                        </td>
                        <td className={`py-4 px-2 md:px-6 text-right font-black text-xs md:text-xl tracking-tighter ${tx.type === 'income' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white print:text-black'}`}>
                           {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
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

      {/* Entry Detail Popup */}
      {viewingTx && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg border border-slate-200 dark:border-white/10 shadow-3xl overflow-hidden relative">
            
            {/* Header / Amount */}
            <div className="p-8 md:p-12 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-600 font-noto">{t.entryDetails}</h3>
                <button onClick={closePopup} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors">{t.close}</button>
              </div>
              
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{t.magnitude}</span>
                 {editingId === viewingTx.id ? (
                    <div className="flex items-center gap-4">
                       <span className="text-3xl font-light text-slate-400">{currencySymbol}</span>
                       <input 
                          type="number" 
                          autoFocus
                          value={editValues.amount} 
                          onChange={e => setEditValues({...editValues, amount: Number(e.target.value)})} 
                          className="bg-transparent text-6xl font-black w-full outline-none text-slate-900 dark:text-white font-mono tracking-tighter"
                       />
                    </div>
                 ) : (
                    <p className={`text-6xl font-black tracking-tighter font-mono ${viewingTx.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                       {currencySymbol}{viewingTx.amount.toLocaleString()}
                    </p>
                 )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-8 md:p-12 grid grid-cols-2 gap-y-8 gap-x-12">
               <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.category}</label>
                  {editingId === viewingTx.id ? (
                     <select value={editValues.category} onChange={e => setEditValues({...editValues, category: e.target.value})} className="w-full bg-transparent border-b border-indigo-600 py-1 outline-none text-xs font-black uppercase text-slate-900 dark:text-white">
                        {categories.map(cat => <option key={cat} value={cat}>{(t.categories as any)[cat] || cat}</option>)}
                     </select>
                  ) : (
                     <p className="text-xs font-black uppercase text-slate-900 dark:text-white">{(t.categories as any)[viewingTx.category] || viewingTx.category}</p>
                  )}
               </div>

               <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.protocol}</label>
                  {editingId === viewingTx.id ? (
                     <select value={editValues.paymentMethod} onChange={e => setEditValues({...editValues, paymentMethod: e.target.value})} className="w-full bg-transparent border-b border-indigo-600 py-1 outline-none text-xs font-black uppercase text-slate-900 dark:text-white">
                        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{(t.methods as any)[m] || m}</option>)}
                     </select>
                  ) : (
                     <p className="text-xs font-black uppercase text-slate-900 dark:text-white">{(t.methods as any)[viewingTx.paymentMethod] || viewingTx.paymentMethod}</p>
                  )}
               </div>

               <div className="col-span-2 space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.descriptor}</label>
                  {editingId === viewingTx.id ? (
                     <input type="text" value={editValues.note} onChange={e => setEditValues({...editValues, note: e.target.value})} className="w-full bg-transparent border-b border-indigo-600 py-1 outline-none text-sm font-light text-slate-900 dark:text-white font-noto" />
                  ) : (
                     <p className="text-sm font-light leading-relaxed text-slate-900 dark:text-white/80 font-noto">{viewingTx.note || '—'}</p>
                  )}
               </div>

               <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.originator}</label>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-[10px] font-black uppercase text-indigo-600">{viewingTx.userName || 'LOCAL'}</span>
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.timestamp}</label>
                  {editingId === viewingTx.id ? (
                    <input 
                      type="datetime-local" 
                      value={formatTimestampForInput(editValues.timestamp || viewingTx.timestamp)} 
                      onChange={e => setEditValues({...editValues, timestamp: new Date(e.target.value).getTime()})} 
                      className="w-full bg-transparent border-b border-indigo-600 py-1 outline-none text-[10px] font-black text-slate-900 dark:text-white font-mono"
                    />
                  ) : (
                    <p className="text-[10px] font-black text-slate-900 dark:text-white/60 font-mono mt-1">
                       {new Date(viewingTx.timestamp).toLocaleString()}
                    </p>
                  )}
               </div>

               {viewingTx.location && (
                  <div className="col-span-2 pt-4">
                     <button 
                        onClick={() => handleOpenMap(viewingTx)}
                        className="flex items-center gap-3 text-indigo-600 hover:text-indigo-400 transition-colors"
                     >
                        <LocationPinIcon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.seeLocation}</span>
                     </button>
                  </div>
               )}
            </div>

            {/* Actions Footer */}
            <div className="p-8 md:p-12 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/5">
               {viewingTx.userId === currentUserId || viewingTx.userId === 'local-user' ? (
                  <div className="flex flex-col gap-4">
                     {editingId === viewingTx.id ? (
                        <div className="flex gap-4">
                           <button 
                              onClick={saveEdit}
                              className="flex-1 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl"
                           >
                              {t.commit}
                           </button>
                           <button 
                              onClick={cancelEdit}
                              className="px-8 py-4 border border-slate-300 dark:border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]"
                           >
                              {t.discard}
                           </button>
                        </div>
                     ) : (
                        <div className="flex gap-4">
                           <button 
                              onClick={() => startEdit(viewingTx)}
                              className="flex-1 py-4 border border-indigo-600/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all"
                           >
                              {t.edit}
                           </button>
                           <button 
                              onClick={() => { onDelete(viewingTx.id); closePopup(); }}
                              className="px-8 py-4 bg-rose-600/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all rounded-sm"
                           >
                              <TrashIcon className="w-5 h-5" />
                           </button>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="text-center py-2 opacity-30">
                     <p className="text-[8px] font-black uppercase tracking-widest italic">READ ONLY ARCHIVE</p>
                  </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

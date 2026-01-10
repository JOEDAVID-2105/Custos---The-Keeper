
import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '../types';
import { PAYMENT_METHODS, CATEGORIES } from '../constants';
import { SummaryDashboard } from './SummaryDashboard';
import { translations } from '../translations';

interface RecordsProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onUpdate: (transaction: Transaction) => void;
  currencySymbol: string;
  currentUserId: string;
  language: 'en' | 'ta';
}

export const Records: React.FC<RecordsProps> = ({ transactions, onDelete, onUpdate, currencySymbol, currentUserId, language }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
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

    if (methodFilter !== 'all') {
      list = list.filter(tx => tx.paymentMethod === methodFilter);
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
  }, [transactions, search, typeFilter, methodFilter, startDate, endDate, sortBy, sortOrder]);

  const groupedTransactions = useMemo(() => {
    // We group by date string to create section headers
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

  const exportCSV = () => {
    const headers = ["Date", "Guardian", "Type", "Category", "Method", "Note", "Amount"];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.timestamp).toLocaleDateString(),
      tx.userName || "Unknown",
      tx.type.toUpperCase(),
      tx.category,
      tx.paymentMethod,
      tx.note.replace(/,/g, ' '),
      tx.amount
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `custos_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const openMap = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  return (
    <div className="animate-in w-full pb-20">
      <div className="flex flex-col mb-16 gap-8 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">{t.ledger}</h2>
            <p className="text-slate-400 dark:text-white/30 tracking-[0.4em] text-[10px] mt-2 uppercase font-black">Filtered Financial Records</p>
          </div>
          <button 
            onClick={exportCSV}
            className="px-6 py-3 border border-indigo-600/30 text-indigo-600 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
          >
            {t.exportCSV}
          </button>
        </div>

        <SummaryDashboard transactions={transactions} currencySymbol={currencySymbol} language={language} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 p-10 border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm">
          {/* Row 1: Keyword, Flow, Start Date, End Date */}
          <div className="space-y-3">
            <label className="text-[9px] tracking-[0.4em] font-black uppercase text-slate-400 dark:text-white/20">{t.filters.keyword}</label>
            <input 
              type="text"
              placeholder="..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 outline-none focus:border-indigo-600 transition-all text-sm tracking-widest placeholder:text-slate-400/10 font-bold text-slate-900 dark:text-white font-noto"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[9px] tracking-[0.4em] font-black uppercase text-slate-400 dark:text-white/20">{t.filters.flow}</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 outline-none focus:border-indigo-600 transition-all text-sm font-bold uppercase text-slate-900 dark:text-white">
              <option value="all" className="bg-white dark:bg-slate-900">ALL</option>
              <option value="income" className="bg-white dark:bg-slate-900">{t.inflow}</option>
              <option value="expense" className="bg-white dark:bg-slate-900">{t.outflow}</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[9px] tracking-[0.4em] font-black uppercase text-slate-400 dark:text-white/20">{t.filters.start}</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 outline-none focus:border-indigo-600 transition-all text-sm font-bold uppercase text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[9px] tracking-[0.4em] font-black uppercase text-slate-400 dark:text-white/20">{t.filters.end}</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 outline-none focus:border-indigo-600 transition-all text-sm font-bold uppercase text-slate-900 dark:text-white"
            />
          </div>

          {/* Row 2: Sort By, Sort Order */}
          <div className="space-y-3">
            <label className="text-[9px] tracking-[0.4em] font-black uppercase text-slate-400 dark:text-white/20">{t.filters.sortBy}</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 outline-none focus:border-indigo-600 transition-all text-sm font-bold uppercase text-slate-900 dark:text-white">
              <option value="date" className="bg-white dark:bg-slate-900">{t.sequence}</option>
              <option value="amount" className="bg-white dark:bg-slate-900">{t.magnitude}</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[9px] tracking-[0.4em] font-black uppercase text-slate-400 dark:text-white/20">{t.filters.order}</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 outline-none focus:border-indigo-600 transition-all text-sm font-bold uppercase text-slate-900 dark:text-white">
              <option value="desc" className="bg-white dark:bg-slate-900">{t.filters.desc}</option>
              <option value="asc" className="bg-white dark:bg-slate-900">{t.filters.asc}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse print:text-black">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-[8px] tracking-[0.5em] text-slate-400 dark:text-white/20 uppercase font-black">
                <th className="pb-6 px-6 font-normal">{t.sequence}</th>
                <th className="pb-6 font-normal">{t.assetClass}</th>
                <th className="pb-6 font-normal">{t.protocol}</th>
                <th className="pb-6 font-normal">{t.descriptor}</th>
                <th className="pb-6 font-normal text-right">{t.magnitude}</th>
                <th className="pb-6 px-6 font-normal text-right no-print">{t.privilege}</th>
              </tr>
            </thead>
            <tbody>
              {/* Added explicit type casting to prevent 'unknown' map error */}
              {(Object.entries(groupedTransactions) as [string, Transaction[]][]).map(([date, txs]) => (
                <React.Fragment key={date}>
                  <tr className="bg-slate-100/50 dark:bg-white/[0.03] print:bg-slate-50">
                    <td colSpan={6} className="py-5 px-6 border-l-4 border-indigo-600">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black tracking-tight uppercase text-slate-900 dark:text-white/90 print:text-black">{date}</h3>
                      </div>
                    </td>
                  </tr>
                  {txs.map(tx => {
                    const isOwner = tx.userId === currentUserId || tx.userId === 'local-user';
                    const isEditing = editingId === tx.id;

                    return (
                      <tr key={tx.id} className="group hover:bg-slate-200/20 dark:hover:bg-white/[0.02] transition-colors border-b border-slate-200 dark:border-white/[0.03]">
                        <td className="py-8 px-6">
                           <div className="flex flex-col">
                             <span className="text-[11px] font-black text-slate-700 dark:text-white/80 font-mono tracking-widest print:text-black">
                               {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                             </span>
                             <span className="text-[8px] font-bold text-indigo-600/60 dark:text-indigo-400/40 uppercase tracking-widest mt-1">
                               {t.guardian}: {tx.userName || 'Unknown'}
                             </span>
                             {tx.location && (
                               <button 
                                 onClick={() => openMap(tx.location!.lat, tx.location!.lng)}
                                 className="flex flex-col items-start gap-1 mt-2 group/loc no-print"
                               >
                                 <div className="flex items-center gap-1">
                                   <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                                   <span className="text-[7px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest group-hover/loc:text-indigo-600 dark:group-hover/loc:text-indigo-400 transition-colors">{t.seeLocation}</span>
                                 </div>
                               </button>
                             )}
                           </div>
                        </td>
                        <td className="py-8">
                          {isEditing ? (
                            <select 
                              value={editValues.category} 
                              onChange={e => setEditValues({...editValues, category: e.target.value as Category})}
                              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-[10px] p-2 uppercase font-black outline-none focus:border-indigo-600 text-slate-900 dark:text-white"
                            >
                              {CATEGORIES.map(cat => <option key={cat} value={cat}>{(t.categories as any)[cat] || cat}</option>)}
                            </select>
                          ) : (
                            <span className={`text-[8px] tracking-[0.3em] px-3 py-1 border uppercase font-black ${tx.type === 'income' ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 bg-slate-50 dark:bg-white/5'}`}>
                              {(t.categories as any)[tx.category] || tx.category}
                            </span>
                          )}
                        </td>
                        <td className="py-8 text-[9px] tracking-[0.2em] font-black text-slate-400 dark:text-white/30 uppercase print:text-black">
                          {isEditing ? (
                            <select 
                              value={editValues.paymentMethod} 
                              onChange={e => setEditValues({...editValues, paymentMethod: e.target.value})}
                              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-[10px] p-2 uppercase font-black outline-none focus:border-indigo-600 text-slate-900 dark:text-white"
                            >
                              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{(t.methods as any)[m] || m}</option>)}
                            </select>
                          ) : (t.methods as any)[tx.paymentMethod] || tx.paymentMethod}
                        </td>
                        <td className="py-8">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editValues.note} 
                              onChange={e => setEditValues({...editValues, note: e.target.value})}
                              className="bg-transparent border-b border-slate-200 dark:border-white/10 text-sm outline-none w-full py-1 text-slate-900 dark:text-white font-noto"
                            />
                          ) : (
                            <span className="text-sm font-light tracking-tight text-slate-600 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white transition-colors print:text-black font-noto">
                              {tx.note || '...'}
                            </span>
                          )}
                        </td>
                        <td className={`py-8 text-right font-black text-2xl tracking-tighter ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white print:text-black'}`}>
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={editValues.amount} 
                              onChange={e => setEditValues({...editValues, amount: Number(e.target.value)})}
                              className="bg-transparent border-b border-slate-200 dark:border-white/10 text-2xl outline-none w-28 text-right font-black text-slate-900 dark:text-white"
                            />
                          ) : (
                            <>{tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}</>
                          )}
                        </td>
                        <td className="py-8 px-6 text-right no-print">
                          {isOwner ? (
                            <div className="flex justify-end gap-5">
                              {isEditing ? (
                                <>
                                  <button onClick={saveEdit} className="text-emerald-500 text-[9px] font-black uppercase tracking-widest hover:text-emerald-400">{t.commit}</button>
                                  <button onClick={cancelEdit} className="text-slate-400 dark:text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-slate-600 dark:hover:text-white">{t.discard}</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => startEdit(tx)} className="text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all text-[9px] font-black uppercase tracking-widest hover:translate-y-[-1px]">{t.edit}</button>
                                  <button onClick={() => onDelete(tx.id)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all text-[9px] font-black uppercase tracking-widest hover:translate-y-[-1px]">{t.purge}</button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-white/5 italic">Unauthorized</span>
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
        
        {filteredTransactions.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-slate-200 dark:text-white/5 tracking-[1em] font-black text-4xl uppercase italic mb-4">Void Ledger</p>
            <p className="text-[10px] tracking-[0.4em] font-black text-slate-400 dark:text-white/10 uppercase">No historical entries detected within these parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

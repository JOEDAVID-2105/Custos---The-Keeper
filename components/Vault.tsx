
import React, { useState, useEffect } from 'react';
import { PAYMENT_METHODS } from '../constants';
import { Category, Transaction } from '../types';
import { SummaryDashboard } from './SummaryDashboard';
import { translations } from '../translations';
import { auth } from '../services/firebase';

interface VaultProps {
  onAdd: (tx: Transaction) => void;
  currencySymbol: string;
  transactions: Transaction[];
  language: 'en' | 'ta';
  categories: string[];
  onNavigateToEditLimits: () => void;
}

export const Vault: React.FC<VaultProps> = ({ onAdd, currencySymbol, transactions, language, categories, onNavigateToEditLimits }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'tracking' | 'denied' | 'ready'>('idle');
  const [successMsg, setSuccessMsg] = useState(false);

  const t = translations[language];

  useEffect(() => {
    if ("geolocation" in navigator) {
      setGeoStatus('tracking');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGeoStatus('ready');
        },
        (error) => {
          console.error("Location access denied", error);
          setGeoStatus('denied');
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleSeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount: Number(amount),
      type,
      note,
      category,
      paymentMethod: method,
      timestamp: Date.now(),
      userId: auth.currentUser?.uid || 'local-user',
      userName: auth.currentUser?.displayName || 'Local User',
      location: location ? { 
        ...location, 
        label: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` 
      } : undefined
    };

    onAdd(newTransaction);
    setAmount('');
    setNote('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  return (
    <div className="animate-in w-full max-w-3xl mx-auto pb-20 flex flex-col min-h-full">
      <form onSubmit={handleSeal} className="space-y-10 flex-grow">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black tracking-tighter uppercase text-slate-900 dark:text-white font-noto">{t.vault}</h2>
          <div className="flex items-center justify-center gap-3 mt-2">
            <p className="text-slate-800 dark:text-white/30 tracking-[0.4em] text-[9px] uppercase font-noto">{t.establishRecord}</p>
            <div className="h-px w-8 bg-slate-300 dark:bg-white/5"></div>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${geoStatus === 'ready' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : geoStatus === 'tracking' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`}></div>
              <p className="text-[8px] tracking-[0.2em] font-black uppercase text-slate-800 dark:text-white/20 font-noto">
                {geoStatus === 'ready' ? t.locLocked : geoStatus === 'tracking' ? t.trackingSignal : t.signalLost}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-slate-200 dark:bg-white/5 p-1 rounded-sm">
          <button 
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-4 text-[9px] tracking-[0.4em] font-black uppercase transition-all font-noto ${type === 'expense' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/20 hover:text-indigo-600'}`}
          >
            {t.expenditure}
          </button>
          <button 
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-4 text-[9px] tracking-[0.4em] font-black uppercase transition-all font-noto ${type === 'income' ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-white/20 hover:text-indigo-600'}`}
          >
            {t.income}
          </button>
        </div>

        <div className="relative group border-b border-slate-400 dark:border-white/10 focus-within:border-indigo-600 transition-all py-6">
          <label className="text-[8px] tracking-[0.5em] font-black text-slate-800 dark:text-white/20 uppercase block mb-2 font-noto">{t.magnitude}</label>
          <div className="flex items-center">
            <span className="text-2xl font-light text-slate-400 dark:text-white/10 mr-4 font-noto">{currencySymbol}</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-6xl font-black w-full outline-none placeholder:text-slate-200 dark:placeholder:text-white/5 tracking-tighter text-slate-900 dark:text-white font-noto"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[8px] tracking-[0.4em] font-black text-slate-800 dark:text-white/20 uppercase font-noto">{t.descriptor}</label>
          <input 
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none focus:border-indigo-600 transition-all text-sm font-light tracking-tight placeholder:text-slate-400/20 text-slate-900 dark:text-white font-noto"
            placeholder="..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[8px] tracking-[0.4em] font-black text-slate-800 dark:text-white/20 uppercase font-noto">{t.protocol}</label>
            <select 
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer uppercase tracking-widest text-xs font-bold text-slate-900 dark:text-white font-noto"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {(t.methods as any)[m] || m}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[8px] tracking-[0.4em] font-black text-slate-800 dark:text-white/20 uppercase font-noto">{t.category}</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent border-b border-slate-400 dark:border-white/10 py-3 outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer uppercase tracking-widest text-xs font-bold text-slate-900 dark:text-white font-noto"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {(t.categories as any)[cat] || cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button 
          type="submit"
          className={`w-full py-6 font-black text-sm tracking-[0.4em] transition-all uppercase rounded-sm font-noto ${successMsg ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-950 shadow-xl'}`}
        >
          {successMsg ? 'DISPATCHED' : t.sealTransfer}
        </button>
      </form>

      <div className="mt-20">
        <SummaryDashboard transactions={transactions} currencySymbol={currencySymbol} language={language} />
      </div>

      <div className="mt-12 pt-12 border-t border-slate-300 dark:border-white/5 flex flex-col items-center">
        <button 
          onClick={onNavigateToEditLimits}
          className="w-full py-5 border border-indigo-600/30 bg-indigo-600/[0.02] text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-indigo-600 hover:text-white transition-all font-noto shadow-lg"
        >
          {t.categoryAmountEdit}
        </button>
      </div>
    </div>
  );
};

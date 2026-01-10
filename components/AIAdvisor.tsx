
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { Transaction } from '../types';
import { translations } from '../translations';

interface AIAdvisorProps {
  transactions: Transaction[];
  currency: string;
  language: 'en' | 'ta';
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions, currency, language }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  const requestGuidance = async () => {
    if (transactions.length === 0) return;
    setLoading(true);
    const result = await GeminiService.analyzeFinances(transactions, currency, language);
    setAnalysis(result || "Consultation complete.");
    setLoading(false);
  };

  const downloadAsText = () => {
    if (!analysis) return;
    const header = `${t.ai.wealthReport}\n${new Date().toLocaleString()}\n--------------------------\n\n`;
    const blob = new Blob([header + analysis], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Custos_Wealth_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in w-full">
      <div className="mb-12">
        <h2 className="text-5xl font-black tracking-tighter uppercase">{t.advisor}</h2>
        <p className="text-slate-400 dark:text-white/40 tracking-widest text-xs mt-2 uppercase">{t.ai.intelligence}</p>
      </div>

      <div className="glass p-12 relative overflow-hidden">
        <div className="mb-8">
           <h3 className="text-2xl font-black tracking-tighter uppercase opacity-30 dark:opacity-20">{t.ai.digitalConsultation}</h3>
        </div>

        {!analysis && !loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-white/50 mb-8 max-w-md mx-auto tracking-wide font-light leading-relaxed font-noto">
              {t.ai.awaiting}
            </p>
            <button 
              onClick={requestGuidance}
              className="px-12 py-4 bg-indigo-600 text-white font-black tracking-[0.2em] uppercase hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-950 transition-all border border-indigo-600"
            >
              {t.requestConsultation}
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-12 h-12 border-2 border-slate-200 dark:border-white/10 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
            <p className="text-xs tracking-[0.5em] text-slate-400 dark:text-white/40 animate-pulse uppercase">{t.ai.analyzing}</p>
          </div>
        ) : (
          <div className="relative">
            <div className="prose prose-invert max-w-none font-noto">
              <div className="whitespace-pre-wrap font-light leading-relaxed text-slate-900 dark:text-white/90 text-lg">
                {analysis}
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-wrap gap-8">
              <button 
                onClick={downloadAsText}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-all border-b border-indigo-600/30 pb-1"
              >
                {t.ai.downloadTXT}
              </button>
              <button 
                onClick={() => setAnalysis(null)}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-white transition-all underline ml-auto"
              >
                {t.ai.close}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { translations } from '../translations';
import { StorageService } from '../services/storageService';
import { UserProfile } from '../types';

interface FeedbackProps {
  type: 'issue' | 'update';
  profile: UserProfile;
  onBack: () => void;
  language: 'en' | 'ta';
}

export const Feedback: React.FC<FeedbackProps> = ({ type, profile, onBack, language }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const t = translations[language];

  const wordCount = message.trim() === '' ? 0 : message.trim().split(/\s+/).length;
  const maxWords = 150;
  const isOverLimit = wordCount > maxWords;

  const handleSubmit = async () => {
    if (message.trim().length < 5 || isOverLimit) return;
    setIsSending(true);
    
    const webhookUrl = "https://discord.com/api/webhooks/1459843625830846681/2MlaruIukNi5owkl7eRAWjtgs-g3GW3o2i9xqz9AzWPfzosiTESz1xMIOrEtdRdg-NA4";
    
    try {
      // 1. Save to Firestore for archive
      await StorageService.saveFeedback(type, message, profile);
      
      // 2. Dispatch to Discord Webhook
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `System Feedback: ${type.toUpperCase()}`,
            description: message,
            color: type === 'issue' ? 0xF43F5E : 0x4F46E5,
            fields: [
              { name: "User", value: profile.displayName, inline: true },
              { name: "Currency", value: profile.currency, inline: true },
              { name: "Timestamp", value: new Date().toLocaleString(), inline: true }
            ],
            footer: { text: "Custos v3.1 Sovereign Protocol" }
          }]
        })
      });

      setSuccess(true);
      setTimeout(() => onBack(), 3000);
    } catch (error) {
      console.error("Feedback dispatch failed", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="animate-in w-full max-w-3xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase font-noto">
            {type === 'issue' ? t.reportIssue : t.suggestUpdate}
          </h2>
          <p className="text-slate-800 dark:text-white/30 tracking-[0.4em] text-[10px] mt-1 uppercase font-black">{t.feedbackTitle}</p>
        </div>
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg font-noto"
        >
          {t.profile.cancel}
        </button>
      </div>

      {success ? (
        <div className="p-20 bg-emerald-500/10 border border-emerald-500/20 text-center animate-in space-y-4">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-8 h-8">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-emerald-600 font-black tracking-widest uppercase text-xl">{t.messageSent}</p>
          <p className="text-[10px] text-emerald-600/60 uppercase tracking-widest font-noto">Returning to profile protocol...</p>
        </div>
      ) : (
        <div className="space-y-8 pt-12 border-t border-slate-300 dark:border-white/5">
          <div className="relative">
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-64 bg-slate-100 dark:bg-white/[0.03] border border-slate-300 dark:border-white/10 p-8 outline-none focus:border-indigo-600 transition-all text-lg font-light tracking-tight text-slate-900 dark:text-white placeholder:text-slate-400/20 font-noto resize-none"
              placeholder={t.messagePlaceholder}
            />
            <div className={`absolute bottom-6 right-6 text-[10px] font-black tracking-widest uppercase font-noto ${isOverLimit ? 'text-rose-600' : 'text-slate-400 dark:text-white/20'}`}>
              {maxWords - wordCount} {t.wordsRemaining}
            </div>
          </div>

          <button 
            disabled={isSending || isOverLimit || message.trim().length < 5}
            onClick={handleSubmit}
            className="w-full py-6 bg-indigo-600 text-white font-black text-sm tracking-[0.4em] hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-950 transition-all uppercase rounded-sm disabled:opacity-20 shadow-xl font-noto"
          >
            {isSending ? 'DISPATCHING...' : t.submitMessage}
          </button>
        </div>
      )}
    </div>
  );
};

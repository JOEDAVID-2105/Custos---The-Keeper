
import React from 'react';
import { translations } from '../translations';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  language: 'en' | 'ta';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  language
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 w-full max-w-md shadow-3xl p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2">
          <h3 className="text-xl font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white leading-tight">
            {title}
          </h3>
          <div className="h-0.5 w-12 bg-indigo-600"></div>
        </div>
        
        <p className="text-sm font-light leading-relaxed text-slate-600 dark:text-white/60 font-noto">
          {message}
        </p>

        <div className="flex flex-col gap-3 pt-4">
          <button 
            onClick={onConfirm}
            className="w-full py-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-700 transition-all shadow-xl font-noto"
          >
            {confirmLabel}
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-4 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-100 dark:hover:bg-white/5 transition-all font-noto"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

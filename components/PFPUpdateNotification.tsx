
import React from 'react';

interface PFPUpdateNotificationProps {
  onClose: () => void;
}

export const PFPUpdateNotification: React.FC<PFPUpdateNotificationProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center animate-in fade-in">
      <div className="bg-white text-slate-800 p-10 max-w-lg w-full text-center space-y-8 shadow-2xl relative">
        <h2 className="text-2xl font-black uppercase tracking-widest text-indigo-600">Portrait Archive Updated</h2>
        <p className="text-slate-600 leading-relaxed font-noto">We\'ve updated the portrait archives with new images and categories. Check them out!</p>
        <button 
          onClick={onClose}
          className="px-10 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all shadow-lg font-noto"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

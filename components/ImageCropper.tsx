
import React, { useState, useRef } from 'react';
import { translations } from '../translations';

interface ImageCropperProps {
  imageSrc: string;
  onConfirm: (croppedDataUrl: string) => void;
  onCancel: () => void;
  language: 'en' | 'ta';
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onConfirm, onCancel, language }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  const handleConfirm = () => {
    // In a world-class app, we'd use a canvas here to generate the final blob
    // For this prototype, we'll simulate the "seal" of the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        // Draw centered and scaled
        const drawSize = 400 * scale;
        const offsetX = (400 - drawSize) / 2 + position.x;
        const offsetY = (400 - drawSize) / 2 + position.y;
        ctx.fillStyle = 'white';
        ctx.fillRect(0,0,400,400);
        ctx.drawImage(img, offsetX, offsetY, drawSize, drawSize);
        onConfirm(canvas.toDataURL('image/jpeg', 0.9));
      }
    };
  };

  return (
    <div className="animate-in fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-2xl space-y-12">
        <div className="text-center">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Portrait Calibration</h2>
          <p className="text-white/30 tracking-[0.4em] text-[10px] mt-2 uppercase">Adjust scale and position for sovereignty</p>
        </div>

        <div 
          ref={containerRef}
          className="aspect-square w-full max-w-[400px] mx-auto overflow-hidden relative border border-white/10 bg-white/5 cursor-move"
        >
          <img 
            src={imageSrc} 
            alt="Calibration Target" 
            className="absolute transition-transform pointer-events-none max-w-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {/* Viewfinder overlay */}
          <div className="absolute inset-0 border-[40px] border-slate-950/80 pointer-events-none flex items-center justify-center">
             <div className="w-full h-full border border-indigo-500/50"></div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
              <span>Magnitude</span>
              <span>{Math.round(scale * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="3" 
              step="0.01" 
              value={scale} 
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-white/10 h-1 rounded-none appearance-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button 
              onClick={onCancel}
              className="py-5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
             >
               Discard
             </button>
             <button 
              onClick={handleConfirm}
              className="py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-2xl"
             >
               Seal Portrait
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

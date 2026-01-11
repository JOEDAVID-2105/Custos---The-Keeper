
import React from 'react';
import { ShieldBackgroundIcon } from '../constants';

interface InitialShieldProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const InitialShield: React.FC<InitialShieldProps> = ({ name, size = 'md' }) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-[8px]',
    md: 'w-10 h-10 text-[10px]',
    lg: 'w-32 h-32 text-2xl',
    xl: 'w-48 h-48 text-4xl'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} overflow-hidden`}>
      <ShieldBackgroundIcon className="absolute inset-0 text-indigo-600/10 dark:text-indigo-500/20 w-full h-full" />
      <span className="relative z-10 font-black tracking-widest text-indigo-600 dark:text-indigo-400">
        {initials}
      </span>
    </div>
  );
};

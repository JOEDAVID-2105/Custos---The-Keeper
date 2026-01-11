
import React from 'react';

export const COLORS = {
  slate: '#020617',
  indigo: '#4f46e5',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
};

export const DEFAULT_CATEGORIES: string[] = [
  'Housing', 'Food', 'Transport', 'Luxury', 'Wellness', 'Investment', 'Utility', 'Family', 'Income', 'Education', 'Subscriptions', 'Debt', 'Charity', 'Shopping', 'Travel', 'Healthcare', 'Gifts', 'Insurance', 'Savings', 'Taxes', 'Other'
];

export const PAYMENT_METHODS: string[] = [
  'Cash', 'Gpay', 'Netbanking', 'Cards'
];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
];

export const ShieldIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const TrashIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
  </svg>
);

export const ShieldBackgroundIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

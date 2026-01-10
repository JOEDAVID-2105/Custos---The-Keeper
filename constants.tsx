
import React from 'react';

export const COLORS = {
  slate: '#020617',
  indigo: '#4f46e5',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
};

export const CATEGORIES: string[] = [
  'Housing', 'Food', 'Transport', 'Luxury', 'Wellness', 'Investment', 'Utility', 'Family', 'Income', 'Other'
];

export const PAYMENT_METHODS: string[] = [
  'Cash', 'Gpay', 'Netbanking', 'Cards'
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'INR', symbol: '₹' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
];

export const COUNTRIES = [
  'United States', 'United Kingdom', 'India', 'Switzerland', 'Singapore', 'United Arab Emirates', 'Germany', 'France', 'Canada', 'Australia', 'Japan', 'Monaco', 'Luxembourg'
];

export const STATES_BY_COUNTRY: Record<string, string[]> = {
  'United States': ['California', 'New York', 'Texas', 'Florida', 'Illinois'],
  'United Kingdom': ['London', 'Manchester', 'Scotland', 'Wales'],
  'India': ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
  'Switzerland': ['Zurich', 'Geneva', 'Vaud'],
  'Monaco': ['Monte Carlo'],
};

export const CITIES_BY_STATE: Record<string, string[]> = {
  'California': ['Los Angeles', 'San Francisco', 'Beverly Hills', 'San Diego'],
  'New York': ['Manhattan', 'Brooklyn', 'Hamptons', 'Buffalo'],
  'London': ['Mayfair', 'Kensington', 'Chelsea', 'Westminster'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
  'Dubai': ['Downtown Dubai', 'Palm Jumeirah', 'Dubai Marina', 'Jumeirah'],
  'Zurich': ['Zurich City', 'Winterthur'],
  'Monte Carlo': ['Monte Carlo'],
};

export const ShieldIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

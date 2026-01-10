
export type Category = 'Housing' | 'Food' | 'Transport' | 'Luxury' | 'Wellness' | 'Investment' | 'Utility' | 'Family' | 'Income' | 'Other';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  note: string;
  category: Category;
  paymentMethod: string;
  timestamp: number;
  userId: string;
  userName?: string; // Track who made the transaction
  familyId?: string;
  location?: {
    lat: number;
    lng: number;
    label?: string;
  };
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  currency: string;
  country: string;
  state?: string;
  city?: string;
  familyId?: string;
  isCloudGuardian: boolean;
  theme: 'dark' | 'light';
  language: 'en' | 'ta';
}

export interface Budget {
  category: Category;
  limit: number;
  spent: number;
}

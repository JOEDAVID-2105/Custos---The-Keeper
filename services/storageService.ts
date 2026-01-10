
import { Transaction, UserProfile } from '../types';
import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  deleteDoc, 
  onSnapshot,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const LOCAL_STORAGE_KEY = 'custos_transactions';
const USER_PREFS_KEY = 'custos_user_prefs';

export class StorageService {
  // Local Storage Fallbacks
  static getLocalTransactions(): Transaction[] {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveLocalTransaction(transaction: Transaction) {
    const transactions = this.getLocalTransactions();
    transactions.push(transaction);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
  }

  static deleteLocalTransaction(id: string) {
    const transactions = this.getLocalTransactions().filter(t => t.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
  }

  static updateLocalTransaction(transaction: Transaction) {
    const transactions = this.getLocalTransactions().map(t => t.id === transaction.id ? transaction : t);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
  }

  static clearLocalTransactions() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  static getUserPrefs(): UserProfile | null {
    const data = localStorage.getItem(USER_PREFS_KEY);
    return data ? JSON.parse(data) : null;
  }

  static saveUserPrefs(prefs: UserProfile) {
    localStorage.setItem(USER_PREFS_KEY, JSON.stringify(prefs));
  }

  // Firestore Logic
  static async syncTransaction(transaction: Transaction) {
    if (!auth.currentUser) return;
    const ref = doc(db, 'transactions', transaction.id);
    await setDoc(ref, {
      ...transaction,
      userId: transaction.userId || auth.currentUser.uid,
      familyId: transaction.familyId || null
    });
  }

  static async updateTransaction(transaction: Transaction) {
    if (!auth.currentUser) return;
    const ref = doc(db, 'transactions', transaction.id);
    await updateDoc(ref, { ...transaction });
  }

  static async removeTransaction(id: string) {
    if (!auth.currentUser) return;
    await deleteDoc(doc(db, 'transactions', id));
  }

  static async saveProfile(profile: UserProfile) {
    if (!auth.currentUser) return;
    await setDoc(doc(db, 'users', auth.currentUser.uid), profile, { merge: true });
  }

  static async getProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  }

  static async joinFamily(familyId: string) {
    if (!auth.currentUser) return;
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { familyId });
  }

  static async leaveFamily() {
    if (!auth.currentUser) return;
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { familyId: null });
  }

  static async createFamily(name: string) {
    if (!auth.currentUser) return;
    const familyId = `FAM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    // Create family metadata document
    await setDoc(doc(db, 'families', familyId), {
      name: name || 'House Custos',
      creatorId: auth.currentUser.uid,
      createdAt: Date.now()
    });
    // Update user's familyId
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { familyId });
    return familyId;
  }

  static async updateFamilyName(familyId: string, name: string) {
    if (!auth.currentUser) return;
    const familyRef = doc(db, 'families', familyId);
    const snap = await getDoc(familyRef);
    if (snap.exists() && snap.data().creatorId === auth.currentUser.uid) {
      await updateDoc(familyRef, { name });
    }
  }

  static subscribeToFamilyMetadata(familyId: string, callback: (data: any) => void) {
    return onSnapshot(doc(db, 'families', familyId), (snap) => {
      if (snap.exists()) callback(snap.data());
    });
  }

  static subscribeToTransactions(uid: string, familyId: string | null | undefined, callback: (txs: Transaction[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = (familyId && familyId !== null)
      ? query(collection(db, 'transactions'), where('familyId', '==', familyId))
      : query(collection(db, 'transactions'), where('userId', '==', uid));

    return onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      callback(txs);
    });
  }
}

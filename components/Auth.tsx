
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";
import { auth } from '../services/firebase';
import { StorageService } from '../services/storageService';
import { translations } from '../translations';

interface AuthProps {
  onSuccess: () => void;
  language?: 'en' | 'ta';
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, language = 'en' }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const t = translations[language].auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        onSuccess();
      } else if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        
        // Initialize user record in Firestore
        // Added type assertion for language to fix 'string' not assignable to 'en' | 'ta'
        await StorageService.saveProfile({
          uid: cred.user.uid,
          displayName: name,
          email: email,
          currency: 'USD',
          country: 'US',
          isCloudGuardian: true,
          theme: 'dark',
          language: language as 'en' | 'ta'
        });
        
        onSuccess();
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setMessage(t.resetSent);
      }
    } catch (err: any) {
      setError(err.message || t.denied);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    setMode('login');
    setError('');
    setMessage('');
  };

  return (
    <div className="animate-in max-w-md mx-auto py-20 px-6">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase">
          {mode === 'forgot' ? t.resetTitle : t.title}
        </h2>
        <p className="text-[10px] tracking-[0.4em] text-white/40 uppercase font-noto">
          {mode === 'forgot' ? t.resetSubtitle : t.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'signup' && (
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest text-white/40 uppercase font-noto">{t.fullName}</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-transparent border border-white/10 p-4 focus:border-indigo-500 outline-none transition-all font-noto"
              placeholder="..."
              required
            />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-[10px] tracking-widest text-white/40 uppercase font-noto">{t.email}</label>
          <input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-transparent border border-white/10 p-4 focus:border-indigo-500 outline-none transition-all font-noto"
            placeholder="..."
            required
          />
        </div>
        {mode !== 'forgot' && (
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest text-white/40 uppercase font-noto">{t.password}</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border border-white/10 p-4 focus:border-indigo-500 outline-none transition-all font-noto"
              placeholder="••••••••"
              required
            />
            {mode === 'login' && (
              <button 
                type="button"
                onClick={() => setMode('forgot')}
                className="text-[9px] tracking-widest text-indigo-500 hover:text-indigo-400 uppercase font-bold pt-1 font-noto"
              >
                {t.forgotPassword}
              </button>
            )}
          </div>
        )}

        {error && <p className="text-rose-500 text-[10px] tracking-widest uppercase font-bold text-center font-noto">{error}</p>}
        {message && <p className="text-emerald-500 text-[10px] tracking-widest uppercase font-bold text-center font-noto">{message}</p>}

        <button 
          disabled={loading}
          type="submit"
          className="w-full py-5 bg-white text-slate-950 font-black tracking-[0.2em] text-sm uppercase hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50 font-noto"
        >
          {loading ? t.processing : mode === 'login' ? t.authenticate : mode === 'signup' ? t.establish : t.sendReset}
        </button>
      </form>

      <div className="mt-8 space-y-4 text-center">
        {mode === 'login' && (
          <button 
            onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
            className="w-full text-[10px] tracking-widest text-white/30 hover:text-white transition-all uppercase font-bold font-noto"
          >
            {t.newGuardianship}
          </button>
        )}
        {(mode === 'signup' || mode === 'forgot') && (
          <button 
            onClick={handleReturn}
            className="w-full text-[10px] tracking-widest text-white/30 hover:text-white transition-all uppercase font-bold font-noto"
          >
            {t.returnAuth}
          </button>
        )}
      </div>
    </div>
  );
};

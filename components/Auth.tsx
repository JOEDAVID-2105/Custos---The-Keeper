
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
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

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if profile exists, if not create one
      const existingProfile = await StorageService.getProfile(user.uid);
      if (!existingProfile) {
        await StorageService.saveProfile({
          uid: user.uid,
          displayName: user.displayName || 'The Guardian',
          email: user.email || '',
          currency: 'USD',
          country: 'US',
          isCloudGuardian: true,
          theme: 'dark',
          language: language as 'en' | 'ta'
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || t.denied);
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase text-slate-900 dark:text-white">
          {mode === 'forgot' ? t.resetTitle : t.title}
        </h2>
        <p className="text-[10px] tracking-[0.4em] text-slate-400 dark:text-white/40 uppercase font-noto">
          {mode === 'forgot' ? t.resetSubtitle : t.subtitle}
        </p>
      </div>

      <div className="space-y-6">
        {mode !== 'forgot' && (
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 py-4 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black tracking-[0.2em] text-[10px] uppercase hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-950 transition-all font-noto"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t.googleSignIn}
          </button>
        )}

        {mode !== 'forgot' && (
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
            <span className="text-[8px] font-black text-slate-300 dark:text-white/10 uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest text-slate-400 dark:text-white/40 uppercase font-noto">{t.fullName}</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-transparent border border-slate-200 dark:border-white/10 p-4 focus:border-indigo-500 outline-none transition-all font-noto text-slate-900 dark:text-white"
                placeholder="..."
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest text-slate-400 dark:text-white/40 uppercase font-noto">{t.email}</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-100 dark:bg-transparent border border-slate-200 dark:border-white/10 p-4 focus:border-indigo-500 outline-none transition-all font-noto text-slate-900 dark:text-white"
              placeholder="..."
              required
            />
          </div>
          {mode !== 'forgot' && (
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest text-slate-400 dark:text-white/40 uppercase font-noto">{t.password}</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-100 dark:bg-transparent border border-slate-200 dark:border-white/10 p-4 focus:border-indigo-500 outline-none transition-all font-noto text-slate-900 dark:text-white"
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
            className="w-full py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black tracking-[0.2em] text-sm uppercase hover:bg-indigo-500 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white transition-all disabled:opacity-50 font-noto"
          >
            {loading ? t.processing : mode === 'login' ? t.authenticate : mode === 'signup' ? t.establish : t.sendReset}
          </button>
        </form>
      </div>

      <div className="mt-8 space-y-4 text-center">
        {mode === 'login' && (
          <button 
            onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
            className="w-full text-[10px] tracking-widest text-slate-500 dark:text-white/30 hover:text-slate-900 dark:hover:text-white transition-all uppercase font-bold font-noto"
          >
            {t.newGuardianship}
          </button>
        )}
        {(mode === 'signup' || mode === 'forgot') && (
          <button 
            onClick={handleReturn}
            className="w-full text-[10px] tracking-widest text-slate-500 dark:text-white/30 hover:text-slate-900 dark:hover:text-white transition-all uppercase font-bold font-noto"
          >
            {t.returnAuth}
          </button>
        )}
      </div>
    </div>
  );
};

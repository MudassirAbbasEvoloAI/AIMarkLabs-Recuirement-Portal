'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import s from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/portal/leads');
    });
  }, [router]);

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.replace('/portal/leads');
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logoWrap}>
          <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 0 220 52" fill="none">
            <circle cx="22" cy="30" r="14" stroke="#13193a" strokeWidth="5.5" fill="none"/>
            <circle cx="29" cy="10" r="5.5" fill="#f47a20"/>
            <text x="46" y="30" fontFamily="Syne,sans-serif" fontWeight="800" fontSize="22" fill="#13193a">Mark</text>
            <text x="46" y="49" fontFamily="Syne,sans-serif" fontWeight="800" fontSize="18" fill="#f47a20">Labs</text>
          </svg>
        </div>

        <h1 className={s.title}>Portal Login</h1>
        <p className={s.sub}>Sign in to access the admin portal</p>

        <form className={s.form} onSubmit={onSubmit} noValidate>
          <div className={s.fg}>
            <label className={s.lbl}>Email</label>
            <input className={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@aimarklabs.com" required />
          </div>
          <div className={s.fg}>
            <label className={s.lbl}>Password</label>
            <input className={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className={s.error}>⚠ {error}</div>}
          <button className={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import s from './page.module.css';

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [saving,      setSaving]      = useState(false);
  const [success,     setSuccess]     = useState('');
  const [error,       setError]       = useState('');

  const onSubmit = async e => {
    e.preventDefault();
    if (newPassword !== confirm) return setError('Passwords do not match.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    setSaving(true);
    setError('');
    setSuccess('');
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSuccess('Password updated successfully.');
    setNewPassword('');
    setConfirm('');
  };

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <h1 className={s.title}>Settings <span>/ Account</span></h1>
        <p className={s.sub}>Manage your portal account</p>
      </div>

      <div className={s.content}>
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Change Password</h2>
          <form className={s.form} onSubmit={onSubmit} noValidate>
            <div className={s.fg}>
              <label className={s.lbl}>New Password</label>
              <input className={s.input} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" required />
            </div>
            <div className={s.fg}>
              <label className={s.lbl}>Confirm New Password</label>
              <input className={s.input} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" required />
            </div>
            {error   && <div className={s.error}>⚠ {error}</div>}
            {success && <div className={s.success}>✓ {success}</div>}
            <button className={s.btn} type="submit" disabled={saving}>
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

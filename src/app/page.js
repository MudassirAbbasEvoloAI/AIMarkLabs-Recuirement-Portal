'use client';
import { useState } from 'react';
import Link from 'next/link';
import s from './page.module.css';

const BENEFITS = [
  { label: 'Salary', value: 'Competitive Package' },
  { label: 'Visa', value: 'Assistance Provided' },
  { label: 'Work Mode', value: 'Remote / Hybrid' },
];
const ROLES = [
  { name: 'Technology & IT', meta: 'Software · DevOps · AI/ML · Cloud · Remote/Hybrid · Gulf Region' },
  { name: 'Finance & Banking', meta: 'Analysts · Investment · Accounting · Remote/Hybrid · Gulf Region' },
  { name: 'Engineering', meta: 'Civil · Mechanical · Electrical · Remote/Hybrid · Gulf Region' },
  { name: 'HR & Operations', meta: 'Talent Acquisition · HR Managers · Ops · Remote/Hybrid · Gulf Region' },
  { name: 'Oil & Gas · Healthcare · Logistics', meta: 'All Specializations · Remote/Hybrid · Gulf Region' },
];

export default function HomePage() {
  const [form, setForm]         = useState({ name:'', email:'', phone:'', details:'' });
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState('');

  const onChange = e => { setForm({...form, [e.target.name]: e.target.value}); setError(''); };

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.name) return setError('Please enter your name.');
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Please enter a valid email.');
    if (!form.phone) return setError('Please enter your phone number.');
    if (!form.details) return setError('Please describe your hiring needs.');
    setLoading(true);
    try {
      const res = await fetch('/api/leads', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...form, source:'website'}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (e) { setError(e.message || 'Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className={s.wrap}>
      {/* HERO */}
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.tagsRow}>
            <span className={`${s.tag} ${s.tagNavy}`}>UAE</span>
            <span className={`${s.tag} ${s.tagNavy}`}>Gulf Region</span>
            <span className={`${s.tag} ${s.tagOrange}`}>Competitive Package</span>
          </div>
          <p className={s.eyebrow}>Scale Your Team Across the Middle East</p>
          <h1 className={s.h1}>Build Smarter,<br /><em>Hire Faster.</em></h1>
          <div className={s.divider} />
          <p className={s.meta}>Remote · Onsite · Any Role · Any Industry · Gulf Region</p>
          <p className={s.desc}>
            We connect <strong>Gulf-region companies &amp; recruiters</strong> with top pre-vetted talent —
            whether building a <strong>remote workforce</strong> or hiring <strong>onsite in the Middle East.</strong>
          </p>
          <div className={s.benefits}>
            {BENEFITS.map(b => (
              <div key={b.label} className={s.benefit}>
                <div className={s.benefitLabel}>{b.label}</div>
                <div className={s.benefitVal}>{b.value}</div>
              </div>
            ))}
          </div>
          <div className={s.heroActions}>
            <a href="#lead-form" className={s.btnPrimary}>Get Started →</a>
          </div>
        </div>
      </section>

      {/* ROLES + FORM */}
      <section className={s.main}>
        <div className={s.mainInner}>
          {/* Roles */}
          <div className={s.roles}>
            <div className={s.sectionLabel}>Open Positions</div>
            <h2 className={s.rolesTitle}>Roles We&apos;re<br />Actively Hiring</h2>
            <div className={s.roleList}>
              {ROLES.map((r,i) => (
                <div key={i} className={s.roleItem}>
                  <div className={s.roleName}>{r.name}</div>
                  <div className={s.roleMeta}>{r.meta}</div>
                </div>
              ))}
              <div className={`${s.roleItem} ${s.roleCta}`}>
                <div className={s.roleName}>Actively Hiring · Across All Industries</div>
                <div className={s.roleMeta}>Gulf Region · Remote &amp; Hybrid · Experienced Professionals</div>
              </div>
            </div>
          </div>

          {/* Lead Form */}
          <div className={s.formSide} id="lead-form">
            <h2 className={s.formTitle}>Get Started</h2>
            <p className={s.formSub}>Tell us your hiring needs and we&apos;ll set up your recruitment portal within 48 hours.</p>
            <div className={s.card}>
              {submitted ? (
                <div className={s.success}>
                  <div className={s.successIcon}>✓</div>
                  <h3>We&apos;ll Be in Touch!</h3>
                  <p>Thank you, <strong>{form.name}</strong>! Our team will reach out at <strong>{form.email}</strong> within 48 hours.</p>
                  <div className={s.successActions}>
                    <button className={s.btnGhost} onClick={() => { setSubmitted(false); setForm({name:'',email:'',phone:'',details:''}); }}>Submit Another</button>
                    <Link href="/careers" className={s.btnFill}>View Positions →</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  {['name','email','phone'].map(f => (
                    <div key={f} className={s.fg}>
                      <label className={s.lbl}>{f.charAt(0).toUpperCase()+f.slice(1)} <span className={s.req}>*</span></label>
                      <input className={s.input} type={f==='email'?'email':f==='phone'?'tel':'text'} name={f}
                        placeholder={f==='name'?'Sarah Al Mansouri':f==='email'?'sarah@yourcompany.com':'+971 50 000 0000'}
                        value={form[f]} onChange={onChange} required />
                    </div>
                  ))}
                  <div className={s.fg}>
                    <label className={s.lbl}>Details <span className={s.req}>*</span></label>
                    <textarea className={s.textarea} name="details" placeholder="Tell us about your hiring needs, roles, timeline…" value={form.details} onChange={onChange} required />
                  </div>
                  {error && <div className={s.error}>⚠️ {error}</div>}
                  <div className={s.notice}><span>📬</span><span>We will reach out to you within <strong>48 hours</strong>.</span></div>
                  <button type="submit" className={s.submit} disabled={loading}>
                    {loading ? <><span className="spinner" style={{marginRight:8}}/> Sending…</> : 'Book a Free Consultation →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={s.footer}>
        <div>
          <div className={s.footerLabel}>Get In Touch</div>
          <div className={s.footerEmail}>areeba@aimarklabs.com</div>
          <div className={s.footerNote}>www.aimarklabs.com</div>
        </div>
        <Link href="/careers" className={s.footerBtn}>VIEW OPEN POSITIONS<br/><span>Join Our Network</span></Link>
      </footer>
    </div>
  );
}

'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import s from './page.module.css';

function ApplyForm() {
  const params   = useSearchParams();
  const router   = useRouter();
  const posId    = params.get('positionId') || '';
  const posTitle = params.get('title') ? decodeURIComponent(params.get('title')) : '';

  const [form, setForm] = useState({
    name:'', email:'', phone:'', experience:'', currentRole:'', details:'',
    positionId: posId, positionTitle: posTitle,
  });
  const [resume, setResume]     = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState('');
  const fileRef = useRef();

  const onChange = e => { setForm({...form, [e.target.name]: e.target.value}); setError(''); };

  const handleFile = file => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf','doc','docx'].includes(ext)) { setError('Only PDF, DOC, DOCX allowed.'); return; }
    if (file.size > 5*1024*1024) { setError('File must be under 5MB.'); return; }
    setResume(file); setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.name)  return setError('Please enter your name.');
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Please enter a valid email.');
    if (!form.phone) return setError('Please enter your phone number.');
    if (!form.positionId) return setError('Please select a position first.');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      if (resume) fd.append('resume', resume);
      const res = await fetch('/api/applications', { method:'POST', body:fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch(err) { setError(err.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  if (submitted) return (
    <div className={s.successWrap}>
      <div className={s.successCard}>
        <div className={s.successIcon}>✓</div>
        <h2>Application Submitted!</h2>
        <p>Thank you, <strong>{form.name}</strong>! We&apos;ve received your application for <strong>{form.positionTitle}</strong>. Our team will be in touch at <strong>{form.email}</strong> soon.</p>
        <div className={s.successActions}>
          <Link href="/careers" className={s.btnOutline}>View More Positions</Link>
          <button className={s.btnFill} onClick={()=>{ setSubmitted(false); setForm({name:'',email:'',phone:'',experience:'',currentRole:'',details:'',positionId:posId,positionTitle:posTitle}); setResume(null); }}>Submit Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <Link href="/careers" className={s.backLink}>← Back to Positions</Link>
        <div className={s.headerInner}>
          <p className={s.eyebrow}>Apply Now</p>
          <h1 className={s.h1}>{posTitle || 'Submit Your Application'}</h1>
          <p className={s.sub}>Fill in your details below. We review every application carefully.</p>
        </div>
      </div>

      <div className={s.formWrap}>
        <div className={s.card}>
          <form onSubmit={onSubmit} noValidate>

            {/* Position info banner */}
            {posTitle && (
              <div className={s.positionBanner}>
                <span className={s.positionLabel}>Applying for:</span>
                <span className={s.positionName}>{posTitle}</span>
              </div>
            )}

            <div className={s.grid2}>
              <div className={s.fg}>
                <label className={s.lbl}>Full Name <span className={s.req}>*</span></label>
                <input className={s.input} type="text" name="name" placeholder="Ahmed Al Rashidi" value={form.name} onChange={onChange} required />
              </div>
              <div className={s.fg}>
                <label className={s.lbl}>Email Address <span className={s.req}>*</span></label>
                <input className={s.input} type="email" name="email" placeholder="ahmed@example.com" value={form.email} onChange={onChange} required />
              </div>
              <div className={s.fg}>
                <label className={s.lbl}>Phone Number <span className={s.req}>*</span></label>
                <input className={s.input} type="tel" name="phone" placeholder="+971 50 000 0000" value={form.phone} onChange={onChange} required />
              </div>
              <div className={s.fg}>
                <label className={s.lbl}>Years of Experience</label>
                <input className={s.input} type="text" name="experience" placeholder="e.g. 5 years" value={form.experience} onChange={onChange} />
              </div>
              <div className={`${s.fg} ${s.full}`}>
                <label className={s.lbl}>Current / Most Recent Role</label>
                <input className={s.input} type="text" name="currentRole" placeholder="e.g. Senior Software Engineer at XYZ" value={form.currentRole} onChange={onChange} />
              </div>
              <div className={`${s.fg} ${s.full}`}>
                <label className={s.lbl}>Tell Us About Yourself</label>
                <textarea className={s.textarea} name="details" placeholder="Share your key skills, achievements, why you're a great fit…" value={form.details} onChange={onChange} />
              </div>

              {/* Resume Upload */}
              <div className={`${s.fg} ${s.full}`}>
                <label className={s.lbl}>Resume / CV <span className={s.optional}>(optional)</span></label>
                {resume ? (
                  <div className={s.fileChosen}>
                    <span>📄</span>
                    <span className={s.fileName}>{resume.name}</span>
                    <button type="button" className={s.fileRemove} onClick={()=>setResume(null)}>×</button>
                  </div>
                ) : (
                  <div
                    className={`${s.dropZone} ${dragOver?s.dragOver:''}`}
                    onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                    onDragLeave={()=>setDragOver(false)}
                    onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0])}}
                    onClick={()=>fileRef.current?.click()}
                  >
                    <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={e=>handleFile(e.target.files[0])} style={{display:'none'}} />
                    <div className={s.dropIcon}>📎</div>
                    <div className={s.dropText}><strong>Click to upload</strong> or drag &amp; drop</div>
                    <div className={s.dropHint}>PDF, DOC, DOCX · Max 5MB</div>
                  </div>
                )}
              </div>
            </div>

            {error && <div className={s.error}>⚠️ {error}</div>}

            <div className={s.notice}>
              <span>📬</span>
              <span>We will reach out to you within <strong>48 hours</strong> after reviewing your application.</span>
            </div>

            <button type="submit" className={s.submit} disabled={loading}>
              {loading ? <><span className="spinner" style={{marginRight:8}} />Submitting…</> : 'Submit Application →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return <Suspense fallback={<div style={{padding:'4rem',textAlign:'center',color:'#888'}}>Loading…</div>}><ApplyForm /></Suspense>;
}

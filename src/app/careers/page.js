'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import s from './page.module.css';

const EMPTY_FORM = {
  name: '', phone: '', email: '',
  address: '', city: '', cnic: '', age: '',
  experience: '', details: '',
  positionId: '', positionTitle: '',
};

function CareersForm() {
  const params   = useSearchParams();
  const posId    = params.get('positionId') || '';
  const posTitle = params.get('title') ? decodeURIComponent(params.get('title')) : '';

  const [positions, setPositions]   = useState([]);
  const [loadingPos, setLoadingPos] = useState(true);
  const [form, setForm]             = useState({ ...EMPTY_FORM, positionId: posId, positionTitle: posTitle });
  const [loading, setLoading]       = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    fetch('/api/positions')
      .then(r => r.json())
      .then(d => { setPositions(d.positions || []); setLoadingPos(false); })
      .catch(() => setLoadingPos(false));
  }, []);

  const onChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  };

  const onPositionChange = e => {
    const id = e.target.value;
    if (!id) { setForm(f => ({ ...f, positionId: '', positionTitle: '' })); return; }
    const pos = positions.find(p => p._id === id);
    setForm(f => ({ ...f, positionId: id, positionTitle: pos?.title || '' }));
    setError('');
  };

  const validate = () => {
    if (!form.name.trim())    return 'Please enter your full name. / براہ کرم اپنا پورا نام درج کریں۔';
    if (!form.phone.trim())   return 'Please enter your phone number. / براہ کرم فون نمبر درج کریں۔';
    if (!form.address.trim()) return 'Please enter your address. / براہ کرم اپنا پتہ درج کریں۔';
    if (!form.city.trim())    return 'Please enter your city. / براہ کرم اپنا شہر درج کریں۔';
    if (!form.positionId)     return 'Please select a position. / براہ کرم آسامی منتخب کریں۔';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email. / درست ای میل درج کریں۔';
    return null;
  };

  const onSubmit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setLoading(true);
    try {
      const extraLines = [];
      if (form.address)  extraLines.push(`Address: ${form.address}`);
      if (form.city)     extraLines.push(`City: ${form.city}`);
      if (form.cnic)     extraLines.push(`CNIC: ${form.cnic}`);
      if (form.age)      extraLines.push(`Age: ${form.age}`);
      const combinedDetails = [extraLines.join('\n'), form.details].filter(Boolean).join('\n\n');

      const fd = new FormData();
      fd.append('name',          form.name);
      fd.append('phone',         form.phone);
      fd.append('email',         form.email || '');
      fd.append('positionId',    form.positionId);
      fd.append('positionTitle', form.positionTitle);
      fd.append('experience',    form.experience);
      fd.append('currentRole',   '');
      fd.append('details',       combinedDetails);

      const res  = await fetch('/api/applications', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again. / دوبارہ کوشش کریں۔');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({ ...EMPTY_FORM, positionId: '', positionTitle: '' });
    setError('');
  };

  if (submitted) return (
    <div className={s.successWrap}>
      <div className={s.successCard}>
        <div className={s.successIcon}>✓</div>
        <h2>Application Submitted!<span className={s.successUrdu}>درخواست جمع ہو گئی!</span></h2>
        <p>
          Thank you, <strong>{form.name}</strong>! We&apos;ve received your application for <strong>{form.positionTitle}</strong>.
          <span className={s.successUrduText}>
            شکریہ، <strong>{form.name}</strong>! آپ کی درخواست موصول ہو گئی۔ ہماری ٹیم جلد آپ سے رابطہ کرے گی۔
          </span>
        </p>
        <div className={s.successActions}>
          <button className={s.btnFill} onClick={resetForm}>
            Submit Another / ایک اور درخواست
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={s.wrap}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.headerInner}>
          <p className={s.eyebrow}>
            Apply for a Job &nbsp;|&nbsp;
            <span className={s.eyebrowUr}>ملازمت کے لیے درخواست دیں</span>
          </p>
          <h1 className={s.h1}>
            Submit Your Application
            <span className={s.h1Ur}> — اپنی درخواست جمع کریں</span>
          </h1>
          <p className={s.sub}>
            Fill in your details below. We review every application carefully.
            <span className={s.subUr}>نیچے اپنی تفصیلات بھریں۔ ہم ہر درخواست کا بغور جائزہ لیتے ہیں۔</span>
          </p>
        </div>
      </div>

      <div className={s.formWrap}>
        <div className={s.card}>
          <form onSubmit={onSubmit} noValidate>

            {/* ── Job Position Dropdown ── */}
            <div className={s.sectionHead}>
              <span>Select Job Position</span>
              <span className={s.sectionHeadUr}>آسامی منتخب کریں</span>
              <span className={s.req}>*</span>
            </div>

            {loadingPos ? (
              <div className={s.loadingPos}>Loading positions… / آسامیاں لوڈ ہو رہی ہیں</div>
            ) : (
              <select className={s.posSelect} value={form.positionId} onChange={onPositionChange}>
                <option value="">— Choose a position / آسامی منتخب کریں —</option>
                {positions.map(p => (
                  <option key={p._id} value={p._id}>{p.title} — {p.location}</option>
                ))}
              </select>
            )}

            {form.positionTitle && (
              <div className={s.positionBanner}>
                <span className={s.positionLabel}>Applying for / درخواست:</span>
                <span className={s.positionName}>{form.positionTitle}</span>
              </div>
            )}

            <div className={s.divider} />

            {/* ── Personal Details ── */}
            <div className={s.grid2}>

              <div className={s.fg}>
                <label className={s.lbl}>
                  Full Name <span className={s.lblUr}>/ پورا نام</span> <span className={s.req}>*</span>
                </label>
                <input className={s.input} type="text" name="name"
                  placeholder="e.g. Muhammad Ali / محمد علی"
                  value={form.name} onChange={onChange} required />
              </div>

              <div className={s.fg}>
                <label className={s.lbl}>
                  Phone Number <span className={s.lblUr}>/ فون نمبر</span> <span className={s.req}>*</span>
                </label>
                <input className={s.input} type="tel" name="phone"
                  placeholder="+92 300 000 0000"
                  value={form.phone} onChange={onChange} required />
              </div>

              <div className={`${s.fg} ${s.full}`}>
                <label className={s.lbl}>
                  Home Address <span className={s.lblUr}>/ گھر کا پتہ</span> <span className={s.req}>*</span>
                </label>
                <input className={s.input} type="text" name="address"
                  placeholder="House no., Street, Area / گھر نمبر، گلی، علاقہ"
                  value={form.address} onChange={onChange} required />
              </div>

              <div className={s.fg}>
                <label className={s.lbl}>
                  City <span className={s.lblUr}>/ شہر</span> <span className={s.req}>*</span>
                </label>
                <input className={s.input} type="text" name="city"
                  placeholder="e.g. Karachi / کراچی"
                  value={form.city} onChange={onChange} required />
              </div>

              <div className={s.fg}>
                <label className={s.lbl}>
                  CNIC <span className={s.lblUr}>/ شناختی کارڈ</span>
                  <span className={s.optional}> (optional)</span>
                </label>
                <input className={s.input} type="text" name="cnic"
                  placeholder="42101-1234567-1"
                  value={form.cnic} onChange={onChange} />
              </div>

              <div className={s.fg}>
                <label className={s.lbl}>
                  Age <span className={s.lblUr}>/ عمر</span>
                  <span className={s.optional}> (optional)</span>
                </label>
                <input className={s.input} type="number" name="age" min="16" max="70"
                  placeholder="e.g. 28"
                  value={form.age} onChange={onChange} />
              </div>

              <div className={s.fg}>
                <label className={s.lbl}>
                  Email <span className={s.lblUr}>/ ای میل</span>
                  <span className={s.optional}> (optional)</span>
                </label>
                <input className={s.input} type="email" name="email"
                  placeholder="example@email.com"
                  value={form.email} onChange={onChange} />
              </div>

              <div className={s.fg}>
                <label className={s.lbl}>
                  Experience <span className={s.lblUr}>/ تجربہ</span>
                  <span className={s.optional}> (optional)</span>
                </label>
                <input className={s.input} type="text" name="experience"
                  placeholder="e.g. 3 years / 3 سال"
                  value={form.experience} onChange={onChange} />
              </div>

              <div className={`${s.fg} ${s.full}`}>
                <label className={s.lbl}>
                  About You <span className={s.lblUr}>/ اپنے بارے میں</span>
                </label>
                <textarea className={s.textarea} name="details"
                  placeholder="Describe your skills and previous work… / اپنی مہارت اور پرانے کام کے بارے میں لکھیں…"
                  value={form.details} onChange={onChange} />
              </div>

            </div>

            {error && <div className={s.error}>⚠️ {error}</div>}

            <div className={s.notice}>
              <span>📬</span>
              <span>
                We will contact you within <strong>48 hours</strong>.&nbsp;
                <span className={s.noticeUr}>ہم 48 گھنٹوں کے اندر آپ سے رابطہ کریں گے۔</span>
              </span>
            </div>

            <button type="submit" className={s.submit} disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ marginRight: 8 }} />Submitting… / جمع ہو رہا ہے</>
                : 'Submit Application / درخواست جمع کریں →'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default function CareersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>Loading…</div>}>
      <CareersForm />
    </Suspense>
  );
}

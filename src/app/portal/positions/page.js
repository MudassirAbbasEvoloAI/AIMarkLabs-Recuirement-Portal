'use client';
import { useState, useEffect, useCallback } from 'react';
import s from './page.module.css';

const DEPTS = ['Technology & IT','Finance & Banking','Engineering','HR & Operations','Oil & Gas','Healthcare','Logistics'];
const TYPES = ['Remote','Onsite','Remote/Hybrid'];

const EMPTY = { title:'', department:'Technology & IT', location:'', type:'Remote/Hybrid', experience:'', description:'', requirements:'', salary:'Competitive' };

function timeAgo(d) {
  const diff=Date.now()-new Date(d), day=Math.floor(diff/86400000), hr=Math.floor(diff/3600000);
  return day>0?`${day}d ago`:hr>0?`${hr}h ago`:'Just now';
}

export default function PortalPositionsPage() {
  const [positions, setPositions]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);
  const [error, setError]           = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/positions/all');
      const d   = await res.json();
      setPositions(d.positions || []);
    } catch { setPositions([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setError(''); setShowForm(true); };
  const openEdit = p => {
    setEditing(p._id);
    setForm({ ...p, requirements: Array.isArray(p.requirements) ? p.requirements.join(', ') : p.requirements || '' });
    setError('');
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setError(''); };

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.location || !form.experience || !form.description)
      return setError('Please fill in all required fields.');

    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        requirements: form.requirements
          ? form.requirements.split(',').map(r => r.trim()).filter(Boolean)
          : [],
      };

      const url    = editing ? `/api/positions/${editing}` : '/api/positions';
      const method = editing ? 'PATCH' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      if (editing) {
        setPositions(prev => prev.map(p => p._id === editing ? data.position : p));
      } else {
        setPositions(prev => [data.position, ...prev]);
      }
      closeForm();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id, active) => {
    setPositions(prev => prev.map(p => p._id === id ? { ...p, active: !active } : p));
    await fetch(`/api/positions/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    }).catch(() => {});
  };

  const deletePosition = async id => {
    setPositions(prev => prev.filter(p => p._id !== id));
    setDelConfirm(null);
    await fetch(`/api/positions/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const stats = {
    total:  positions.length,
    active: positions.filter(p => p.active).length,
  };

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Positions <span>Dashboard</span></h1>
          <p className={s.sub}>Manage all open job positions</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.refresh} onClick={load}>↻ Refresh</button>
          <button className={s.btnAdd} onClick={openAdd}>+ Add Position</button>
        </div>
      </div>

      <div className={s.stats}>
        {[['Total', stats.total, 'orange'], ['Active', stats.active, 'green'], ['Inactive', stats.total - stats.active, 'blue']].map(([l,v,c]) => (
          <div key={l} className={s.statCard}><div className={s.statLabel}>{l}</div><div className={`${s.statVal} ${s[c]}`}>{v}</div></div>
        ))}
      </div>

      <div className={s.content}>
        {loading ? (
          <div className={s.loading}><span className="spinner spinner-dark" />Loading positions…</div>
        ) : positions.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>📋</div>
            <div className={s.emptyTitle}>No positions yet</div>
            <div className={s.emptySub}>Click "Add Position" to create your first opening.</div>
            <button className={s.btnAdd} style={{marginTop:'1.2rem'}} onClick={openAdd}>+ Add Position</button>
          </div>
        ) : (
          <>
            <div className={s.count}>Showing <strong>{positions.length}</strong> position{positions.length !== 1 ? 's' : ''}</div>
            <div className={s.grid}>
              {positions.map((p, i) => (
                <div key={p._id} className={`${s.card} ${!p.active ? s.cardInactive : ''}`} style={{ animationDelay: `${i * .05}s` }}>
                  <div className={s.cardTop}>
                    <div>
                      <div className={s.cardDept}>{p.department}</div>
                      <h3 className={s.cardTitle}>{p.title}</h3>
                    </div>
                    <span className={`${s.badge} ${p.active ? s.badgeActive : s.badgeInactive}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className={s.cardMeta}>
                    <span>📍 {p.location}</span>
                    <span>⏱ {p.experience}</span>
                    <span>🏢 {p.type}</span>
                  </div>

                  <p className={s.cardDesc}>{p.description?.slice(0, 110)}{p.description?.length > 110 ? '…' : ''}</p>

                  {p.requirements?.length > 0 && (
                    <div className={s.reqs}>
                      {p.requirements.slice(0, 3).map((r, i) => <span key={i} className={s.chip}>{r}</span>)}
                      {p.requirements.length > 3 && <span className={s.chipMore}>+{p.requirements.length - 3}</span>}
                    </div>
                  )}

                  <div className={s.cardFooter}>
                    <span className={s.cardDate}>{timeAgo(p.createdAt)}</span>
                    <div className={s.cardActions}>
                      <button className={s.btnToggle} onClick={() => toggleActive(p._id, p.active)}>
                        {p.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className={s.btnEdit} onClick={() => openEdit(p)}>Edit</button>
                      <button className={s.btnDel} onClick={() => setDelConfirm(p._id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showForm && (
        <div className={s.overlay} onClick={closeForm}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>{editing ? 'Edit Position' : 'Add New Position'}</h2>
              <button className={s.modalClose} onClick={closeForm}>×</button>
            </div>

            <form className={s.modalBody} onSubmit={onSubmit} noValidate>
              <div className={s.row2}>
                <div className={s.fg}>
                  <label className={s.lbl}>Job Title <span className={s.req}>*</span></label>
                  <input className={s.input} name="title" value={form.title} onChange={onChange} placeholder="e.g. Senior Software Engineer" required />
                </div>
                <div className={s.fg}>
                  <label className={s.lbl}>Department <span className={s.req}>*</span></label>
                  <select className={s.input} name="department" value={form.department} onChange={onChange}>
                    {DEPTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className={s.row2}>
                <div className={s.fg}>
                  <label className={s.lbl}>Location <span className={s.req}>*</span></label>
                  <input className={s.input} name="location" value={form.location} onChange={onChange} placeholder="e.g. Dubai, UAE" required />
                </div>
                <div className={s.fg}>
                  <label className={s.lbl}>Type <span className={s.req}>*</span></label>
                  <select className={s.input} name="type" value={form.type} onChange={onChange}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className={s.row2}>
                <div className={s.fg}>
                  <label className={s.lbl}>Experience <span className={s.req}>*</span></label>
                  <input className={s.input} name="experience" value={form.experience} onChange={onChange} placeholder="e.g. 5+ Years" required />
                </div>
                <div className={s.fg}>
                  <label className={s.lbl}>Salary</label>
                  <input className={s.input} name="salary" value={form.salary} onChange={onChange} placeholder="e.g. Competitive" />
                </div>
              </div>

              <div className={s.fg}>
                <label className={s.lbl}>Description <span className={s.req}>*</span></label>
                <textarea className={s.textarea} name="description" value={form.description} onChange={onChange} placeholder="Describe the role and responsibilities…" rows={4} required />
              </div>

              <div className={s.fg}>
                <label className={s.lbl}>Requirements <span className={s.hint}>(comma-separated)</span></label>
                <textarea className={s.textarea} name="requirements" value={form.requirements} onChange={onChange} placeholder="5+ years React/Node.js, AWS experience, Team lead…" rows={2} />
              </div>

              {error && <div className={s.error}>⚠ {error}</div>}

              <div className={s.modalFooter}>
                <button type="button" className={s.btnCancel} onClick={closeForm}>Cancel</button>
                <button type="submit" className={s.btnSave} disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {delConfirm && (
        <div className={s.overlay} onClick={() => setDelConfirm(null)}>
          <div className={s.confirm} onClick={e => e.stopPropagation()}>
            <div className={s.confirmIcon}>🗑</div>
            <h3>Delete this position?</h3>
            <p>This cannot be undone. Existing applications referencing this position will remain.</p>
            <div className={s.confirmActions}>
              <button className={s.confirmCancel} onClick={() => setDelConfirm(null)}>Cancel</button>
              <button className={s.confirmDelete} onClick={() => deletePosition(delConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

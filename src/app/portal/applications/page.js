'use client';
import { useState, useEffect, useCallback } from 'react';
import s from '../admin.module.css';

const STATUS_OPTS = ['All','pending','reviewing','shortlisted','rejected','hired'];
const STATUS_LABELS = { pending:'Pending', reviewing:'Reviewing', shortlisted:'Shortlisted', rejected:'Rejected', hired:'Hired' };
const STATUS_CLS = { pending:'stPending', reviewing:'stReviewing', shortlisted:'stShortlisted', rejected:'stRejected', hired:'stHired' };

function timeAgo(d) {
  const diff = Date.now() - new Date(d); const day=Math.floor(diff/86400000), hr=Math.floor(diff/3600000), min=Math.floor(diff/60000);
  return day>0?`${day}d ago`:hr>0?`${hr}h ago`:`${min}m ago`;
}
function initials(n) { return n?.split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()).join('')||'?'; }

export default function PortalApplicationsPage() {
  const [apps, setApps]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fallback, setFallback]     = useState(false);
  const [search, setSearch]         = useState('');
  const [status, setStatus]         = useState('All');
  const [position, setPosition]     = useState('All');
  const [sort, setSort]             = useState('newest');
  const [selected, setSelected]     = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'All') params.set('status', status);
    if (search) params.set('search', search);
    params.set('sort', sort);
    try {
      const res = await fetch(`/api/applications?${params}`);
      const d = await res.json();
      setApps(d.applications || []); setFallback(d.fallback||false);
    } catch { setApps([]); }
    finally { setLoading(false); }
  }, [status, search, sort]);

  useEffect(() => { const t = setTimeout(fetch_, search ? 400 : 0); return () => clearTimeout(t); }, [fetch_, search]);

  const positions = ['All', ...new Set(apps.map(a => a.positionTitle).filter(Boolean))];
  const filtered = position === 'All' ? apps : apps.filter(a => a.positionTitle === position);

  const updateStatus = async (id, newStatus) => {
    setApps(prev => prev.map(a => a._id===id ? {...a,status:newStatus} : a));
    if (selected?._id===id) setSelected(p => ({...p, status:newStatus}));
    await fetch(`/api/applications/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:newStatus}) }).catch(()=>{});
  };

  const deleteApp = async id => {
    setApps(prev => prev.filter(a => a._id!==id));
    if (selected?._id===id) setSelected(null);
    setDelConfirm(null);
    await fetch(`/api/applications/${id}`, { method:'DELETE' }).catch(()=>{});
  };

  const stats = {
    total: apps.length,
    pending: apps.filter(a=>a.status==='pending').length,
    reviewing: apps.filter(a=>a.status==='reviewing').length,
    shortlisted: apps.filter(a=>a.status==='shortlisted').length,
    hired: apps.filter(a=>a.status==='hired').length,
  };

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <div><h1 className={s.title}>Applications <span>Dashboard</span></h1><p className={s.sub}>Manage all job applications across positions</p></div>
        <button className={s.refresh} onClick={fetch_}>↻ Refresh</button>
      </div>

      {fallback && <div className={s.noticebar}>⚠️ <strong>Demo Mode</strong> — Showing sample data.</div>}

      <div className={s.stats}>
        {[['Total',stats.total,'orange'],['Pending',stats.pending,'blue'],['Reviewing',stats.reviewing,'yellow'],['Shortlisted',stats.shortlisted,'purple'],['Hired',stats.hired,'green']].map(([l,v,c])=>(
          <div key={l} className={s.statCard}><div className={s.statLabel}>{l}</div><div className={`${s.statVal} ${s[c]}`}>{v}</div></div>
        ))}
      </div>

      <div className={s.filters}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}>🔍</span>
          <input className={s.search} placeholder="Search name, email, position…" value={search} onChange={e=>setSearch(e.target.value)} />
          {search && <button className={s.searchClear} onClick={()=>setSearch('')}>×</button>}
        </div>
        <select className={s.fsel} value={status} onChange={e=>setStatus(e.target.value)}>
          {STATUS_OPTS.map(o=><option key={o} value={o}>{o==='All'?'All Statuses':STATUS_LABELS[o]}</option>)}
        </select>
        <select className={s.fsel} value={position} onChange={e=>setPosition(e.target.value)}>
          {positions.map(p=><option key={p}>{p==='All'?'All Positions':p}</option>)}
        </select>
        <select className={s.fsel} value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A→Z</option>
        </select>
      </div>

      <div className={s.content}>
        {loading ? (
          <div className={s.loading}><span className="spinner spinner-dark"/>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className={s.empty}><div className={s.emptyIcon}>📭</div><div className={s.emptyTitle}>No applications found</div></div>
        ) : (
          <>
            <div className={s.count}>Showing <strong>{filtered.length}</strong> application{filtered.length!==1?'s':''}</div>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Applicant</th><th>Position</th><th>Experience</th><th>Status</th><th>Applied</th><th>Resume</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map((app,i) => (
                    <tr key={app._id} className={s.row} style={{animationDelay:`${i*.04}s`}}>
                      <td>
                        <div className={s.leadCell}>
                          <div className={s.avatar}>{initials(app.name)}</div>
                          <div><div className={s.leadName}>{app.name}</div><div className={s.leadEmail}>{app.email}</div></div>
                        </div>
                      </td>
                      <td><div className={s.posCell}>{app.positionTitle}</div></td>
                      <td><div className={s.expCell}>{app.experience||'—'}</div></td>
                      <td>
                        <select className={`${s.statusSel} ${s[STATUS_CLS[app.status]]}`} value={app.status} onChange={e=>updateStatus(app._id,e.target.value)}>
                          {Object.entries(STATUS_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                        </select>
                      </td>
                      <td><div className={s.dateCell}>{timeAgo(app.createdAt)}</div></td>
                      <td>
                        {app.resumeUrl
                          ? <a href={app.resumeUrl} target="_blank" rel="noreferrer" className={s.resumeBtn}>📄 Download</a>
                          : <span className={s.noResume}>No CV</span>}
                      </td>
                      <td>
                        <div className={s.actions}>
                          <button className={s.btnView} onClick={()=>setSelected(app)} title="View">👁</button>
                          <button className={s.btnDel} onClick={()=>setDelConfirm(app._id)} title="Delete">🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {selected && (
        <div className={s.overlay} onClick={()=>setSelected(null)}>
          <div className={s.modal} onClick={e=>e.stopPropagation()}>
            <div className={s.modalHeader}>
              <div className={s.modalAvatar}>{initials(selected.name)}</div>
              <div><div className={s.modalName}>{selected.name}</div><div className={s.modalEmail}>{selected.email}</div></div>
              <button className={s.modalClose} onClick={()=>setSelected(null)}>×</button>
            </div>
            <div className={s.modalBody}>
              {[['Position',selected.positionTitle],['Phone',selected.phone],['Experience',selected.experience||'—'],['Current Role',selected.currentRole||'—'],['Applied',new Date(selected.createdAt).toLocaleString()]].map(([l,v])=>(
                <div key={l} className={s.modalRow}><span className={s.modalLabel}>{l}</span><span className={s.modalVal}>{v}</span></div>
              ))}
              <div className={s.modalRow}>
                <span className={s.modalLabel}>Status</span>
                <select className={`${s.statusSel} ${s[STATUS_CLS[selected.status]]}`} value={selected.status} onChange={e=>updateStatus(selected._id,e.target.value)}>
                  {Object.entries(STATUS_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              {selected.details && (
                <div className={s.modalDetails}>
                  <div className={s.modalLabel} style={{marginBottom:8}}>About the Applicant</div>
                  <div className={s.modalDetailsText}>{selected.details}</div>
                </div>
              )}
            </div>
            <div className={s.modalFooter}>
              <a href={`mailto:${selected.email}`} className={s.modalBtnEmail}>✉ Email</a>
              {selected.resumeUrl && <a href={selected.resumeUrl} target="_blank" rel="noreferrer" className={s.modalBtnResume}>📄 Resume</a>}
              <button className={s.modalBtnDel} onClick={()=>{setDelConfirm(selected._id);setSelected(null);}}>🗑 Delete</button>
              <button className={s.modalBtnClose} onClick={()=>setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <div className={s.overlay} onClick={()=>setDelConfirm(null)}>
          <div className={s.confirm} onClick={e=>e.stopPropagation()}>
            <div className={s.confirmIcon}>🗑</div>
            <h3>Delete this application?</h3>
            <p>This cannot be undone.</p>
            <div className={s.confirmActions}>
              <button className={s.confirmCancel} onClick={()=>setDelConfirm(null)}>Cancel</button>
              <button className={s.confirmDelete} onClick={()=>deleteApp(delConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

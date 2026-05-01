'use client';
import { useState, useEffect, useCallback } from 'react';
import s from '../admin.module.css';

const STATUS_OPTS = ['All','new','contacted','in-progress','closed'];
const STATUS_LABELS = { new:'New', contacted:'Contacted', 'in-progress':'In Progress', closed:'Closed' };
const STATUS_CLS = { new:'stNew', contacted:'stContacted', 'in-progress':'stProgress', closed:'stClosed' };

function timeAgo(d) { const diff=Date.now()-new Date(d),day=Math.floor(diff/86400000),hr=Math.floor(diff/3600000),min=Math.floor(diff/60000); return day>0?`${day}d ago`:hr>0?`${hr}h ago`:`${min}m ago`; }
function initials(n) { return n?.split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()).join('')||'?'; }

export default function PortalLeadsPage() {
  const [leads, setLeads]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fallback, setFallback]     = useState(false);
  const [search, setSearch]         = useState('');
  const [status, setStatus]         = useState('All');
  const [sort, setSort]             = useState('newest');
  const [selected, setSelected]     = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (status !== 'All') p.set('status', status);
    if (search) p.set('search', search);
    p.set('sort', sort);
    try {
      const res = await fetch(`/api/leads?${p}`);
      const d = await res.json();
      setLeads(d.leads||[]); setFallback(d.fallback||false);
    } catch { setLeads([]); }
    finally { setLoading(false); }
  }, [status, search, sort]);

  useEffect(() => { const t=setTimeout(fetch_, search?400:0); return()=>clearTimeout(t); }, [fetch_,search]);

  const updateStatus = async (id, newStatus) => {
    setLeads(prev=>prev.map(l=>l._id===id?{...l,status:newStatus}:l));
    if (selected?._id===id) setSelected(p=>({...p,status:newStatus}));
    await fetch(`/api/leads/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:newStatus})}).catch(()=>{});
  };

  const deleteLead = async id => {
    setLeads(prev=>prev.filter(l=>l._id!==id));
    if (selected?._id===id) setSelected(null);
    setDelConfirm(null);
    await fetch(`/api/leads/${id}`,{method:'DELETE'}).catch(()=>{});
  };

  const stats = { total:leads.length, new:leads.filter(l=>l.status==='new').length, contacted:leads.filter(l=>l.status==='contacted').length, inProgress:leads.filter(l=>l.status==='in-progress').length, closed:leads.filter(l=>l.status==='closed').length };

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <div><h1 className={s.title}>Leads <span>Dashboard</span></h1><p className={s.sub}>Manage all recruitment service inquiries</p></div>
        <button className={s.refresh} onClick={fetch_}>↻ Refresh</button>
      </div>

      {fallback && <div className={s.noticebar}>⚠️ <strong>Demo Mode</strong> — Showing sample data.</div>}

      <div className={s.stats}>
        {[['Total',stats.total,'orange'],['New',stats.new,'blue'],['Contacted',stats.contacted,'yellow'],['In Progress',stats.inProgress,'purple'],['Closed',stats.closed,'green']].map(([l,v,c])=>(
          <div key={l} className={s.statCard}><div className={s.statLabel}>{l}</div><div className={`${s.statVal} ${s[c]}`}>{v}</div></div>
        ))}
      </div>

      <div className={s.filters}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}>🔍</span>
          <input className={s.search} placeholder="Search name, email, phone, details…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <button className={s.searchClear} onClick={()=>setSearch('')}>×</button>}
        </div>
        <select className={s.fsel} value={status} onChange={e=>setStatus(e.target.value)}>
          {STATUS_OPTS.map(o=><option key={o} value={o}>{o==='All'?'All Statuses':STATUS_LABELS[o]}</option>)}
        </select>
        <select className={s.fsel} value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A→Z</option>
        </select>
      </div>

      <div className={s.content}>
        {loading ? <div className={s.loading}><span className="spinner spinner-dark"/>Loading…</div>
        : leads.length===0 ? <div className={s.empty}><div className={s.emptyIcon}>📭</div><div className={s.emptyTitle}>No leads found</div></div>
        : (
          <>
            <div className={s.count}>Showing <strong>{leads.length}</strong> lead{leads.length!==1?'s':''}</div>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Contact</th><th>Phone</th><th>Details</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {leads.map((lead,i)=>(
                    <tr key={lead._id} className={s.row} style={{animationDelay:`${i*.04}s`}}>
                      <td><div className={s.leadCell}><div className={s.avatar}>{initials(lead.name)}</div><div><div className={s.leadName}>{lead.name}</div><div className={s.leadEmail}>{lead.email}</div></div></div></td>
                      <td><div className={s.expCell}>{lead.phone}</div></td>
                      <td>
                        <div className={s.posCell}>
                          {lead.details?.slice(0,70)}{lead.details?.length>70&&'…'}
                          {lead.details?.length>70&&<button className={s.resumeBtn} style={{marginLeft:5}} onClick={()=>setSelected(lead)}>More</button>}
                        </div>
                      </td>
                      <td>
                        <select className={`${s.statusSel} ${s[STATUS_CLS[lead.status]]}`} value={lead.status} onChange={e=>updateStatus(lead._id,e.target.value)}>
                          {Object.entries(STATUS_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                        </select>
                      </td>
                      <td><div className={s.dateCell}>{timeAgo(lead.createdAt)}</div></td>
                      <td><div className={s.actions}><button className={s.btnView} onClick={()=>setSelected(lead)}>👁</button><button className={s.btnDel} onClick={()=>setDelConfirm(lead._id)}>🗑</button></div></td>
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
              {[['Phone',selected.phone],['Source',selected.source||'website'],['Date',new Date(selected.createdAt).toLocaleString()]].map(([l,v])=>(
                <div key={l} className={s.modalRow}><span className={s.modalLabel}>{l}</span><span className={s.modalVal}>{v}</span></div>
              ))}
              <div className={s.modalRow}>
                <span className={s.modalLabel}>Status</span>
                <select className={`${s.statusSel} ${s[STATUS_CLS[selected.status]]}`} value={selected.status} onChange={e=>updateStatus(selected._id,e.target.value)}>
                  {Object.entries(STATUS_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className={s.modalDetails}><div className={s.modalLabel} style={{marginBottom:8}}>Inquiry Details</div><div className={s.modalDetailsText}>{selected.details}</div></div>
            </div>
            <div className={s.modalFooter}>
              <a href={`mailto:${selected.email}`} className={s.modalBtnEmail}>✉ Email</a>
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
            <h3>Delete this lead?</h3>
            <p>This action cannot be undone.</p>
            <div className={s.confirmActions}>
              <button className={s.confirmCancel} onClick={()=>setDelConfirm(null)}>Cancel</button>
              <button className={s.confirmDelete} onClick={()=>deleteLead(delConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

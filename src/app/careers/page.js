'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import s from './page.module.css';

const DEPTS = ['All', 'Technology & IT', 'Finance & Banking', 'Engineering', 'HR & Operations', 'Oil & Gas', 'Healthcare', 'Logistics'];
const TYPES = ['All', 'Remote', 'Onsite', 'Remote/Hybrid'];

export default function CareersPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [dept, setDept]           = useState('All');
  const [type, setType]           = useState('All');
  const [search, setSearch]       = useState('');
  const [fallback, setFallback]   = useState(false);

  useEffect(() => {
    fetch('/api/positions').then(r=>r.json()).then(d=>{ setPositions(d.positions||[]); setFallback(d.fallback||false); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  const filtered = positions.filter(p => {
    if (dept !== 'All' && p.department !== dept) return false;
    if (type !== 'All' && p.type !== type) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.department.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={s.wrap}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.headerInner}>
          <p className={s.eyebrow}>Now Hiring · Gulf Region</p>
          <h1 className={s.h1}>Open <em>Positions</em></h1>
          <p className={s.sub}>Pre-vetted opportunities across UAE, KSA, Qatar, Kuwait and beyond. Remote · Onsite · Any Industry.</p>
        </div>
      </div>

      {fallback && <div style={{background:'#fff3cd',border:'1px solid #ffc107',borderRadius:8,padding:'10px 18px',margin:'0 auto 0',maxWidth:900,fontSize:14}}>⚠️ <strong>Demo Mode</strong> — Showing sample positions. Connect Firebase to manage live listings.</div>}

      {/* Filters */}
      <div className={s.filters}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}>🔍</span>
          <input className={s.search} placeholder="Search positions…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className={s.fsel} value={dept} onChange={e=>setDept(e.target.value)}>
          {DEPTS.map(d=><option key={d}>{d}</option>)}
        </select>
        <select className={s.fsel} value={type} onChange={e=>setType(e.target.value)}>
          {TYPES.map(t=><option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Positions Grid */}
      <div className={s.content}>
        {loading ? (
          <div className={s.loading}><span className="spinner spinner-dark" />Loading positions…</div>
        ) : filtered.length === 0 ? (
          <div className={s.empty}><div className={s.emptyIcon}>📋</div><div className={s.emptyTitle}>No positions found</div><div className={s.emptySub}>Try adjusting your filters</div></div>
        ) : (
          <>
            <div className={s.count}>Showing <strong>{filtered.length}</strong> open position{filtered.length!==1?'s':''}</div>
            <div className={s.grid}>
              {filtered.map((p,i) => (
                <div key={p._id} className={s.posCard} style={{animationDelay:`${i*.05}s`}}>
                  <div className={s.posHeader}>
                    <div>
                      <div className={s.posDept}>{p.department}</div>
                      <h3 className={s.posTitle}>{p.title}</h3>
                    </div>
                    <span className={s.posType}>{p.type}</span>
                  </div>
                  <div className={s.posMeta}>
                    <span>📍 {p.location}</span>
                    <span>⏱ {p.experience}</span>
                    <span>💰 {p.salary}</span>
                  </div>
                  <p className={s.posDesc}>{p.description?.slice(0,120)}…</p>
                  {p.requirements?.length > 0 && (
                    <div className={s.reqs}>
                      {p.requirements.slice(0,3).map((r,i)=><span key={i} className={s.req}>{r}</span>)}
                    </div>
                  )}
                  <div className={s.posFooter}>
                    <Link href={`/apply?positionId=${p._id}&title=${encodeURIComponent(p.title)}`} className={s.applyBtn}>
                      Apply Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

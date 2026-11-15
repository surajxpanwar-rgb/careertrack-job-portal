import { useEffect, useState } from 'react'; import { Link, useSearchParams } from 'react-router-dom'; import { api, qs } from '../api'; import { salary, fmt, daysLeft } from '../ui';
export { salary, fmt } from '../ui';
export default function Jobs() {
  const [sp, setSp] = useSearchParams(); const get = (k, d = '') => sp.get(k) || d;
  const f = { q: get('q'), location: get('location'), type: get('type'), level: get('level'), sort: get('sort', 'newest') }; const page = Number(get('page', 1)) || 1;
  const [data, setData] = useState(null); const [err, setErr] = useState(''); const [loading, setLoading] = useState(true);
  const set = (patch, keepPage) => { const n = new URLSearchParams(sp); Object.entries(keepPage ? patch : { ...patch, page: '' }).forEach(([k, v]) => v ? n.set(k, v) : n.delete(k)); setSp(n, { replace: true }); };
  const on = k => e => set({ [k]: e.target.value }); const filtered = f.q || f.location || f.type || f.level;
  useEffect(() => { setLoading(true); const t = setTimeout(() => api('/jobs?' + qs({ ...f, page })).then(d => { setData(d); setErr(''); }).catch(e => setErr(e.message)).finally(() => setLoading(false)), 250); return () => clearTimeout(t); }, [sp.toString()]);
  return (<><section className="hero"><h1>Find work that fits.</h1><p>Browse open roles and apply in minutes. No account needed.</p>
    <div className="search"><input placeholder="Job title or company" value={f.q} onChange={on('q')} aria-label="Search by job title or company" /><input placeholder="City or remote" value={f.location} onChange={on('location')} aria-label="Location" /></div></section>
    <div className="filters"><select value={f.type} onChange={on('type')} aria-label="Employment type"><option value="">All job types</option>{['Full-time', 'Part-time', 'Contract', 'Internship'].map(x => <option key={x}>{x}</option>)}</select>
      <select value={f.level} onChange={on('level')} aria-label="Experience level"><option value="">Any experience</option>{['Fresher', 'Junior', 'Mid', 'Senior'].map(x => <option key={x}>{x}</option>)}</select>
      <select value={f.sort} onChange={on('sort')} aria-label="Sort jobs"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="salary">Highest salary</option><option value="deadline">Closing soon</option></select>
      {filtered && <button className="link-btn" onClick={() => setSp({}, { replace: true })}>Clear filters</button>}</div>
    {err && <p className="alert error" role="alert">Could not load jobs: {err}. Check that the server is running.</p>}
    {loading && !data && <div className="list">{[1, 2, 3].map(i => <div key={i} className="job skeleton" aria-hidden="true" />)}</div>}
    {data && <p className="count muted" aria-live="polite">{data.total} {data.total === 1 ? 'job' : 'jobs'} found</p>}
    {data && (data.jobs.length === 0 ? <div className="empty"><h3>No jobs match your search</h3><p>Try a different keyword or clear the filters.</p>{filtered && <button onClick={() => setSp({}, { replace: true })}>Clear filters</button>}</div> :
      <div className={`list${loading ? ' dim' : ''}`}>{data.jobs.map(j => { const dl = daysLeft(j.deadline); return (
        <Link key={j._id} to={`/jobs/${j._id}`} className="job"><div className="logo" aria-hidden="true">{j.company[0]}</div>
          <div className="job-main"><h3>{j.title}</h3><p className="muted">{j.company} · {j.location}</p>
            <div className="tags"><span>{j.employmentType}</span><span>{j.experienceLevel}</span><span>{salary(j)}</span></div></div>
          <div className="job-side"><small className="muted">Posted {fmt(j.createdAt)}</small>{dl && <small className={dl.urgent ? 'urgent' : 'muted'}>{dl.text}</small>}</div></Link>); })}</div>)}
    {data?.pages > 1 && <nav className="pager" aria-label="Pagination"><button disabled={page <= 1} onClick={() => { set({ page: page - 1 }, true); window.scrollTo({ top: 0 }); }}>Previous</button><span>Page {page} of {data.pages}</span><button disabled={page >= data.pages} onClick={() => { set({ page: page + 1 }, true); window.scrollTo({ top: 0 }); }}>Next</button></nav>}</>);
}

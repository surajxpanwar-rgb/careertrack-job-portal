import { useEffect, useState, useCallback } from 'react'; import { admin, qs, download } from '../api'; import { fmt, useUI } from '../ui';
export default function Applications() {
  const [f, setF] = useState({ job: '', status: '', from: '', to: '' }); const [page, setPage] = useState(1); const [d, setD] = useState(null); const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(null); const [note, setNote] = useState(''); const { toast } = useUI();
  const load = useCallback(() => admin('/applications?' + qs({ ...f, page })).then(setD).catch(e => toast(e.message, 'error')), [f, page]);
  useEffect(() => { load(); }, [load]); useEffect(() => { admin('/jobs?limit=100').then(r => setJobs(r.jobs)).catch(() => {}); }, []);
  const patch = (a, body, text) => admin('/applications/' + a._id, { method: 'PATCH', body }).then(() => { toast(text); setNote(''); load(); }).catch(e => toast(e.message, 'error'));
  const ch = k => e => { setF({ ...f, [k]: e.target.value }); setPage(1); };
  const run = p => p.catch(e => toast(e.message, 'error'));
  return (<><div className="bar"><h1>Applications</h1><button className="primary" onClick={() => run(download('/applications/export.csv?' + qs(f), 'applications.csv').then(() => toast('CSV exported')))}>Export CSV</button></div>
    <div className="filters"><select value={f.job} onChange={ch('job')}><option value="">All jobs</option>{jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}</select>
      <select value={f.status} onChange={ch('status')}><option value="">All statuses</option>{(d?.statuses || []).map(s => <option key={s}>{s}</option>)}</select>
      <input type="date" value={f.from} onChange={ch('from')} aria-label="From date" /><input type="date" value={f.to} onChange={ch('to')} aria-label="To date" /></div>
    {d && (d.applications.length === 0 ? <div className="empty"><h3>No applications yet</h3><p>Applications appear here when candidates apply, or change the filters.</p></div> : d.applications.map(a => (
      <div className="card app" key={a._id}><div className="bar"><div><h3>{a.name} <span className={`pill st-${a.status.replace(/\s/g, '')}`}>{a.status}</span></h3><p className="muted">{a.job?.title} · {a.job?.company} · Applied {fmt(a.createdAt)}</p></div>
        <select value={a.status} onChange={e => patch(a, { status: e.target.value }, 'Status updated')}>{d.statuses.map(s => <option key={s}>{s}</option>)}</select></div>
        <div className="row"><button onClick={() => setOpen(open === a._id ? null : a._id)}>{open === a._id ? 'Hide details' : 'View details'}</button><button onClick={() => run(download(`/applications/${a._id}/resume`, a.resumeName || 'resume'))}>Download résumé</button></div>
        {open === a._id && <div className="details"><p><b>Email:</b> {a.email} · <b>Phone:</b> {a.phone}</p><p><b>Education:</b> {a.education}</p><p><b>Experience:</b> {a.experience}</p><p><b>Skills:</b> {a.skills.join(', ')}</p>{a.coverLetter && <p><b>Cover letter:</b> {a.coverLetter}</p>}
          <h4>Recruitment notes</h4>{a.notes.length ? <ul>{a.notes.map(n => <li key={n._id}>{n.text} <small className="muted">{fmt(n.at)}</small></li>)}</ul> : <p className="muted">No notes yet.</p>}
          <div className="row"><input placeholder="Add an internal note" value={note} onChange={e => setNote(e.target.value)} /><button disabled={!note.trim()} onClick={() => patch(a, { note }, 'Note added')}>Add note</button></div></div>}</div>)))}
    {d?.pages > 1 && <div className="pager"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {d.pages}</span><button disabled={page >= d.pages} onClick={() => setPage(page + 1)}>Next</button></div>}</>);
}

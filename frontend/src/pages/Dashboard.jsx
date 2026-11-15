import { useEffect, useState, useCallback } from 'react'; import { admin, qs } from '../api'; import { fmt, useUI } from '../ui';
const BLANK = { title: '', company: '', location: '', employmentType: 'Full-time', experienceLevel: 'Fresher', salaryMin: '', salaryMax: '', description: '', responsibilities: '', qualifications: '', skills: '', benefits: '', howToApply: '', deadline: '', status: 'draft' };
export default function Dashboard() {
  const [stats, setStats] = useState(null); const [d, setD] = useState(null); const [f, setF] = useState({ q: '', status: '', sort: '-createdAt' }); const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); const [editId, setEditId] = useState(null); const { toast, confirm } = useUI();
  const load = useCallback(() => { admin('/stats').then(setStats).catch(e => toast(e.message, 'error')); admin('/jobs?' + qs({ ...f, page })).then(setD).catch(e => toast(e.message, 'error')); }, [f, page]);
  useEffect(load, [load]);
  const refresh = text => { toast(text); load(); }; const done = text => { setForm(null); refresh(text); }; const fail = e => toast(e.message, 'error');
  const edit = async id => { const j = await admin('/jobs/' + id); setEditId(id); setForm({ ...BLANK, ...j, salaryMin: j.salaryMin ?? '', salaryMax: j.salaryMax ?? '', deadline: j.deadline ? j.deadline.slice(0, 10) : '', ...Object.fromEntries(['responsibilities', 'qualifications', 'skills', 'benefits'].map(k => [k, (j[k] || []).join('\n')])) }); };
  const save = e => { e.preventDefault(); (editId ? admin('/jobs/' + editId, { method: 'PUT', body: form }) : admin('/jobs', { method: 'POST', body: form })).then(() => done(editId ? 'Job updated' : 'Job created')).catch(fail); };
  const status = (id, s) => admin(`/jobs/${id}/status`, { method: 'PATCH', body: { status: s } }).then(() => refresh(`Job ${s === 'published' ? 'published' : s === 'closed' ? 'closed' : 'unpublished'}`)).catch(fail);
  const del = async j => { if (await confirm({ title: 'Delete this job?', body: `"${j.title}" will be permanently removed. This cannot be undone.`, action: 'Delete job' })) admin('/jobs/' + j._id, { method: 'DELETE' }).then(() => refresh('Job deleted')).catch(fail); };
  const on = k => e => setForm({ ...form, [k]: e.target.value });
  return (<><h1>Dashboard</h1>
    {stats && <div className="stats">{[['Total jobs', stats.total], ['Active jobs', stats.active], ['Expired or closed', stats.closed], ['Applications', stats.applications]].map(([l, n]) => <div key={l} className="stat"><b>{n}</b><span>{l}</span></div>)}</div>}
    <div className="bar"><h2>Job postings</h2><button className="primary" onClick={() => { setEditId(null); setForm(BLANK); }}>New job</button></div>
    {form && <form className="card form" onSubmit={save}><h3>{editId ? 'Edit job' : 'New job'}</h3>
      <div className="grid"><label>Title<input value={form.title} onChange={on('title')} required /></label><label>Company<input value={form.company} onChange={on('company')} required /></label><label>Location<input value={form.location} onChange={on('location')} required /></label>
        <label>Type<select value={form.employmentType} onChange={on('employmentType')}>{['Full-time', 'Part-time', 'Contract', 'Internship'].map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Experience<select value={form.experienceLevel} onChange={on('experienceLevel')}>{['Fresher', 'Junior', 'Mid', 'Senior'].map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Deadline<input type="date" value={form.deadline} onChange={on('deadline')} /></label><label>Salary min (₹)<input type="number" min="0" value={form.salaryMin} onChange={on('salaryMin')} /></label><label>Salary max (₹)<input type="number" min="0" value={form.salaryMax} onChange={on('salaryMax')} /></label>
        <label>Status<select value={form.status} onChange={on('status')}><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option></select></label></div>
      <label>Description<textarea rows="3" value={form.description} onChange={on('description')} /></label>
      {['responsibilities', 'qualifications', 'skills', 'benefits'].map(k => <label key={k}>{k[0].toUpperCase() + k.slice(1)} (one per line)<textarea rows="3" value={form[k]} onChange={on(k)} /></label>)}
      <label>How to apply<input value={form.howToApply} onChange={on('howToApply')} /></label>
      <div className="row"><button className="primary">Save job</button><button type="button" onClick={() => setForm(null)}>Cancel</button></div></form>}
    <div className="filters"><input placeholder="Search jobs" value={f.q} onChange={e => { setF({ ...f, q: e.target.value }); setPage(1); }} />
      <select value={f.status} onChange={e => { setF({ ...f, status: e.target.value }); setPage(1); }}><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option></select>
      <select value={f.sort} onChange={e => setF({ ...f, sort: e.target.value })}><option value="-createdAt">Newest</option><option value="createdAt">Oldest</option><option value="title">Title</option><option value="deadline">Deadline</option></select></div>
    {d && (d.jobs.length === 0 ? <div className="empty"><h3>No jobs found</h3><p>Create a posting, or change the filters above.</p></div> : <div className="scroll"><table><thead><tr><th>Title</th><th>Company</th><th>Status</th><th>Deadline</th><th>Applicants</th><th>Actions</th></tr></thead><tbody>
      {d.jobs.map(j => <tr key={j._id}><td>{j.title}</td><td>{j.company}</td><td><span className={`pill ${j.status}`}>{j.status}</span></td><td>{fmt(j.deadline)}</td><td>{j.applications}</td>
        <td className="row"><button onClick={() => edit(j._id)}>Edit</button>{j.status !== 'published' ? <button onClick={() => status(j._id, 'published')}>Publish</button> : <button onClick={() => status(j._id, 'draft')}>Unpublish</button>}{j.status !== 'closed' && <button onClick={() => status(j._id, 'closed')}>Close</button>}<button className="danger" onClick={() => del(j)}>Delete</button></td></tr>)}</tbody></table></div>)}
    {d?.pages > 1 && <div className="pager"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {d.pages}</span><button disabled={page >= d.pages} onClick={() => setPage(page + 1)}>Next</button></div>}</>);
}

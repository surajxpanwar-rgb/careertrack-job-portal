import { useEffect, useState } from 'react'; import { useParams, Link } from 'react-router-dom'; import { api } from '../api'; import { salary, fmt, daysLeft } from '../ui';
const EMPTY = { name: '', email: '', phone: '', education: '', experience: '', skills: '', coverLetter: '' };
const rules = v => { const e = {}; if (v.name.trim().length < 2) e.name = 'Enter your full name'; if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Enter a valid email address';
  if (!/^\+?[0-9][0-9\s-]{8,14}$/.test(v.phone.trim())) e.phone = 'Enter a valid phone number, for example +91 98765 43210'; if (!v.education.trim()) e.education = 'Enter your educational qualifications';
  if (!v.experience.trim()) e.experience = 'Enter your experience, or write "Fresher"'; if (!v.skills.trim()) e.skills = 'List at least one skill, separated by commas'; return e; };
const Field = ({ label, error, hint, children }) => <label className={`field${error ? ' invalid' : ''}`}><span>{label}</span>{children}{hint && !error && <small className="muted">{hint}</small>}{error && <small className="err" role="alert">{error}</small>}</label>;
const List = ({ t, items }) => items?.length ? <section><h3>{t}</h3><ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul></section> : null;
export default function JobDetail() {
  const { id } = useParams(); const [job, setJob] = useState(null); const [err, setErr] = useState(''); const [v, setV] = useState(EMPTY); const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({}); const [state, setState] = useState({ busy: false, error: '', done: false });
  useEffect(() => { setJob(null); api(`/jobs/${id}`).then(setJob).catch(e => setErr(e.message)); }, [id]);
  const on = k => e => { setV({ ...v, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: '' }); };
  const pick = e => { const f = e.target.files[0]; setState(s => ({ ...s, error: '' })); if (!f) return setFile(null);
    const bad = !/\.(pdf|docx)$/i.test(f.name) ? 'Résumé must be a PDF or DOCX file' : f.size > 2 * 1024 * 1024 ? 'Résumé must be 2 MB or smaller' : '';
    if (bad) { e.target.value = ''; setFile(null); return setErrors({ ...errors, resume: bad }); } setErrors({ ...errors, resume: '' }); setFile(f); };
  const submit = async e => { e.preventDefault(); const er = rules(v); if (!file) er.resume = 'Upload your résumé (PDF or DOCX, max 2 MB)'; setErrors(er);
    if (Object.keys(er).length) return setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
    const fd = new FormData(); Object.entries(v).forEach(([k, x]) => fd.append(k, x.trim())); fd.append('resume', file); setState({ busy: true, error: '', done: false });
    try { await api(`/jobs/${id}/apply`, { method: 'POST', form: fd }); setState({ busy: false, error: '', done: true }); setV(EMPTY); setFile(null); window.scrollTo({ top: 0 }); } catch (x) { setState({ busy: false, error: x.message, done: false }); } };
  if (err) return <div className="empty"><h3>This job is not available</h3><p>It may have closed or been removed.</p><Link to="/">Browse open jobs</Link></div>;
  if (!job) return <div className="job skeleton tall" aria-label="Loading job" />;
  const dl = daysLeft(job.deadline); const inv = k => ({ 'aria-invalid': !!errors[k], value: v[k], onChange: on(k) });
  return (<div className="detail"><Link to="/" className="back">← All jobs</Link>
    {state.done && <div className="alert ok success" role="status"><b>Application submitted.</b> We have received your résumé. <Link to="/">Browse more jobs</Link></div>}
    <header className="dhead"><div className="logo big" aria-hidden="true">{job.company[0]}</div><div><h1>{job.title}</h1><p className="muted">{job.company} · {job.location}</p>
      <div className="tags"><span>{job.employmentType}</span><span>{job.experienceLevel}</span><span>{salary(job)}</span><span className={dl?.urgent ? 'urgent-chip' : ''}>{job.deadline ? `Apply by ${fmt(job.deadline)}` : 'Open until filled'}</span></div></div>
      {!state.done && <a href="#apply" className="btn primary">Apply now</a>}</header>
    <div className="card prose">{job.description && <p>{job.description}</p>}<div className="cols"><List t="Responsibilities" items={job.responsibilities} /><List t="Qualifications" items={job.qualifications} /></div>
      {job.skills?.length > 0 && <section><h3>Required skills</h3><div className="tags">{job.skills.map(s => <span key={s}>{s}</span>)}</div></section>}<List t="Benefits" items={job.benefits} />
      <section><h3>How to apply</h3><p>{job.howToApply}</p></section></div>
    {!state.done && <form id="apply" className="card form" onSubmit={submit} noValidate><h2>Apply for this role</h2><p className="muted">Fields marked * are required. Your details are only visible to the hiring team.</p>
      {state.error && <p className="alert error" role="alert">{state.error}</p>}
      <div className="grid"><Field label="Full name *" error={errors.name}><input autoComplete="name" {...inv('name')} /></Field><Field label="Email *" error={errors.email}><input type="email" autoComplete="email" {...inv('email')} /></Field>
        <Field label="Phone *" error={errors.phone}><input type="tel" autoComplete="tel" placeholder="+91 98765 43210" {...inv('phone')} /></Field>
        <Field label="Education *" error={errors.education}><input placeholder="B.Tech CSE, 2026" {...inv('education')} /></Field>
        <Field label="Experience *" error={errors.experience}><input placeholder='Fresher, or "2 years at Acme"' {...inv('experience')} /></Field>
        <Field label="Technical skills *" error={errors.skills}><input placeholder="React, Node.js, MongoDB" {...inv('skills')} /></Field></div>
      <Field label="Cover letter (optional)" hint={`${v.coverLetter.length}/3000`}><textarea rows="4" maxLength={3000} value={v.coverLetter} onChange={on('coverLetter')} /></Field>
      <Field label="Résumé * (PDF or DOCX, max 2 MB)" error={errors.resume}><input type="file" accept=".pdf,.docx" aria-invalid={!!errors.resume} onChange={pick} />{file && <small className="muted">Selected: {file.name} ({Math.round(file.size / 1024)} KB)</small>}</Field>
      <button className="primary" disabled={state.busy}>{state.busy ? 'Submitting…' : 'Submit application'}</button></form>}</div>);
}

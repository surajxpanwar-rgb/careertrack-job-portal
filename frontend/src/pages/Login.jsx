import { useState } from 'react'; import { useNavigate } from 'react-router-dom'; import { api } from '../api';
export default function Login() {
  const [v, setV] = useState({ email: '', password: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const nav = useNavigate();
  const go = async e => { e.preventDefault(); setBusy(true); setErr(''); try { const d = await api('/admin/login', { method: 'POST', body: v }); localStorage.setItem('ct_token', d.token); nav('/admin'); } catch (x) { setErr(x.message); } setBusy(false); };
  return (<form className="card form narrow" onSubmit={go}><h2>Administrator login</h2>{err && <p className="alert error" role="alert">{err}</p>}
    <label>Email<input type="email" value={v.email} onChange={e => setV({ ...v, email: e.target.value })} required /></label>
    <label>Password<input type="password" value={v.password} onChange={e => setV({ ...v, password: e.target.value })} required /></label>
    <button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form>);
}

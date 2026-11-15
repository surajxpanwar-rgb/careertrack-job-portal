import { createContext, useContext, useState, useCallback, useEffect } from 'react';
const Ctx = createContext(null); export const useUI = () => useContext(Ctx);
export const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const inr = n => `₹${Number(n).toLocaleString('en-IN')}`;
export const salary = j => j.salaryMin != null && j.salaryMax != null ? `${inr(j.salaryMin)} – ${inr(j.salaryMax)}` : j.salaryMin != null ? `From ${inr(j.salaryMin)}` : j.salaryMax != null ? `Up to ${inr(j.salaryMax)}` : 'Salary not disclosed';
export const daysLeft = d => { if (!d) return null; const n = Math.ceil((new Date(d) - Date.now()) / 864e5); return { text: n <= 0 ? 'Closes today' : n === 1 ? 'Closes tomorrow' : `Closes in ${n} days`, urgent: n <= 3 }; };

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]); const [dlg, setDlg] = useState(null);
  const toast = useCallback((text, type = 'ok') => { const id = Math.random(); setToasts(t => [...t, { id, text, type }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500); }, []);
  const confirm = useCallback(o => new Promise(res => setDlg({ ...o, res })), []);
  const close = v => { dlg.res(v); setDlg(null); };
  useEffect(() => { if (!dlg) return; const k = e => e.key === 'Escape' && close(false); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); });
  return (<Ctx.Provider value={{ toast, confirm }}>{children}
    <div className="toasts" aria-live="polite">{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.text}</div>)}</div>
    {dlg && <div className="overlay" onClick={() => close(false)}><div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" onClick={e => e.stopPropagation()}>
      <h3 id="dlg-t">{dlg.title}</h3><p>{dlg.body}</p><div className="row end"><button autoFocus onClick={() => close(false)}>Cancel</button><button className="danger solid" onClick={() => close(true)}>{dlg.action || 'Confirm'}</button></div></div></div>}</Ctx.Provider>);
}

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const token = () => localStorage.getItem('ct_token');
export const logout = () => localStorage.removeItem('ct_token');
async function req(path, { method = 'GET', body, form, auth, raw } = {}) {
  const headers = {}; if (auth) headers.Authorization = `Bearer ${token()}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, { method, headers, body: form || (body && JSON.stringify(body)) });
  if (res.status === 401 && auth) { logout(); window.location.href = '/admin/login'; }
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || 'Request failed'); }
  return raw ? res.blob() : res.json();
}
export const api = (p, o) => req(p, o);
export const admin = (p, o = {}) => req('/admin' + p, { ...o, auth: true });
export const download = async (path, name) => { const b = await admin(path, { raw: true }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); URL.revokeObjectURL(a.href); };
export const qs = o => new URLSearchParams(Object.entries(o).filter(([, v]) => v !== '' && v != null)).toString();

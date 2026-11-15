import { Routes, Route, Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { token, logout } from './api'; import Jobs from './pages/Jobs'; import JobDetail from './pages/JobDetail';
import Login from './pages/Login'; import Dashboard from './pages/Dashboard'; import Applications from './pages/Applications';

const Guard = () => token() ? <Outlet /> : <Navigate to="/admin/login" replace />;
function Shell() {
  const nav = useNavigate();
  return (<>
    <a className="skip" href="#main">Skip to content</a><header className="top"><Link to="/" className="brand">CareerTrack</Link>
      <nav>{token() ? (<><NavLink to="/admin">Dashboard</NavLink><NavLink to="/admin/applications">Applications</NavLink><button className="link" onClick={() => { logout(); nav('/'); }}>Log out</button></>) : <NavLink to="/admin/login">Admin</NavLink>}</nav></header>
    <main id="main"><Outlet /></main><footer>CareerTrack · Full-stack job portal</footer></>);
}
export default function App() {
  return (<Routes><Route element={<Shell />}>
    <Route index element={<Jobs />} /><Route path="jobs/:id" element={<JobDetail />} />
    <Route path="admin/login" element={<Login />} />
    <Route element={<Guard />}><Route path="admin" element={<Dashboard />} /><Route path="admin/applications" element={<Applications />} /></Route>
    <Route path="*" element={<p className="empty">Page not found. <Link to="/">Back to jobs</Link></p>} />
  </Route></Routes>);
}

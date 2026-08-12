import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import './app-shell.css';

const TABS = [
  { to: '/', label: 'Carteira', end: true },
  { to: '/checkout', label: 'Checkout' },
  { to: '/saques', label: 'Saques' },
  { to: '/webhooks', label: 'Webhooks' },
];

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <header className="shell-masthead">
        <span className="shell-brand">VBA · BaaS</span>
        <div className="shell-account">
          {user && <span className="shell-merchant">{user.name}</span>}
          <button className="shell-logout" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <nav className="shell-tabs">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `shell-tab${isActive ? ' shell-tab--active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <main className="shell-content">
        <Outlet />
      </main>
    </div>
  );
}

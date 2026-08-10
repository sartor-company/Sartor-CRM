import { NavLink } from 'react-router-dom';
import { NAV_CONFIG } from '../../constants/nav';
import { PAGE_PATHS } from '../../constants/routes';
import { TIER_GATES } from '../../constants/tiers';
import { ROLE_META } from '../../constants/roles';
import { useApp } from '../../context/AppContext';
import { Icon } from '../ui/Icon';
import type { PageId } from '../../types';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '?';
}

export function Sidebar() {
  const { role, tier, sidebarOpen, closeSidebar, displayName, roleLabel, logout } = useApp();
  const meta = ROLE_META[role];
  const items = NAV_CONFIG[role] ?? [];
  const allowed = TIER_GATES[tier];
  const av = initials(displayName) || meta.av;

  return (
    <nav id="sb" className={sidebarOpen ? 'open' : ''}>
      <div className="sb-logo">
        <img className="sb-mark brand-logo" src="/sartor-logo.jpg" alt="Sartor Health logo" width={32} height={32} />
        <div>
          <div className="sb-nm">SartorCRM</div>
          <div className="sb-dm">crm.sartor.ng</div>
        </div>
      </div>
      <div className="ns">
        {items.map((n, i) => {
          if (n.type === 'sep') {
            return (
              <span key={`sep-${i}`} className="nl">
                {n.lbl}
              </span>
            );
          }
          const tierLock = n.tier && !n.tier.includes(tier);
          const permLock = allowed && !allowed.includes(n.id);
          if (tierLock || permLock) {
            return (
              <div key={n.id} className="ni tier-lock">
                <span className="ico">
                  <Icon name="lock" size={14} />
                </span>
                <span>{n.lbl}</span>
                <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,.3)' }}>
                  Upgrade
                </span>
              </div>
            );
          }
          return (
            <NavLink
              key={n.id}
              to={PAGE_PATHS[n.id as PageId]}
              className={({ isActive }) => `ni${isActive ? ' on' : ''}`}
              onClick={closeSidebar}
            >
              <span className="ico">
                <Icon name={n.ico} size={15} />
              </span>
              <span>{n.lbl}</span>
            </NavLink>
          );
        })}
      </div>
      <div className="sbfoot">
        <div className="sb-user">
          <div className="av" style={{ background: meta.color }}>
            {av}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sb-uname">{displayName}</div>
            <div className="sb-urole">{roleLabel}</div>
          </div>
        </div>
        <button
          type="button"
          className="btn bout bsm"
          style={{ width: '100%', marginTop: 10, justifyContent: 'center', color: 'rgba(255,255,255,.75)', borderColor: 'rgba(255,255,255,.2)' }}
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}

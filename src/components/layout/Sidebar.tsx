import { NavLink } from 'react-router-dom';
import { NAV_CONFIG } from '../../constants/nav';
import { PAGE_PATHS } from '../../constants/routes';
import { TIER_GATES } from '../../constants/tiers';
import { ROLE_META } from '../../constants/roles';
import { useApp } from '../../context/AppContext';
import { Icon } from '../ui/Icon';
import type { PageId } from '../../types';

export function Sidebar() {
  const { role, tier, sidebarOpen, closeSidebar } = useApp();
  const meta = ROLE_META[role];
  const items = NAV_CONFIG[role] ?? [];
  const allowed = TIER_GATES[tier];

  return (
    <nav id="sb" className={sidebarOpen ? 'open' : ''}>
      <div className="sb-logo">
        <div className="sb-mark">S</div>
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
            {meta.av}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sb-uname">{meta.name}</div>
            <div className="sb-urole">{meta.role}</div>
          </div>
          <div className="rpill" style={{ background: 'rgba(0,179,65,.2)', color: 'var(--G)' }}>
            {role.toUpperCase()}
          </div>
        </div>
      </div>
    </nav>
  );
}

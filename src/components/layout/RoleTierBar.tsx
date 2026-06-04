import { ROLE_LABELS, ROLE_ORDER, SN_TIER_ROLES } from '../../constants/roles';
import { TIER_BADGE_CLASS, TIER_LABELS } from '../../constants/tiers';
import { useApp } from '../../context/AppContext';
import type { TierId } from '../../types';

const TIER_ORDER: TierId[] = ['sn', 'snp', '360'];

export function RoleTierBar() {
  const { role, tier, setRole, setTier } = useApp();

  return (
    <div id="rbar">
      <span className="lbl">Role:</span>
      {ROLE_ORDER.map((r) => {
        const locked = tier === 'sn' && !SN_TIER_ROLES.includes(r);
        return (
          <button
            key={r}
            type="button"
            className={`rbtn ${role === r ? 'on' : ''}`.trim()}
            disabled={locked}
            title={locked ? 'Requires Sales Nav Plus or CRM 360' : ''}
            style={{ opacity: locked ? 0.3 : undefined }}
            onClick={() => !locked && setRole(r)}
          >
            {ROLE_LABELS[r]}
          </button>
        );
      })}
      <span className="sep">|</span>
      <span className="lbl">Tier:</span>
      {TIER_ORDER.map((t) => (
        <button
          key={t}
          type="button"
          className={`rbtn ${tier === t ? 'on' : ''}`.trim()}
          onClick={() => setTier(t)}
        >
          {t === 'sn' ? 'Sales Nav' : t === 'snp' ? 'Sales Nav+' : 'CRM 360'}
        </button>
      ))}
      <span className={`tier-badge ${TIER_BADGE_CLASS[tier]}`}>{TIER_LABELS[tier]}</span>
    </div>
  );
}

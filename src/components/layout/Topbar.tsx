import { Button } from '../ui';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import { TIER_LABELS } from '../../constants/tiers';

export function Topbar() {
  const { pageTitle, companyName, tier, canShowSalesActions, openSidebar } = useApp();
  const { openModal } = useModal();

  return (
    <div className="topbar">
      <div className="ham" onClick={openSidebar} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openSidebar()}>
        <span />
        <span />
        <span />
      </div>
      <div className="tb-info">
        <div className="tb-title">{pageTitle}</div>
        <div className="tb-sub">
          {companyName} — {TIER_LABELS[tier]}
        </div>
      </div>
      <div className="tb-r">
        {canShowSalesActions && (
          <>
            <Button variant="green" size="sm" onClick={() => openModal('add-lead')}>
              <span className="btn-txt-full">+ New Lead</span>
              <span className="btn-txt-short">+ Lead</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => openModal('create-lpo')}>
              <span className="btn-txt-full">+ New LPO</span>
              <span className="btn-txt-short">+ LPO</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { Button, Icon, PageHead, QueryState } from '../components/ui';
import { crmApi, type CrmLead } from '../api/crm';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { formatShortDate } from '../utils/format';

const PIPELINE_STAGES: { title: string; statuses: string[]; titleIcon?: 'sparkles' }[] = [
  { title: 'New', statuses: ['New', ''] },
  { title: 'Contact Made', statuses: ['Contacted'] },
  { title: 'Qualifying', statuses: ['Qualified', 'Follow Up', 'Interested'] },
  { title: 'Negotiation', statuses: ['In-Negotiations', 'Hold'] },
  { title: 'LPO Raised', statuses: ['LPO Generated'] },
  {
    title: 'Customer',
    titleIcon: 'sparkles',
    statuses: ['Closed Won', 'Payment Confirmed', 'Order Fulfilled'],
  },
];

function leadSub(lead: CrmLead) {
  return [lead.lga, lead.state].filter(Boolean).join(', ') || lead.address || lead.type || '—';
}

export default function PipelinePage() {
  const { openModal } = useModal();
  const { data: leads = [], loading, error, reload } = useApiQuery(() => crmApi.listLeads(), []);

  useEffect(() => {
    const onChange = () => void reload();
    window.addEventListener('crm-leads-changed', onChange);
    return () => window.removeEventListener('crm-leads-changed', onChange);
  }, [reload]);

  const lost = (leads ?? []).filter((l) => l.status === 'Closed Lost');
  const columns = PIPELINE_STAGES.map((stage) => {
    const cards = (leads ?? []).filter((l) => stage.statuses.includes(l.status || ''));
    return { ...stage, cards, count: cards.length };
  });

  return (
    <>
      <PageHead
        title="Sales Pipeline"
        subtitle={lost.length ? `${lost.length} closed lost (not shown on board)` : undefined}
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('add-lead')}>
            + New Lead
          </Button>
        }
      />

      <QueryState loading={loading} error={error} empty={!leads?.length} emptyMessage="No leads in the pipeline yet.">
        <div className="kb-board">
          {columns.map((col) => (
            <div key={col.title} className="kb-col">
              <div className="kb-col-h">
                <span className="kb-col-t" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {col.title}
                  {col.titleIcon ? <Icon name={col.titleIcon} size={12} /> : null}
                </span>
                <span className="kb-cnt">{col.count}</span>
              </div>
              <div className="kb-items">
                {col.cards.map((card) => (
                  <div
                    key={card._id}
                    className="kb-card"
                    onClick={() => openModal('lead-detail', { lead: card })}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="kb-cn">{card.name || 'Untitled'}</div>
                    <div className="kb-cs">{leadSub(card)}</div>
                    <div className="kb-cr">
                      <span style={{ fontSize: 10, color: 'var(--tx3)' }}>
                        {formatShortDate(card.creationDateTime)}
                      </span>
                      {col.title !== 'LPO Raised' && col.title !== 'Customer' && (
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('update-status', { lead: card });
                          }}
                        >
                          Stage
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </QueryState>
    </>
  );
}

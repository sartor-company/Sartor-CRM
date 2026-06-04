import { Button, Icon, PageHead } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { PIPELINE_COLUMNS } from '../data/mock';

export default function PipelinePage() {
  const { openModal } = useModal();

  return (
    <>
      <PageHead
        title="Sales Pipeline"
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('add-lead')}>
            + New Lead
          </Button>
        }
      />

      <div className="kb-board">
        {PIPELINE_COLUMNS.map((col) => (
          <div key={col.title} className="kb-col">
            <div className="kb-col-h">
              <span className="kb-col-t" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {col.title}
                {'titleIcon' in col && col.titleIcon ? <Icon name={col.titleIcon} size={12} /> : null}
              </span>
              <span className="kb-cnt">{col.count}</span>
            </div>
            <div className="kb-items">
              {col.cards.map((card) => (
                <div
                  key={card.name}
                  className="kb-card"
                  onClick={() => openModal('lead-detail')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="kb-cn">{card.name}</div>
                  <div className="kb-cs">{card.sub}</div>
                  {(('meta' in card && card.meta) || col.title !== 'Customer') && (
                    <div className="kb-cr">
                      {'meta' in card && card.meta && (
                        <span style={{ fontSize: 10, color: 'var(--tx3)' }}>{card.meta}</span>
                      )}
                      {col.title !== 'LPO Raised' && col.title !== 'Customer' && (
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('update-status');
                          }}
                        >
                          Stage
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

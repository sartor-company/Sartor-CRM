import { useState } from 'react';
import { LocationCardSection } from '../components/location/LocationCard';
import { Button } from '../components/ui/Button';
import { Icon, IconLabel } from '../components/ui/Icon';
import { Badge } from '../components/ui/Badge';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

const VISIT_PRODUCTS = [
  'SH-25-CAR — Hand Sanitiser 250ml Carabiner',
  'SH-25-SIL — Hand Sanitiser 250ml Silicone',
  'SH-50-CAR — Hand Sanitiser 500ml',
  'SH-25-HOK — Silicone Hook Pack',
];

const STORES: Record<string, { addr: string; type: string }> = {
  freshmart: { addr: '31 Garki Market Rd, Garki, FCT', type: 'FMCG-Retail' },
  healthplus: { addr: '22 Aguiyi Ironsi St, Maitama, Abuja', type: 'FMCG-Retail' },
};

export function FieldModals() {
  const { isOpen, closeModal, handleSubmit, showToast } = useModalActions();
  const [store, setStore] = useState('');

  const storeMeta = store ? STORES[store] : null;

  return (
    <>
      <SartorModal
        id="new-visit"
        open={isOpen('new-visit')}
        onClose={() => closeModal('new-visit')}
        title="Log Store Visit"
        subtitle="Observations, shelf data, photos — submitted to management"
        size="wide"
        footer={
          <ModalFooterActions onCancel={() => closeModal('new-visit')}>
            <Button
              variant="green"
              onClick={(e) =>
                handleSubmit('new-visit', e.currentTarget, 'Visit report submitted to management.')
              }
            >
              Save & Submit Visit Report
            </Button>
          </ModalFooterActions>
        }
      >
        <FRow>
          <FG label="Store *">
            <select
              className="sel"
              value={store}
              onChange={(e) => setStore(e.target.value)}
            >
              <option value="">Select store…</option>
              <option value="freshmart">FreshMart Garki</option>
              <option value="healthplus">HealthPlus Maitama</option>
            </select>
          </FG>
          <FG label="Store Address">
            <input className="inp" readOnly style={{ background: 'var(--bg)' }} value={storeMeta?.addr ?? ''} />
          </FG>
          <FG label="Category">
            <input className="inp" readOnly style={{ background: 'var(--bg)' }} value={storeMeta?.type ?? ''} />
          </FG>
        </FRow>
        <SDivLabel>Sartor Products on Shelf — tick found, enter quantity observed</SDivLabel>
        <div className="checklist-items" style={{ marginBottom: 14 }}>
          {VISIT_PRODUCTS.map((name) => (
            <div key={name} className="check-item">
              <input type="checkbox" />
              <div className="check-item-body">
                <span className="check-item-name">{name}</span>
                <div className="check-item-qty">
                  <input className="inp" type="number" placeholder="Qty" min={0} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <FG label="Out-of-Stock Sartor SKUs" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="List any Sartor products that were out of stock" />
        </FG>
        <FG label="Competitor Brands Spotted" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="e.g. Dettol, Septol, PureGel, Lifebuoy…" />
        </FG>
        <FG
          label={
            <>
              Competitor Observations{' '}
              <span style={{ fontWeight: 400, color: 'var(--tx3)' }}>
                (pricing, promotions, shelf placement)
              </span>
            </>
          }
          full
          style={{ marginBottom: 10 }}
        >
          <textarea
            className="ta"
            rows={3}
            placeholder="Describe competitor shelf placement, pricing, active promotions…"
          />
        </FG>
        <FG label="General Notes" full style={{ marginBottom: 12 }}>
          <textarea className="ta" rows={3} placeholder="Store condition, manager feedback, requests…" />
        </FG>
        <SDivLabel>Shelf & Store Photos</SDivLabel>
        <InfoBanner icon="camera" style={{ padding: '7px 11px' }}>
          Photos are stored with this visit log and visible to CEO and Admin.
        </InfoBanner>
        <div className="photo-grid">
          <div className="photo-thumb add" role="button" tabIndex={0} onClick={() => showToast('Photo added.')}>
            +
          </div>
        </div>
        <SDivLabel>Store Location Pin</SDivLabel>
        <LocationCardSection context="visit" />
      </SartorModal>

      <SartorModal
        id="visit-detail"
        open={isOpen('visit-detail')}
        onClose={() => closeModal('visit-detail')}
        title="Visit Report — FreshMart Garki"
        subtitle="Submitted by Einstein Dare · 10 May 2026 · 14:32"
        size="wide"
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('visit-detail')}>
              Close
            </Button>
            <Button variant="outline" onClick={() => showToast('Exporting visit report as PDF…')}>
              <IconLabel icon="download" size={13}>Export Report</IconLabel>
            </Button>
          </>
        }
      >
        <InfoBanner variant="succ" icon="clipboard">
          This visit report was submitted by <strong>Einstein Dare (Merchandiser)</strong> and is visible
          to <strong>CEO and all Admins</strong>.
        </InfoBanner>
        <div className="g2" style={{ marginBottom: 0 }}>
          <div>
            <SDivLabel style={{ marginTop: 0 }}>Store Information</SDivLabel>
            <IRow label="Store" value="FreshMart Garki" />
            <IRow label="Address" value="31 Garki Market Rd, Garki, FCT — Abuja" />
            <IRow label="Merchandiser" value="Einstein Dare" />
            <SDivLabel>Products Found on Shelf</SDivLabel>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>SH-25-CAR</td>
                  <td>Carabiner 250ml</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>12</td>
                  <td>
                    <Badge variant="green">Found</Badge>
                  </td>
                </tr>
                <tr>
                  <td>SH-25-HOK</td>
                  <td>Silicone Hook Pack</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--rt)' }}>0</td>
                  <td>
                    <Badge variant="red">Out of Stock</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <SDivLabel style={{ marginTop: 0 }}>Shelf Photos (4)</SDivLabel>
            <div className="photo-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="photo-thumb" style={{ background: 'var(--bg3)', fontSize: 20 }}>
                  <Icon name="image" size={20} />
                </div>
              ))}
            </div>
            <SDivLabel>Competitor Intelligence</SDivLabel>
            <IRow
              label="Brands Spotted"
              value={
                <>
                  <Badge variant="amber" style={{ marginRight: 4 }}>
                    Dettol
                  </Badge>
                  <Badge variant="gray">Septol</Badge>
                </>
              }
            />
          </div>
        </div>
        <div className="visit-obs-block" style={{ marginTop: 12 }}>
          <div className="visit-obs-label">
            <IconLabel icon="search" size={13}>Competitor Observations</IconLabel>
          </div>
          Dettol is positioned at eye level on the primary shelf. Septol is running a Buy One Get One Free
          promotion this week.
        </div>
        <div className="visit-obs-block" style={{ marginTop: 8, borderLeftColor: 'var(--G)' }}>
          <div className="visit-obs-label" style={{ color: 'var(--Gd)' }}>
            <IconLabel icon="file-text" size={13}>General Notes (Manager Feedback)</IconLabel>
          </div>
          Store manager requested more stock of the 500ml variant. SH-25-HOK has been out of stock for 2
          weeks.
        </div>
        <div className="sdiv" />
        <SDivLabel>Store Location</SDivLabel>
        <LocationCardSection context="visit" />
      </SartorModal>

      <SartorModal
        id="market-intel"
        open={isOpen('market-intel')}
        onClose={() => closeModal('market-intel')}
        title="Add Market Intelligence"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('market-intel')}>
            <Button
              variant="primary"
              onClick={(e) => handleSubmit('market-intel', e.currentTarget, 'Market intelligence saved.')}
            >
              Save Intel
            </Button>
          </ModalFooterActions>
        }
      >
        <FG label="Store *" full style={{ marginBottom: 10 }}>
          <select className="sel" defaultValue="FreshMart Garki">
            <option>FreshMart Garki</option>
            <option>HealthPlus Maitama</option>
          </select>
        </FG>
        <FG label="Competitor Brands Spotted" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="e.g. Dettol, Septol…" />
        </FG>
        <FG label="Observation Notes" full>
          <textarea className="ta" rows={3} placeholder="Pricing, promotions, shelf positioning…" />
        </FG>
      </SartorModal>
    </>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { LocationCardSection } from '../components/location/LocationCard';
import { Button } from '../components/ui/Button';
import { Icon, IconLabel } from '../components/ui/Icon';
import { Badge } from '../components/ui/Badge';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { opsApi, type OpsVisit } from '../api/ops';
import { productLabel, useLiveOptions } from '../hooks/useLiveOptions';
import { formatDate } from '../utils/format';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

function personName(p: OpsVisit['merchandiser']) {
  if (!p) return '—';
  if (typeof p === 'string') return p;
  return p.fullName || '—';
}

export function FieldModals() {
  const { isOpen, closeModal, getPayload, showToast } = useModalActions();
  const { products } = useLiveOptions();
  const [store, setStore] = useState('');
  const [recentStores, setRecentStores] = useState<string[]>([]);
  const [savingVisit, setSavingVisit] = useState(false);
  const [savingIntel, setSavingIntel] = useState(false);
  const competitorsRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const intelStoreRef = useRef<HTMLInputElement>(null);
  const intelCompRef = useRef<HTMLInputElement>(null);
  const intelNotesRef = useRef<HTMLTextAreaElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);

  const visit = getPayload<{ visit?: OpsVisit }>('visit-detail')?.visit;

  const newVisitOpen = isOpen('new-visit');
  useEffect(() => {
    if (!newVisitOpen) return;
    void opsApi
      .listVisits(false)
      .then((visits) => {
        const names = Array.from(
          new Set(visits.map((v) => v.storeName).filter(Boolean)),
        ).slice(0, 20);
        setRecentStores(names);
      })
      .catch(() => setRecentStores([]));
  }, [newVisitOpen]);

  const shelfProducts = useMemo(() => products.slice(0, 20), [products]);

  const saveVisit = async (btn: HTMLButtonElement | null) => {
    const storeName = store.trim();
    if (!storeName) {
      showToast('Enter or select a store.', 'err');
      return;
    }
    setSavingVisit(true);
    if (btn) btn.disabled = true;
    try {
      const checked = document.querySelectorAll<HTMLInputElement>('.check-item input[type="checkbox"]:checked');
      const skusFound = checked.length;
      const skusTotal = shelfProducts.length || 0;
      await opsApi.createVisit({
        storeName,
        address: addressRef.current?.value.trim() || undefined,
        category: categoryRef.current?.value.trim() || undefined,
        skusFound,
        skusTotal,
        skusOos: Math.max(0, skusTotal - skusFound),
        competitors: competitorsRef.current?.value.trim() || undefined,
        notes: notesRef.current?.value.trim() || undefined,
        photoCount: 0,
      });
      closeModal('new-visit');
      showToast('Visit report submitted to management.', 'ok');
      window.dispatchEvent(new CustomEvent('crm-ops-changed'));
      setStore('');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to save visit', 'err');
    } finally {
      setSavingVisit(false);
      if (btn) btn.disabled = false;
    }
  };

  const saveIntel = async (btn: HTMLButtonElement | null) => {
    const storeName = intelStoreRef.current?.value.trim() || '';
    const observation = intelNotesRef.current?.value.trim() || '';
    if (!storeName || !observation) {
      showToast('Store and observation are required.', 'err');
      return;
    }
    setSavingIntel(true);
    if (btn) btn.disabled = true;
    try {
      await opsApi.createIntel({
        storeName,
        competitor: intelCompRef.current?.value.trim() || undefined,
        observation,
        severity: 'Medium',
      });
      closeModal('market-intel');
      showToast('Market intelligence saved.', 'ok');
      window.dispatchEvent(new CustomEvent('crm-ops-changed'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to save intel', 'err');
    } finally {
      setSavingIntel(false);
      if (btn) btn.disabled = false;
    }
  };

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
              disabled={savingVisit}
              onClick={(e) => void saveVisit(e.currentTarget)}
            >
              {savingVisit ? 'Saving…' : 'Save & Submit Visit Report'}
            </Button>
          </ModalFooterActions>
        }
      >
        <FRow>
          <FG label="Store *">
            <input
              className="inp"
              list="visit-store-list"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="Store name"
            />
            <datalist id="visit-store-list">
              {recentStores.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </FG>
          <FG label="Store Address">
            <input ref={addressRef} className="inp" placeholder="Address (optional)" />
          </FG>
          <FG label="Category">
            <input ref={categoryRef} className="inp" placeholder="e.g. FMCG-Retail" />
          </FG>
        </FRow>
        <SDivLabel>Sartor Products on Shelf — tick found, enter quantity observed</SDivLabel>
        <div className="checklist-items" style={{ marginBottom: 14 }}>
          {shelfProducts.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--tx3)', padding: 8 }}>No products loaded.</div>
          ) : (
            shelfProducts.map((p) => (
              <div key={p._id} className="check-item">
                <input type="checkbox" />
                <div className="check-item-body">
                  <span className="check-item-name">{productLabel(p)}</span>
                  <div className="check-item-qty">
                    <input className="inp" type="number" placeholder="Qty" min={0} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <FG label="Out-of-Stock Sartor SKUs" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="List any Sartor products that were out of stock" />
        </FG>
        <FG label="Competitor Brands Spotted" full style={{ marginBottom: 10 }}>
          <input ref={competitorsRef} className="inp" placeholder="Competitor brands…" />
        </FG>
        <FG label="General Notes" full style={{ marginBottom: 12 }}>
          <textarea
            ref={notesRef}
            className="ta"
            rows={3}
            placeholder="Store condition, manager feedback, requests…"
          />
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
        title={visit ? `Visit Report — ${visit.storeName}` : 'Visit Report'}
        subtitle={
          visit
            ? `Submitted by ${personName(visit.merchandiser)} · ${formatDate(visit.visitDate || visit.creationDateTime)}`
            : 'Select a visit'
        }
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
        {!visit ? (
          <InfoBanner>No visit selected.</InfoBanner>
        ) : (
          <>
            <InfoBanner variant="succ" icon="clipboard">
              This visit report was submitted by <strong>{personName(visit.merchandiser)}</strong> and is
              visible to <strong>CEO and all Admins</strong>.
            </InfoBanner>
            <div className="g2" style={{ marginBottom: 0 }}>
              <div>
                <SDivLabel style={{ marginTop: 0 }}>Store Information</SDivLabel>
                <IRow label="Store" value={visit.storeName} />
                <IRow label="Address" value={visit.address || '—'} />
                <IRow label="Category" value={visit.category || '—'} />
                <IRow label="Merchandiser" value={personName(visit.merchandiser)} />
                <SDivLabel>Shelf Coverage</SDivLabel>
                <IRow
                  label="Found"
                  value={`${visit.skusFound ?? 0} of ${visit.skusTotal ?? 0} SKUs`}
                />
                <IRow
                  label="Out of Stock"
                  value={
                    <Badge variant={(visit.skusOos ?? 0) > 0 ? 'red' : 'green'}>
                      {(visit.skusOos ?? 0) > 0 ? `${visit.skusOos} OOS` : 'None'}
                    </Badge>
                  }
                />
              </div>
              <div>
                <SDivLabel style={{ marginTop: 0 }}>
                  Shelf Photos ({visit.photoCount ?? 0})
                </SDivLabel>
                <div className="photo-grid">
                  {Array.from({ length: Math.min(visit.photoCount ?? 0, 4) || 0 }).map((_, n) => (
                    <div key={n} className="photo-thumb" style={{ background: 'var(--bg3)', fontSize: 20 }}>
                      <Icon name="image" size={20} />
                    </div>
                  ))}
                  {(visit.photoCount ?? 0) === 0 && (
                    <div style={{ fontSize: 12, color: 'var(--tx3)' }}>No photos attached.</div>
                  )}
                </div>
                <SDivLabel>Competitor Intelligence</SDivLabel>
                <IRow label="Brands Spotted" value={visit.competitors || '—'} />
              </div>
            </div>
            {visit.notes ? (
              <div className="visit-obs-block" style={{ marginTop: 12, borderLeftColor: 'var(--G)' }}>
                <div className="visit-obs-label" style={{ color: 'var(--Gd)' }}>
                  <IconLabel icon="file-text" size={13}>Notes</IconLabel>
                </div>
                {visit.notes}
              </div>
            ) : null}
            <div className="sdiv" />
            <SDivLabel>Store Location</SDivLabel>
            <LocationCardSection context="visit" />
          </>
        )}
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
              disabled={savingIntel}
              onClick={(e) => void saveIntel(e.currentTarget)}
            >
              {savingIntel ? 'Saving…' : 'Save Intel'}
            </Button>
          </ModalFooterActions>
        }
      >
        <FG label="Store *" full style={{ marginBottom: 10 }}>
          <input ref={intelStoreRef} className="inp" placeholder="Store name" />
        </FG>
        <FG label="Competitor Brands Spotted" full style={{ marginBottom: 10 }}>
          <input ref={intelCompRef} className="inp" placeholder="Competitor brands" />
        </FG>
        <FG label="Observation Notes" full>
          <textarea
            ref={intelNotesRef}
            className="ta"
            rows={3}
            placeholder="Pricing, promotions, shelf positioning…"
          />
        </FG>
      </SartorModal>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Badge, Button, DataTable, InfoBanner, Mono, PageHead, QueryState, SearchBar } from '../components/ui';
import { opsApi } from '../api/ops';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useLiveOptions } from '../hooks/useLiveOptions';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatDate, formatNaira } from '../utils/format';
import { lpoStatusVariant } from '../utils/statusBadges';

function leadName(lead: { name?: string } | string | null | undefined) {
  if (!lead) return '—';
  if (typeof lead === 'string') return lead;
  return lead.name || '—';
}

function warehouseIdOf(warehouse: { _id?: string } | string | null | undefined) {
  if (!warehouse) return '';
  if (typeof warehouse === 'string') return warehouse;
  return warehouse._id || '';
}

function warehouseName(warehouse: { name?: string } | string | null | undefined) {
  if (!warehouse) return '—';
  if (typeof warehouse === 'string') return warehouse;
  return warehouse.name || '—';
}

export default function PackLposPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { warehouses } = useLiveOptions();
  const [warehouseId, setWarehouseId] = useState('');
  const { data: rows = [], loading, error, reload } = useApiQuery(() => opsApi.packQueue(), []);

  const { search, setSearch, filtered } = useTableFilter(rows ?? [], '', (row, q) =>
    [row.lpoId, leadName(row.lead), row.status, warehouseName(row.warehouse)].some((v) =>
      String(v || '').toLowerCase().includes(q),
    ),
  );

  useEffect(() => {
    const onChange = () => void reload();
    window.addEventListener('crm-ops-changed', onChange);
    return () => window.removeEventListener('crm-ops-changed', onChange);
  }, [reload]);

  const pack = async (id: string, fromWarehouse?: string) => {
    const warehouse = fromWarehouse || warehouseId;
    if (!warehouse) {
      showToast('Select the warehouse packing this LPO. Stock is deducted from that location only.', 'err');
      return;
    }
    try {
      await opsApi.packLpo(id, warehouse);
      showToast('LPO packed — stock deducted from the selected warehouse.', 'ok');
      void reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Pack failed', 'err');
    }
  };

  return (
    <>
      <PageHead
        icon="package"
        title="Pack LPOs"
        subtitle="Pack from one warehouse at a time. Stock is deducted only from that location."
      />

      <InfoBanner>
        Each warehouse keeps its own inventory. Choose the packing warehouse below — LPOs cannot draw from
        another location’s stock.
      </InfoBanner>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '12px 0', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx2)' }}>Packing warehouse *</label>
        <select
          className="sel"
          style={{ minWidth: 240 }}
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
        >
          <option value="">Select warehouse…</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
              {w.totalUnits != null ? ` · ${w.totalUnits.toLocaleString()} units` : ''}
            </option>
          ))}
        </select>
      </div>

      <SearchBar placeholder="Search LPOs to pack…" value={search} onChange={setSearch} />

      <QueryState
        loading={loading}
        error={error}
        empty={!filtered.length}
        emptyMessage="No LPOs waiting to be packed."
      >
        <DataTable>
          <thead>
            <tr>
              <th>LPO No.</th>
              <th>Customer</th>
              <th>SKUs</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Warehouse</th>
              <th>Assigned</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const assignedWh = warehouseIdOf(r.warehouse);
              return (
                <tr key={r._id}>
                  <td>
                    <Mono style={{ fontSize: 12 }}>{r.lpoId || r._id.slice(-6)}</Mono>
                  </td>
                  <td>{leadName(r.lead)}</td>
                  <td>{r.skuCount ?? 0} SKUs</td>
                  <td>
                    <Mono>{(r.totalQuantity ?? 0).toLocaleString()} units</Mono>
                  </td>
                  <td>
                    <Mono>{formatNaira(r.totalAmount)}</Mono>
                  </td>
                  <td>{warehouseName(r.warehouse)}</td>
                  <td>{formatDate(r.assignedAt || r.creationDateTime)}</td>
                  <td>
                    <Badge variant={lpoStatusVariant(r.status)}>{r.status}</Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button
                        variant="green"
                        size="xs"
                        onClick={() => void pack(r._id, assignedWh || warehouseId)}
                      >
                        Pack LPO
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          openModal('pack-lpo', { lpo: r, warehouseId: assignedWh || warehouseId })
                        }
                      >
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </QueryState>
    </>
  );
}

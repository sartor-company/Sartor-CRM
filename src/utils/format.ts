export function formatNaira(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : Number(value ?? 0);
  if (!Number.isFinite(n)) return '₦0';
  return `₦${Math.round(n).toLocaleString('en-NG')}`;
}

export function formatCompactNaira(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : Number(value ?? 0);
  if (!Number.isFinite(n)) return '₦0';
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return formatNaira(n);
}

export function formatDate(value?: number | string | Date | null): string {
  if (value == null || value === '') return '—';
  const d =
    typeof value === 'number'
      ? new Date(value)
      : typeof value === 'string' && /^\d+$/.test(value)
        ? new Date(Number(value))
        : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatShortDate(value?: number | string | Date | null): string {
  if (value == null || value === '') return '—';
  const d =
    typeof value === 'number'
      ? new Date(value)
      : typeof value === 'string' && /^\d+$/.test(value)
        ? new Date(Number(value))
        : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function num(value: unknown): number {
  const n = typeof value === 'string' ? Number(value) : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

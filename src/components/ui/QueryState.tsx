import { InfoBanner } from './InfoBanner';

export function QueryState({
  loading,
  error,
  empty,
  emptyMessage = 'No records found.',
  children,
}: {
  loading: boolean;
  error: string | null;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div style={{ padding: '28px 8px', textAlign: 'center', color: 'var(--tx3)', fontSize: 13 }}>
        Loading…
      </div>
    );
  }
  if (error) {
    return (
      <InfoBanner variant="err">
        <strong>Could not load data.</strong> {error}
      </InfoBanner>
    );
  }
  if (empty) {
    return (
      <div style={{ padding: '28px 8px', textAlign: 'center', color: 'var(--tx3)', fontSize: 13 }}>
        {emptyMessage}
      </div>
    );
  }
  return <>{children}</>;
}

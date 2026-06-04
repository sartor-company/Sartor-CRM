import type { ReactNode } from 'react';

export function RoleGate({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;
  return <>{children}</>;
}

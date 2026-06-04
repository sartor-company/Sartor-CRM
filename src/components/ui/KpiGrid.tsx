import type { ReactNode } from 'react';

type KpiAccent = 'navy' | 'green' | 'amber' | 'red' | 'purple' | 'teal' | 'blue';

const accentClass: Record<KpiAccent, string> = {
  navy: 'kn',
  green: 'kg',
  amber: 'ka',
  red: 'kr',
  purple: 'kp',
  teal: 'kt',
  blue: 'kb',
};

export function KpiGrid({
  cols = 4,
  children,
  className = '',
}: {
  cols?: 2 | 3 | 4 | 5;
  children: ReactNode;
  className?: string;
}) {
  const colClass = cols === 5 ? 'k5' : cols === 3 ? 'k3' : cols === 2 ? 'k2' : 'k4';
  return <div className={`krow ${colClass} mb ${className}`.trim()}>{children}</div>;
}

export function KpiCard({
  label,
  value,
  trend,
  trendType = 'neutral',
  accent = 'navy',
  smallValue,
}: {
  label: string;
  value: ReactNode;
  trend?: ReactNode;
  trendType?: 'up' | 'down' | 'neutral';
  accent?: KpiAccent;
  smallValue?: boolean;
}) {
  const trendClass = trendType === 'up' ? 'up' : trendType === 'down' ? 'dn' : 'nu';
  return (
    <div className={`kc ${accentClass[accent]}`}>
      <div className="klbl">{label}</div>
      <div className={`kval ${smallValue ? 'kval-s' : ''}`.trim()}>{value}</div>
      {trend && <div className={`ktrend ${trendClass}`}>{trend}</div>}
    </div>
  );
}

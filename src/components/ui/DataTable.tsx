import type { ReactNode } from 'react';

export function DataTable({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <div className="card">
      <div className="tw">
        <table id={id}>{children}</table>
      </div>
    </div>
  );
}

export function Mono({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={className} style={{ fontFamily: "'DM Mono', monospace", ...style }}>
      {children}
    </span>
  );
}

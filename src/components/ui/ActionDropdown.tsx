import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export interface DropdownItem {
  label: ReactNode;
  icon?: IconName;
  onClick: () => void;
  hidden?: boolean;
  danger?: boolean;
}

export function ActionDropdown({ items, label = 'Actions' }: { items: DropdownItem[]; label?: string }) {
  const id = useId().replace(/:/g, '');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const visible = items.filter((i) => !i.hidden);

  return (
    <div className={`dd-wrap ${open ? 'open' : ''}`.trim()} id={id} ref={ref}>
      <button
        type="button"
        className="dd-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        {label}{' '}
        <span className="arr">
          <Icon name="chevron-down" size={12} />
        </span>
      </button>
      <div className="dd-menu">
        {visible.map((item, i) => (
          <div
            key={i}
            className={`dd-item ${item.danger ? 'dd-danger' : ''}`.trim()}
            onClick={() => {
              setOpen(false);
              item.onClick();
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && item.onClick()}
          >
            {item.icon && (
              <span className="ddi">
                <Icon name={item.icon} size={14} />
              </span>
            )}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

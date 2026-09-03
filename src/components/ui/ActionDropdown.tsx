import { createPortal } from 'react-dom';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export interface DropdownItem {
  label: ReactNode;
  icon?: IconName;
  onClick: () => void;
  hidden?: boolean;
  danger?: boolean;
}

const MENU_MIN_WIDTH = 190;
const VIEWPORT_PAD = 8;

export function ActionDropdown({ items, label = 'Actions' }: { items: DropdownItem[]; label?: string }) {
  const id = useId().replace(/:/g, '');
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; openUp: boolean } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const visible = items.filter((i) => !i.hidden);

  const placeMenu = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight || visible.length * 40 + 8;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;
    const spaceAbove = rect.top - VIEWPORT_PAD;
    const openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;
    const width = Math.max(MENU_MIN_WIDTH, rect.width);
    let left = rect.right - width;
    left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - width - VIEWPORT_PAD));
    const top = openUp ? rect.top - menuHeight - 4 : rect.bottom + 4;
    setCoords({ top, left, openUp });
  };

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    placeMenu();
  }, [open, visible.length]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => placeMenu();
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    document.addEventListener('click', close);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('click', close);
    };
  }, [open]);

  return (
    <div className={`dd-wrap ${open ? 'open' : ''}`.trim()} id={id}>
      <button
        type="button"
        className="dd-trigger"
        ref={triggerRef}
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
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className={`dd-menu dd-menu-portal ${coords?.openUp ? 'dd-menu-up' : ''}`.trim()}
            style={{
              position: 'fixed',
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              minWidth: MENU_MIN_WIDTH,
              zIndex: 10000,
              display: 'block',
              visibility: coords ? 'visible' : 'hidden',
            }}
            role="menu"
          >
            {visible.map((item, i) => (
              <div
                key={i}
                className={`dd-item ${item.danger ? 'dd-danger' : ''}`.trim()}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setOpen(false);
                    item.onClick();
                  }
                }}
              >
                {item.icon && (
                  <span className="ddi">
                    <Icon name={item.icon} size={14} />
                  </span>
                )}
                {item.label}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

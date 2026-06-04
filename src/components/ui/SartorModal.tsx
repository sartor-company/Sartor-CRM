import type { ReactNode } from 'react';
import type { ModalId } from '../../types';
import type { IconName } from '../../types/icons';
import { Icon } from './Icon';

type ModalSize = 'default' | 'narrow' | 'wide' | 'xwide';

export function SartorModal({
  id,
  open,
  onClose,
  title,
  icon,
  subtitle,
  size = 'default',
  children,
  footer,
}: {
  id: ModalId;
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  icon?: IconName;
  subtitle?: ReactNode;
  size?: ModalSize;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;

  const sizeClass =
    size === 'wide' ? 'wide' : size === 'narrow' ? 'narrow' : size === 'xwide' ? 'xwide' : '';

  return (
    <div className="modal-bg on" id={`modal-${id}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={`modal ${sizeClass}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mh">
          <div>
            <div className="mh-t">
              {icon && <Icon name={icon} size={18} className="mh-ico" style={{ marginRight: 8, verticalAlign: 'middle' }} />}
              {title}
            </div>
            {subtitle && <div className="mh-sub">{subtitle}</div>}
          </div>
          <button type="button" className="mx" onClick={onClose} aria-label="Close">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="mb">{children}</div>
        {footer && <div className="mf">{footer}</div>}
      </div>
    </div>
  );
}

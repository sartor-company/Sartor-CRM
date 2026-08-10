import { useCallback, type ReactNode } from 'react';
import { useModal } from '../context/ModalContext';
import { useSubmitForm, useToast } from '../context/ToastContext';
import type { ModalId } from '../types';
import { Button } from '../components/ui/Button';
import { IconLabel } from '../components/ui/Icon';

export function FG({
  label,
  children,
  full,
  className = '',
  style,
}: {
  label?: ReactNode;
  children: ReactNode;
  full?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`fg ${full ? 'full' : ''} ${className}`.trim()} style={style}>
      {label && <label>{label}</label>}
      {children}
    </div>
  );
}

export function FRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`frow ${className}`.trim()}>{children}</div>;
}

export function SDivLabel({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="sdiv-label" style={style}>
      {children}
    </div>
  );
}

export function IRow({
  label,
  children,
  value,
}: {
  label: string;
  children?: ReactNode;
  value?: ReactNode;
}) {
  return (
    <div className="irow">
      <span className="ilbl">{label}</span>
      <span className="ival">{children ?? value}</span>
    </div>
  );
}

export function UploadBtn({ label }: { label?: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label className="btn bsec bsm" style={{ cursor: 'pointer', margin: 0 }}>
        {label ?? <IconLabel icon="paperclip" size={13}>Upload</IconLabel>}
        <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" />
      </label>
      <span style={{ fontSize: 11, color: 'var(--tx3)' }}>Optional</span>
    </div>
  );
}

export function ModalFooterActions({
  onCancel,
  cancelLabel = 'Cancel',
  children,
}: {
  onCancel: () => void;
  cancelLabel?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Button variant="secondary" onClick={onCancel}>
        {cancelLabel}
      </Button>
      {children}
    </>
  );
}

export function useModalActions() {
  const { isOpen, closeModal, openModal, getPayload } = useModal();
  const submitForm = useSubmitForm();
  const { showToast } = useToast();

  const handleSubmit = useCallback(
    (modalId: ModalId, btn: HTMLButtonElement | null, msg: string, onDone?: () => void) => {
      submitForm(btn, msg, () => {
        closeModal(modalId);
        onDone?.();
      });
    },
    [submitForm, closeModal],
  );

  return { isOpen, closeModal, openModal, getPayload, submitForm, showToast, handleSubmit };
}

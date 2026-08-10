import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ModalId } from '../types';

export type ModalPayload = Record<string, unknown> | null;

interface ModalContextValue {
  openModal: (id: ModalId, payload?: ModalPayload) => void;
  closeModal: (id: ModalId) => void;
  isOpen: (id: ModalId) => boolean;
  getPayload: <T extends ModalPayload = ModalPayload>(id: ModalId) => T;
  closeAll: () => void;
  hasOpen: boolean;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Set<ModalId>>(new Set());
  const [payloads, setPayloads] = useState<Partial<Record<ModalId, ModalPayload>>>({});

  const openModal = useCallback((id: ModalId, payload: ModalPayload = null) => {
    setOpen((prev) => new Set(prev).add(id));
    setPayloads((prev) => ({ ...prev, [id]: payload }));
  }, []);

  const closeModal = useCallback((id: ModalId) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setPayloads((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const isOpen = useCallback((id: ModalId) => open.has(id), [open]);
  const getPayload = useCallback(
    <T extends ModalPayload = ModalPayload>(id: ModalId) => (payloads[id] ?? null) as T,
    [payloads],
  );
  const closeAll = useCallback(() => {
    setOpen(new Set());
    setPayloads({});
  }, []);
  const hasOpen = open.size > 0;

  const value = useMemo(
    () => ({ openModal, closeModal, isOpen, getPayload, closeAll, hasOpen }),
    [openModal, closeModal, isOpen, getPayload, closeAll, hasOpen],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

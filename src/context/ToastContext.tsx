import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Icon, type IconName } from '../components/ui/Icon';

type ToastType = 'ok' | 'warn' | 'err';

interface ToastState {
  msg: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (msg: string, type?: ToastType) => void;
}

const toastIcon: Record<ToastType, IconName> = {
  ok: 'check',
  warn: 'alert',
  err: 'x',
};

const toastBg: Record<ToastType, string> = {
  ok: '#007A2D',
  warn: '#F59E0B',
  err: '#EF4444',
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastView({ toast, onDone }: { toast: ToastState; onDone: () => void }) {
  return createPortal(
    <div
      className="sartor-toast"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: toastBg[toast.type],
        color: '#fff',
        padding: '10px 18px',
        borderRadius: 9,
        fontSize: 13,
        fontWeight: 600,
        zIndex: 9999,
        boxShadow: '0 4px 20px rgba(0,0,80,.35)',
        pointerEvents: 'none',
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        maxWidth: 'calc(100vw - 32px)',
      }}
      onTransitionEnd={(e) => {
        if (e.propertyName === 'opacity' && (e.target as HTMLElement).style.opacity === '0') onDone();
      }}
    >
      <Icon name={toastIcon[toast.type]} size={16} strokeWidth={2.5} />
      <span>{toast.msg}</span>
    </div>,
    document.body,
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((msg: string, type: ToastType = 'ok') => {
    setToast({ msg, type });
    const t = setTimeout(() => {
      const el = document.querySelector('.sartor-toast') as HTMLElement | null;
      if (el) el.style.opacity = '0';
      else setToast(null);
    }, 2600);
    return () => clearTimeout(t);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const value = useMemo(() => ({ showToast }), [showToast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && <ToastView toast={toast} onDone={clearToast} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

/** Hook for components that only need submit feedback */
export function useSubmitForm() {
  const { showToast } = useToast();
  return useCallback(
    (btn: HTMLButtonElement | null, msg: string, onDone?: () => void) => {
      if (!btn) return;
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Saving…';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = orig;
        onDone?.();
        setTimeout(() => showToast(msg, 'ok'), 80);
      }, 500);
    },
    [showToast],
  );
}

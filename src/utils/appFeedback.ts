type ToastType = 'ok' | 'warn' | 'err' | 'success' | 'error';
type ToastFn = (msg: string, type?: ToastType) => void;

let toastFn: ToastFn | null = null;

export function registerToast(fn: ToastFn) {
  toastFn = fn;
}

export function unregisterToast(fn?: ToastFn) {
  if (!fn || toastFn === fn) toastFn = null;
}

export function appToast(msg: string, type: ToastType = 'warn') {
  if (!toastFn) return;
  const mapped =
    type === 'success' ? 'ok' : type === 'error' ? 'err' : type === 'ok' || type === 'warn' || type === 'err' ? type : 'warn';
  toastFn(msg, mapped);
}

export function notifySessionExpired(serverMessage?: string) {
  const msg =
    (typeof serverMessage === 'string' && serverMessage.trim()) ||
    'Your session has expired. Please sign in again.';
  appToast(msg, 'warn');
  return msg;
}

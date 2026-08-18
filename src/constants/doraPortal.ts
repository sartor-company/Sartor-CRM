const DEFAULT_DORA_ADMIN_URL = 'https://admin.dorascan.ai';

export const DORA_ADMIN_ORIGIN = (
  import.meta.env.VITE_DORA_ADMIN_URL || DEFAULT_DORA_ADMIN_URL
).replace(/\/$/, '');

export function doraAdminUrl(path = '/'): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${DORA_ADMIN_ORIGIN}${p}`;
}

export const DORA_HOME = doraAdminUrl('/');
export const DORA_STICKER_ORDERS = doraAdminUrl('/sticker-orders');
export const DORA_OWNER_SETTINGS = doraAdminUrl('/owner/settings');
export const DORA_CREDITS = DORA_OWNER_SETTINGS;
export const DORA_VERIFICATION_DOMAIN = DORA_OWNER_SETTINGS;

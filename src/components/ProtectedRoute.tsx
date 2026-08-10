import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { mapLoginToProfile } from '../utils/mapAuth';

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const setSessionChecked = useAuthStore((s) => s.setSessionChecked);
  const [checking, setChecking] = useState(!sessionChecked && Boolean(token));

  useEffect(() => {
    if (!token) {
      setSessionChecked(true);
      setChecking(false);
      return;
    }
    if (sessionChecked) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const account = await authApi.getAccount();
        const existing = useAuthStore.getState().user;
        const merged = mapLoginToProfile({
          ...account,
          accountType: existing?.accountType ?? (account.accountType as string) ?? 'admin',
          token,
          tenantName: existing?.companyName,
        });
        if (!cancelled) setAuth({ ...merged, token });
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) {
          setSessionChecked(true);
          setChecking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, sessionChecked, setAuth, logout, setSessionChecked]);

  if (!token) return <Navigate to="/login" replace />;
  if (checking) {
    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '100vh',
          color: 'var(--tx3)',
          background: 'var(--bg)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Validating session…
      </div>
    );
  }
  return <Outlet />;
}

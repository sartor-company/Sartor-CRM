import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import { defaultPathForRole } from '../constants/routes';
import { useAuthStore } from '../store/authStore';
import { getRememberedEmail, setRememberedEmail } from '../store/authStorage';
import { mapLoginToProfile } from '../utils/mapAuth';
import { appToast } from '../utils/appFeedback';

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('session') === 'expired';
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState(() => getRememberedEmail());
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => Boolean(getRememberedEmail()));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionExpired) {
      useAuthStore.getState().logout();
      appToast('Your session has expired. Please sign in again.', 'warn');
    }
  }, [sessionExpired]);

  useEffect(() => {
    if (sessionExpired) return;
    if (token && user?.crmRole) {
      navigate(defaultPathForRole(user.crmRole), { replace: true });
    }
  }, [token, user?.crmRole, navigate, sessionExpired]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(email.trim(), password);
      if (data.accountType === 'sartor') {
        setError('Platform staff should use the Sartor Super Admin console.');
        return;
      }
      if (data.accountType !== 'admin' && data.accountType !== 'user') {
        setError('Use your Sartor CRM client account (owner or team member).');
        return;
      }
      const profile = mapLoginToProfile(data);
      setAuth(profile, rememberMe);
      setRememberedEmail(rememberMe ? email.trim() : null);
      navigate(defaultPathForRole(profile.crmRole), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-hero" aria-hidden="true">
        <div className="login-hero-bg" />
        <div className="login-hero-overlay" />
        <div className="login-hero-glow" />
        <div className="login-hero-content">
          <div className="login-hero-brand">
            <img
              className="login-hero-mark brand-logo"
              src="/sartor-logo.jpg"
              alt=""
              width={40}
              height={40}
            />
            <span>SartorCRM</span>
          </div>
          <h1 className="login-hero-title">
            Sell. Fulfil.
            <br />
            <em>Collect.</em> Repeat.
          </h1>
          <p className="login-hero-sub">
            Sales pipeline, LPOs, inventory, finance, deliveries, and field intelligence — one console for your
            distribution team.
          </p>
          <div className="login-hero-pills">
            <span>Pipeline &amp; LPOs</span>
            <span>Inventory &amp; GRN</span>
            <span>Finance &amp; field</span>
          </div>
        </div>
      </aside>

      <main className="login-panel">
        <div className="login-mobile-brand">
          <img className="login-hero-mark brand-logo" src="/sartor-logo.jpg" alt="" width={36} height={36} />
          <span>SartorCRM</span>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <p className="login-panel-kicker">crm.sartor.ng</p>
          <h2 className="login-panel-title">Welcome back</h2>
          <p className="login-panel-sub">Sign in as account owner or invited team member.</p>

          {sessionExpired && (
            <div className="login-warn">Your session has expired. Please sign in again to continue.</div>
          )}

          {error && <div className="login-error">{error}</div>}

          <label className="login-field">
            <span>Work email</span>
            <input
              className="login-inp"
              type="email"
              placeholder="you@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <div className="login-pw-wrap">
              <input
                className="login-inp"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </label>

          <label className="login-remember">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            <span>Remember me</span>
          </label>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in to SartorCRM'}
          </button>

          <p className="login-footer">
            Need access or forgot your password? Contact your account owner or{' '}
            <a href="mailto:support@sartor.ng">support@sartor.ng</a>.
          </p>
        </form>
      </main>
    </div>
  );
}

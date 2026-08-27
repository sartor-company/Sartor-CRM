import { Card, CardHeader, InfoBanner, PageHead, KpiGrid, KpiCard } from '../components/ui';
import { SartorChainUpgrade } from '../components/SartorChainUpgrade';
import {
  DORA_CREDITS,
  DORA_HOME,
  DORA_STICKER_ORDERS,
  DORA_VERIFICATION_DOMAIN,
} from '../constants/doraPortal';
import { useAuthStore } from '../store/authStore';
import { canUseSartorChain } from '../utils/sartorChain';

function PortalLink({ href, children, className }: { href: string; children: string; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className || 'btn bgrn bsm'}>
      {children}
    </a>
  );
}

export default function Sartor360Page() {
  const user = useAuthStore((s) => s.user);

  if (!canUseSartorChain(user)) {
    return <SartorChainUpgrade feature="Sartor-Chain + DORA" />;
  }

  const batch = user?.batchCalCredits ?? 0;
  const pins = user?.pinCredits ?? 0;
  const sms = user?.smsCredits ?? 0;
  const domain = user?.verifyDomain || 'verify.dorascan.ai';

  return (
    <>
      <PageHead icon="link" title="Sartor-Chain & DORA AI" />

      <InfoBanner variant="succ">
        <strong>Sartor-Chain + DORA is included on this account.</strong> Sticker orders,
        authentication credits, and verification domain are managed in the Sartor-Chain & DORA AI
        Client Admin portal — not in CRM.
      </InfoBanner>

      <div
        className="sartor360-row"
        style={{
          background: 'var(--N)',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: 'rgba(255,255,255,.45)',
              textTransform: 'uppercase',
              letterSpacing: '.7px',
              marginBottom: 4,
            }}
          >
            Advanced Controls
          </div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 6,
              fontFamily: "'Fraunces',serif",
            }}
          >
            Sartor-Chain & DORA AI Client Admin
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>
            Full batch management, DORA AI dashboard, sticker orders, authentication credits,
            verification domain, investigation queue, and gift campaigns.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <a
            href={DORA_HOME}
            target="_blank"
            rel="noreferrer"
            className="btn bgrn"
            style={{ fontSize: 13, padding: '10px 20px' }}
          >
            Open Sartor-Chain & DORA Admin ↗
          </a>
          <a
            href={`https://${domain}`}
            target="_blank"
            rel="noreferrer"
            className="btn bout bsm"
            style={{ color: 'rgba(255,255,255,.7)', borderColor: 'rgba(255,255,255,.2)', textAlign: 'center' }}
          >
            Preview Consumer Verify Page ↗
          </a>
        </div>
      </div>

      <div className="g2">
        <Card>
          <CardHeader title="Authentication Credits" />
          <KpiGrid cols={3}>
            <KpiCard
              label="Batch Calibration"
              value={batch.toLocaleString()}
              trend="credits remaining"
              accent="green"
            />
            <KpiCard
              label="PIN Authentication"
              value={pins.toLocaleString()}
              trend="credits remaining"
              accent="blue"
            />
            <KpiCard
              label="Communication Credits"
              value={sms.toLocaleString()}
              trend={sms < 1000 ? 'Consider topping up' : 'SMS + email remaining'}
              accent={sms < 1000 ? 'amber' : 'green'}
            />
          </KpiGrid>
          <p style={{ fontSize: 12, color: 'var(--tx3)', margin: '12px 0 10px', lineHeight: 1.5 }}>
            Buy and manage PIN, communication, and batch-calibration credits in Sartor-Chain + DORA.
          </p>
          <PortalLink href={DORA_CREDITS}>Manage credits in Sartor-Chain + DORA ↗</PortalLink>
        </Card>
        <Card>
          <CardHeader title="Verification Domain" />
          <div style={{ padding: '10px 13px', background: 'var(--Gb)', borderRadius: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--Gd)', marginBottom: 2 }}>
              ✓ Active: {domain}
            </div>
            <div style={{ fontSize: 11, color: 'var(--Gd)' }}>Consumer QR scans route here</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 10, lineHeight: 1.5 }}>
            Branded subdomain and enterprise CNAME upgrades are handled in the Sartor-Chain + DORA
            portal (Owner Settings).
          </div>
          <PortalLink href={DORA_VERIFICATION_DOMAIN} className="btn bout bsm">
            Manage verification domain ↗
          </PortalLink>
        </Card>
      </div>

      <Card style={{ marginTop: 16 }}>
        <CardHeader title="Sticker Orders" />
        <p style={{ fontSize: 13, color: 'var(--tx3)', lineHeight: 1.6, marginBottom: 12 }}>
          Security sticker ordering, tracking, linking, and activation live in Sartor-Chain + DORA —
          alongside products, batches, and PINs.
        </p>
        <PortalLink href={DORA_STICKER_ORDERS}>Open Sticker Orders ↗</PortalLink>
      </Card>
    </>
  );
}

import { Card, CardHeader, InfoBanner, PageHead, Button, KpiGrid, KpiCard } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { formatNaira, usePaymentIntent } from '../context/PaymentIntentContext';
import { useAuthStore } from '../store/authStore';

export default function Sartor360Page() {
  const { openModal } = useModal();
  const { setIntent } = usePaymentIntent();
  const user = useAuthStore((s) => s.user);

  const batch = user?.batchCalCredits ?? 0;
  const pins = user?.pinCredits ?? 0;
  const sms = user?.smsCredits ?? 0;
  const domain = user?.verifyDomain || 'verify.dorascan.ai';

  const buyCredits = () => {
    setIntent({
      amountNaira: 150_000,
      amountLabel: formatNaira(150_000),
      description: 'Authentication Credits Top-up',
      reference: 'PIN + SMS credit pack',
    });
    openModal('payment-gateway');
  };

  return (
    <>
      <PageHead icon="link" title="Sartor-Chain & DORA AI" />

      <InfoBanner variant="succ">
        <strong>Sartor CRM 360 Active.</strong> Your subscription includes full Sartor-Chain authentication, DORA AI
        visual fingerprinting, Gift Engine, and direct access to the Sartor-Chain & DORA AI Client Admin portal — your
        products and batches are pre-populated there based on your tier, credits and payment status.
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
            Full batch management, DORA AI dashboard, investigation queue, gift campaigns, and authentication analytics.
            Products and batches from this account are automatically pre-populated.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <a
            href="https://admin.dorascan.ai"
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
              label="SMS Notifications"
              value={sms.toLocaleString()}
              trend={sms < 1000 ? 'Consider topping up' : 'credits remaining'}
              accent={sms < 1000 ? 'amber' : 'green'}
            />
          </KpiGrid>
          <div style={{ marginTop: 12 }}>
            <Button variant="green" size="sm" onClick={buyCredits}>
              + Buy Credits
            </Button>
          </div>
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
            Upgrade to a branded domain for white-label verification. Growth subdomain (₦100,000 one-time) or Enterprise
            CNAME (₦150,000 setup + ₦200,000/yr).
          </div>
          <Button variant="outline" size="sm" onClick={() => openModal('domain-upgrade')}>
            Upgrade Domain
          </Button>
        </Card>
      </div>
    </>
  );
}

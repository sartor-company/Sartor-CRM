import { PageHead, Button } from './ui';
import { useModal } from '../context/ModalContext';
import { useApp } from '../context/AppContext';
import { TIER_LABELS } from '../constants/tiers';

export function SartorChainUpgrade({ feature }: { feature: string }) {
  const { openModal } = useModal();
  const { isCeo, tier } = useApp();

  return (
    <>
      <PageHead icon="link" title={feature} />
      <div
        style={{
          maxWidth: 560,
          margin: '40px auto',
          textAlign: 'center',
          padding: 32,
          background: 'var(--bg)',
          border: '1px solid var(--brd)',
          borderRadius: 12,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
        <h3
          style={{
            fontFamily: "'Fraunces',serif",
            fontSize: 18,
            color: 'var(--N)',
            marginBottom: 8,
          }}
        >
          Included with Sartor CRM 360
        </h3>
        <p style={{ fontSize: 13, color: 'var(--tx3)', lineHeight: 1.6, marginBottom: 8 }}>
          <strong>{feature}</strong> is part of Sartor-Chain + DORA AI — sticker orders,
          authentication credits, and verification domain. Your current plan is{' '}
          <strong>{TIER_LABELS[tier]}</strong>, which does not include these features.
        </p>
        <p style={{ fontSize: 13, color: 'var(--tx3)', lineHeight: 1.6, marginBottom: 16 }}>
          Upgrade to <strong>Sartor CRM 360</strong> to use them in the Sartor-Chain + DORA
          Admin portal.
        </p>
        {isCeo ? (
          <Button variant="green" onClick={() => openModal('change-plan')}>
            Upgrade to CRM 360
          </Button>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--tx3)', margin: 0 }}>
            Ask your account owner to upgrade this workspace to Sartor CRM 360.
          </p>
        )}
      </div>
    </>
  );
}

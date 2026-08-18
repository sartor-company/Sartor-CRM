import { useEffect } from 'react';
import { PageHead } from '../components/ui';
import { SartorChainUpgrade } from '../components/SartorChainUpgrade';
import { DORA_STICKER_ORDERS } from '../constants/doraPortal';
import { useAuthStore } from '../store/authStore';
import { canUseSartorChain } from '../utils/sartorChain';

export default function StickerOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const allowed = canUseSartorChain(user);

  useEffect(() => {
    if (!allowed) return;
    window.location.assign(DORA_STICKER_ORDERS);
  }, [allowed]);

  if (!allowed) {
    return <SartorChainUpgrade feature="Sticker orders" />;
  }

  return (
    <>
      <PageHead icon="qr-code" title="Sticker Orders" />
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
        <h3
          style={{
            fontFamily: "'Fraunces',serif",
            fontSize: 18,
            color: 'var(--N)',
            marginBottom: 8,
          }}
        >
          Opening Sartor-Chain + DORA
        </h3>
        <p style={{ fontSize: 13, color: 'var(--tx3)', lineHeight: 1.6, marginBottom: 16 }}>
          Sticker ordering, tracking, and activation live in the Sartor-Chain + DORA Admin portal.
        </p>
        <a href={DORA_STICKER_ORDERS} className="btn bpri">
          Continue to Sticker Orders →
        </a>
      </div>
    </>
  );
}

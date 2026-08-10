import { useNavigate } from 'react-router-dom';
import { Button, PageHead } from '../components/ui';

export default function StickerOrdersPage() {
  const navigate = useNavigate();

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
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔗</div>
        <h3
          style={{
            fontFamily: "'Fraunces',serif",
            fontSize: 18,
            color: 'var(--N)',
            marginBottom: 8,
          }}
        >
          Sticker Orders have moved
        </h3>
        <p style={{ fontSize: 13, color: 'var(--tx3)', lineHeight: 1.6, marginBottom: 16 }}>
          Security sticker ordering, tracking, and activation now live in the{' '}
          <strong>Sartor-Chain & DORA AI Client Admin</strong> — alongside your products, batches, PINs, and
          authentication credits. This keeps all authentication operations in one place.
        </p>
        <a href="https://admin.dorascan.ai" target="_blank" rel="noreferrer" className="btn bpri">
          Go to Sartor-Chain & DORA AI Admin →
        </a>
        <div style={{ marginTop: 12 }}>
          <Button variant="secondary" size="sm" onClick={() => navigate('/sartor360')}>
            View credits & domain in CRM →
          </Button>
        </div>
      </div>
    </>
  );
}

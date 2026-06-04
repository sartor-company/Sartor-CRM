import { Card, CardHeader, InfoBanner, PageHead } from '../components/ui';

export default function Sartor360Page() {
  return (
    <>
      <PageHead icon="link" title="SartorChain + DORA AI" />

      <InfoBanner variant="succ">
        <strong>CRM 360 Active.</strong> Includes SartorChain authentication, DORA AI visual fingerprinting, and Gift
        Engine.
      </InfoBanner>

      <div className="g2">
        <Card>
          <CardHeader title="SartorChain Platform" />
          <p style={{ fontSize: 13, color: 'var(--tx3)', marginBottom: 14, lineHeight: 1.6 }}>
            Authentication campaigns, gift engine, supply chain tracking.
          </p>
          <a href="https://dorascan.ai" target="_blank" rel="noreferrer" className="btn bpri bsm">
            Open SartorChain →
          </a>
        </Card>
        <Card>
          <CardHeader title="DORA AI Authentication" />
          <p style={{ fontSize: 13, color: 'var(--tx3)', marginBottom: 14, lineHeight: 1.6 }}>
            Consumer-facing product verification and scan analytics.
          </p>
          <a href="https://verify.dorascan.ai" target="_blank" rel="noreferrer" className="btn bsec bsm">
            Open DORA Scan →
          </a>
        </Card>
      </div>
    </>
  );
}

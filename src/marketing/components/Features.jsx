import React, { useEffect, useRef } from 'react';

const Features = () => {
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (headerRef.current) observer.observe(headerRef.current);
    if (gridRef.current) observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    { title: 'Sales Management', desc: 'Full pipeline management from first contact to closed deal. Custom stages, LPO creation, payment tracking, and commission automation — all linked back to individual reps and territories.', icon: 'Sales', color: 'orange' },
    { title: 'Inventory Management', desc: 'Real-time stock levels across every warehouse location. Predictive restocking alerts, warehouse-to-driver sync, and full batch-level traceability across your entire distribution network.', icon: 'Inventory', color: 'blue' },
    { title: 'Lead Generation', desc: 'AI-powered customer segmentation and territory mapping, geotagged visit logging, and automated follow-up reminders. Accelerate market entry into new territories with a structured pipeline from day one.', icon: 'Lead', color: 'purple' },
    { title: 'Merchandising & HCP Tools', desc: 'Merchandisers capture real shelf data — photos, stock counts, competitor pricing — with geotagging. Medical reps log HCP visits, sample distributions, and compliance submissions from any device.', icon: 'Merch', color: 'green', badgeType: 'exclusive' },
    { title: 'Driver & Delivery Tracking', desc: 'One-time delivery codes sent to customers at dispatch. Drivers confirm at the door. LPOs close automatically, chain of custody is recorded, and commissions are triggered — no paper, no disputes.', icon: 'Driver', color: 'orange' },
    { title: 'Sartor-Chain Verification', desc: 'Every product batch is registered on SartorChain at the point of creation. Each unit carries a cryptographically anchored identity that travels with it through every node — from warehouse to retail shelf.', icon: 'Chain', color: 'green', badge: 'Exclusive', badgeType: 'exclusive' },
    { title: 'DORA AI Authentication', desc: 'Consumers scan any product and DORA returns an authenticity verdict in under 2 seconds. Every scan feeds back to you as real-time market intelligence — where your products are verified and where fakes are showing up.', icon: 'AI', color: 'green', badge: 'AI-Powered', badgeType: 'ai' },
    { title: 'Advanced Reporting', desc: 'Sales forecasting, inventory analytics, scan heatmaps, field team performance scoring, and counterfeit incident reports — all in one dashboard. Data that shows you where to push next, not just where you\'ve been.', icon: 'Report', color: 'blue' },
  ];

  return (
    <section id="features" className="px-[5%] py-[100px]">
      <div ref={headerRef} className="reveal max-w-[600px] mb-16">
        <div className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--orange)] mb-4">
          <div className="w-5 h-[2px] bg-[var(--orange)] rounded-sm"></div>
          Platform Modules
        </div>
        <h2 className="font-syne text-[clamp(28px,4vw,46px)] font-extrabold tracking-[-0.03em] leading-[1.1] mb-4 text-[var(--white)]">Eight modules.<br />One operating system.</h2>
        <p className="text-[17px] text-[var(--text-muted)] leading-relaxed">
          CRM 360 covers every layer — from sales pipeline to product authentication — with no third-party integrations required.
        </p>
      </div>

      <div ref={gridRef} className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[var(--border)] rounded-radius-lg overflow-hidden border border-[var(--border)]">
        {features.map((f, i) => (
          <div key={i} className="bg-[var(--navy)] [data-theme='light']:bg-[var(--navy-mid)] p-8 group relative overflow-hidden transition-colors duration-220 hover:bg-[var(--navy-mid)] [data-theme='light']:hover:bg-[var(--navy-light)]">
            <div className="absolute top-0 left-0 w-[3px] h-0 bg-[var(--orange)] group-hover:h-full transition-all duration-300"></div>
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-5 ${
              f.color === 'orange' ? 'bg-[var(--orange)]/12' : 
              f.color === 'blue' ? 'bg-[#388BFF]/12' : 
              f.color === 'purple' ? 'bg-[#8E50FF]/12' : 'bg-[var(--green)]/12'
            }`}>
              <FeatureIcon type={f.icon} color={f.color} />
            </div>
            <div className="font-syne text-[17px] font-bold mb-2.5 tracking-[-0.01em] text-[var(--white)]">{f.title}</div>
            <p className="text-[14px] text-[var(--text-muted)] leading-[1.7]">{f.desc}</p>
            {f.badge && (
              <div className={`inline-flex items-center gap-1.5 mt-3.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider border ${
                f.badgeType === 'exclusive' ? 'bg-[var(--orange)]/12 text-[var(--orange)] border-[var(--orange)]/25' : 'bg-[var(--green)]/12 text-[var(--green)] border-[var(--green)]/25'
              }`}>
                {f.badge}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const FeatureIcon = ({ type, color }) => {
  const strokeColor = color === 'orange' ? 'var(--orange)' : color === 'blue' ? '#388BFF' : color === 'purple' ? '#8E50FF' : 'var(--green)';
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
      {type === 'Sales' && <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>}
      {type === 'Inventory' && <><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/></>}
      {type === 'Lead' && <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}
      {type === 'Merch' && <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></>}
      {type === 'Driver' && <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>}
      {type === 'Chain' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
      {type === 'AI' && <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/></>}
      {type === 'Report' && <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>}
    </svg>
  );
};

export default Features;

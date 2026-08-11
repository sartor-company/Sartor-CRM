import React, { useEffect, useRef } from 'react';

const ValuePillars = () => {
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

  const pillars = [
    {
      num: '01',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF5C35" strokeWidth="2">
          <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
      title: 'Supply Chain Visibility',
      desc: 'Track every product unit from factory floor to consumer hands. Know exactly where stock sits, who moved it, and when — at every node in your distribution chain.',
      tags: ['Batch tracking', 'LPO management', 'Delivery confirmation'],
      bgColor: 'rgba(255,92,53,0.12)'
    },
    {
      num: '02',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#388BFF" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      title: 'Field Team Oversight',
      desc: 'Get a real-time view of your sales reps and merchandisers. See who visited which outlet, what was logged, and what your shelf presence actually looks like — not what was reported.',
      tags: ['Rep activity', 'Geotagged visits', 'HCP engagement'],
      bgColor: 'rgba(56,139,255,0.12)'
    },
    {
      num: '03',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1DB87A" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      title: 'Product Protection',
      desc: 'SartorChain registers every batch with a cryptographic identity. DORA AI authenticates products in under 2 seconds — giving consumers certainty and giving you a live intelligence feed on where fakes appear.',
      tags: ['SartorChain', 'DORA AI', 'Fraud detection'],
      bgColor: 'rgba(29,184,122,0.12)'
    },
    {
      num: '04',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFBC35" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><polyline points="22 14 18 10 14 14"/>
        </svg>
      ),
      title: 'Market & Customer Intelligence',
      desc: 'Consumer scan patterns, competitor shelf reports, and sales forecasting combine to show you where demand is, where your brand is weak, and where your next market entry opportunity lies.',
      tags: ['Scan analytics', 'Market insights', 'Behaviour data'],
      bgColor: 'rgba(255,188,53,0.12)'
    }
  ];

  return (
    <section className="bg-[var(--navy-mid)] border-y border-[var(--border)] px-[5%] py-[100px]">
      <div 
        ref={headerRef}
        className="reveal grid grid-cols-1 lg:grid-cols-2 gap-20 items-end mb-16"
      >
        <div>
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--orange)] mb-4">
            <div className="w-5 h-[2px] bg-[var(--orange)] rounded-sm"></div>
            What Sartor CRM Does
          </div>
          <h2 className="font-syne text-[clamp(28px,4vw,46px)] font-extrabold tracking-[-0.03em] leading-[1.1] text-[var(--white)]">Four problems.<br />One platform.</h2>
        </div>
        <p className="text-[17px] text-[var(--text-muted)] leading-relaxed">
          Most tools solve one layer. Sartor CRM connects supply chain visibility, field oversight, product protection, and market intelligence into a single operating system for your brand.
        </p>
      </div>

      <div 
        ref={gridRef}
        className="reveal grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[var(--border)] rounded-radius-lg overflow-hidden border border-[var(--border)]"
      >
        {pillars.map((p, i) => (
          <div key={i} className="bg-[var(--navy-mid)] p-[44px_40px] relative overflow-hidden group hover:bg-[var(--navy-light)] transition-colors duration-220">
            <div className="font-syne text-[72px] font-extrabold text-[rgba(255,255,255,0.04)] [data-theme='light']:text-[rgba(11,22,64,0.05)] absolute top-3 right-5 leading-none tracking-[-0.04em] pointer-events-none group-hover:text-[rgba(255,255,255,0.08)] [data-theme='light']:group-hover:text-[rgba(11,22,64,0.08)] transition-colors">
              {p.num}
            </div>
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-[22px] mb-6"
              style={{ backgroundColor: p.bgColor }}
            >
              {p.icon}
            </div>
            <div className="font-syne text-[22px] font-extrabold tracking-[-0.02em] mb-3 leading-[1.2] text-[var(--white)]">
              {p.title}
            </div>
            <p className="text-[15px] text-[var(--text-muted)] leading-[1.75] mb-5">
              {p.desc}
            </p>
            <div className="flex flex-wrap gap-2">
              {p.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-[var(--card-bg)] border border-[var(--border-light)] rounded-full text-[12px] font-medium text-[var(--text-mid)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ValuePillars;

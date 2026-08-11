import React, { useEffect, useRef } from 'react';

const HowItWorks = () => {
  const elementsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elementsRef.current.forEach(el => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Register your product',
      desc: 'At production, every batch is registered on SartorChain. Each unit receives a QR-linked identity enrolled in DORA AI. From this point, the product\'s identity travels with it through every node in the chain.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5C35" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      bgColor: 'rgba(255,92,53,0.12)'
    },
    {
      num: '02',
      title: 'Track it through the chain',
      desc: 'As stock moves from warehouse to distributor to retailer, every transaction is recorded. Sales reps log visits. Drivers confirm delivery with one-time codes. Merchandisers capture shelf reality. Every node is logged, timestamped, and attributed.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#388BFF" strokeWidth="2">
          <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
      bgColor: 'rgba(56,139,255,0.12)'
    },
    {
      num: '03',
      title: 'Gain market intelligence',
      desc: 'Consumer scans become market data. Where your products are verified, where counterfeits appear, which reps perform, which territories have demand — every interaction in the chain becomes a signal you can act on.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1DB87A" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ),
      bgColor: 'rgba(29,184,122,0.12)'
    }
  ];

  return (
    <section style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }} className="border-y px-[5%] py-[100px]" id="how">
      <div className="reveal" ref={el => elementsRef.current[0] = el}>
        <div className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-orange mb-4">
          <div className="w-5 h-[2px] bg-orange rounded-sm"></div>
          How It Works
        </div>
        <h2 className="font-syne text-[clamp(28px,4vw,46px)] font-extrabold tracking-[-0.03em] leading-[1.1] mb-4" style={{ color: 'var(--white)' }}>One platform.<br />End-to-end.</h2>
        <p className="text-[17px] leading-relaxed max-w-[500px]" style={{ color: 'var(--text-muted)' }}>
          Sartor CRM connects every link in your chain — so products, data, and accountability all flow forward together.
        </p>
      </div>

      <div style={{ background: 'var(--border)', borderColor: 'var(--border)' }} className="reveal grid grid-cols-1 md:grid-cols-3 gap-[1px] rounded-[20px] overflow-hidden border mt-16" ref={el => elementsRef.current[1] = el}>
        {steps.map((s, i) => (
          <div key={i} style={{ background: 'var(--navy-mid)' }} className="p-[48px_36px] relative group hover:opacity-90 transition-opacity duration-220">
            <div className="font-syne text-[80px] font-extrabold absolute top-4 right-6 leading-none tracking-[-0.04em] pointer-events-none transition-opacity" style={{ color: 'rgba(11, 22, 64, 0.05)' }}>
              {s.num}
            </div>
            <div 
              className="w-[52px] h-[52px] rounded-xl flex items-center justify-center text-[24px] mb-6"
              style={{ backgroundColor: s.bgColor }}
            >
              {s.icon}
            </div>
            <div className="font-syne text-[20px] font-bold mb-3 tracking-[-0.02em]" style={{ color: 'var(--white)' }}>{s.title}</div>
            <p className="text-[14px] leading-[1.75]" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;

import React, { useState, useEffect, useRef } from 'react';

const SupplyChain = () => {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % 5);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const nodes = [
    { icon: '🏭', title: 'Factory & Brand Owner', desc: 'Batch registration on SartorChain, DORA AI enrollment, production oversight', color: 'rgba(255,92,53,0.12)' },
    { icon: '🏢', title: 'Warehouse', desc: 'Inventory sync, LPO processing, driver assignment, stock movement tracking', color: 'rgba(56,139,255,0.12)' },
    { icon: '🚚', title: 'Distributor', desc: 'Sales rep pipelines, deal management, delivery confirmation, payment tracking', color: 'rgba(142,80,255,0.12)' },
    { icon: '🏪', title: 'Retail & HCP', desc: 'Merchandiser visits, shelf visibility, competitor intelligence, HCP engagement', color: 'rgba(29,184,122,0.12)' },
    { icon: '👤', title: 'Consumer', desc: 'DORA AI authentication, loyalty engagement, counterfeit reporting, scan intelligence', color: 'rgba(255,188,53,0.12)' },
  ];

  return (
    <div className="reveal px-[5%] pt-[80px] pb-[100px]" id="overview" ref={sectionRef}>
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-[48px]">
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--orange)] mb-4 justify-center">
            <div className="w-5 h-[2px] bg-[var(--orange)] rounded-sm"></div>
            Full Chain Visibility
          </div>
          <h2 className="font-syne text-[clamp(28px,4vw,46px)] font-extrabold tracking-[-0.03em] leading-[1.1] mb-4 text-[var(--white)]">Every node. One dashboard.</h2>
          <p className="text-[17px] text-[var(--text-muted)] max-w-[500px] mx-auto leading-relaxed">
            Sartor CRM tracks every product movement from production to the end consumer — so nothing falls through the cracks and no transaction goes unrecorded.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-4 md:gap-0">
          {nodes.map((node, index) => (
            <React.Fragment key={index}>
              <div className={`bg-[var(--navy-mid)] border-[0.5px] border-[var(--border)] rounded-radius-lg p-[28px_14px_24px] text-center transition-all duration-500 relative overflow-hidden group ${activeIndex === index ? 'bg-[var(--navy-light)] -translate-y-1 border-[var(--border-light)]' : 'hover:bg-[var(--navy-light)] hover:-translate-y-1 hover:border-[var(--border-light)]'}`}>
                {/* Border Animation Segments */}
                <div 
                  className={`absolute left-0 top-0 md:top-[50%] bottom-0 w-[2px] bg-[var(--orange)] origin-top transition-transform duration-[800ms] ${activeIndex === index ? 'scale-y-100' : 'scale-y-0'}`}
                  style={{ transitionDelay: activeIndex === index ? '0ms' : '0ms' }}
                ></div>
                <div 
                  className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--orange)] origin-left transition-transform duration-[800ms] ${activeIndex === index ? 'scale-x-100' : 'scale-x-0'}`}
                  style={{ transitionDelay: activeIndex === index ? (isMobile ? '1200ms' : '800ms') : '0ms' }}
                ></div>
                <div 
                  className={`absolute right-0 top-[50%] bottom-0 w-[2px] bg-[var(--orange)] origin-bottom transition-transform duration-[800ms] hidden md:block ${activeIndex === index ? 'scale-y-100' : 'scale-y-0'}`}
                  style={{ transitionDelay: activeIndex === index ? '1600ms' : '0ms' }}
                ></div>

                <div 
                  className="w-[52px] h-[52px] rounded-xl flex items-center justify-center text-[24px] mx-auto mb-4"
                  style={{ backgroundColor: node.color }}
                >
                  {node.icon}
                </div>
                <div className="font-syne text-[13px] font-bold mb-2 tracking-[-0.01em] text-[var(--white)]">{node.title}</div>
                <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">{node.desc}</div>
              </div>
              {index < nodes.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-1">
                  <svg 
                    className={`text-[var(--orange)] transition-all duration-500 ${activeIndex === index ? 'opacity-100 scale-125 brightness-150' : 'opacity-40 scale-100'}`}
                    style={{ transitionDelay: activeIndex === index ? '2400ms' : '0ms' }}
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="text-center mt-[28px] text-[13px] text-[var(--text-muted)]">
          <span className="text-[var(--orange)] font-semibold">Sartor-Chain + DORA AI</span> authenticates products at every handoff — from batch creation to the consumer.
        </div>
      </div>
    </div>
  );
};

export default SupplyChain;

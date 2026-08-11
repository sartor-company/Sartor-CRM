import React, { useEffect, useRef } from 'react';

const ProductPreview = () => {
  const sectionRef = useRef(null);

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

  const metrics = [
    { label: 'Active Batches', value: '142' },
    { label: 'Consumer Scans', value: '8,401', color: 'text-[var(--green)]' },
    { label: 'Rep Visits', value: '317' },
    { label: 'Auth Rate', value: '97.1%', color: 'text-[var(--orange)]' },
  ];

  const bars = [35, 55, 45, 70, 58, 85, 72];

  return (
    <div className="reveal preview-card-wrap px-[5%] pb-[100px]" ref={sectionRef}>
      <div className="max-w-[1100px] mx-auto">
        <div className="bg-[var(--navy-mid)] border border-[var(--border)] rounded-radius-lg overflow-hidden shadow-2xl">
          {/* Browser Topbar */}
          <div className="preview-browser-bar flex items-center gap-2 bg-black/20 border-b border-[var(--border-light)]">
            <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F56]"></div>
            <div className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]"></div>
            <div className="w-[10px] h-[10px] rounded-full bg-[#27C93F]"></div>
            <div className="flex-1 text-center text-[12px] text-[var(--text-muted)]">crm.sartor.ng — Chain Overview</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] min-h-[360px]">
            {/* Sidebar */}
            <div className="hidden md:block bg-black/15 border-r border-[var(--border-light)] py-5">
              <div className="px-4 pb-4 border-b border-[var(--border-light)] mb-3">
                <span className="font-syne text-[14px] font-bold text-[var(--white)]">SartorCRM</span>
              </div>
              <NavItem icon="Overview" active />
              <NavItem icon="Supply Chain" />
              <NavItem icon="Field Teams" />
              <NavItem icon="DORA AI" />
              <NavItem icon="Insights" />
            </div>

            {/* Content Area */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="font-syne text-[16px] font-bold text-[var(--white)]">Chain Overview — May 2026</span>
                <span className="text-[12px] text-[var(--green)] flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]"></span>
                  Live
                </span>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {metrics.map((m, i) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.05)] [data-theme='light']:bg-[rgba(11,22,64,0.05)] border border-[var(--border-light)] rounded-lg p-3">
                    <div className="text-[10px] text-[var(--text-muted)] mb-1.5 uppercase tracking-wider font-semibold">{m.label}</div>
                    <div className={`font-syne text-[18px] font-bold ${m.color || 'text-[var(--white)]'}`}>{m.value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-[rgba(255,255,255,0.05)] [data-theme='light']:bg-[rgba(11,22,64,0.05)] border border-[var(--border-light)] rounded-lg h-[100px] flex items-end gap-1 p-3">
                {bars.map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 rounded-t-sm"
                    style={{ 
                      height: `${h}%`, 
                      backgroundColor: i === bars.length - 2 ? 'var(--green)' : 'rgba(29,184,122,0.3)' 
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, active }) => (
  <div className={`flex items-center gap-2.5 p-[9px_16px] text-[12px] rounded-md mx-2 mb-0.5 transition-colors cursor-pointer ${active ? 'bg-[var(--orange)]/10 text-[var(--orange)]' : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--white)]'}`}>
    <div className="w-3.5 h-3.5 border border-current rounded-[2px] opacity-70"></div>
    {icon}
  </div>
);

export default ProductPreview;

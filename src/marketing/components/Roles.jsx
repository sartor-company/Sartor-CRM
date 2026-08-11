import React, { useState, useEffect, useRef } from 'react';

const Roles = () => {
  const [activeRole, setActiveRole] = useState('admin');
  const [expandedMobile, setExpandedMobile] = useState('admin');
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

  const roles = [
    { id: 'admin', icon: '🛡️', title: 'Admin & Brand Owner', desc: 'Full supply chain oversight, product batch management, fraud alerts, and team control.', color: 'rgba(255,92,53,0.12)', capabilities: [
      'Monitor the full supply chain — from batch creation at the factory to consumer scans in the open market',
      'Register product batches on SartorChain and review DORA AI authentication data and fraud incident reports',
      'Track field team performance — who visited what, when, and what market intelligence was captured',
      'Access demand heatmaps, consumer scan patterns, and competitor shelf reports to guide market entry decisions'
    ]},
    { id: 'sales', icon: '📊', title: 'Sales Representatives', desc: 'Lead tracking, LPO creation, payment uploads, and commission monitoring from any device.', color: 'rgba(56,139,255,0.12)', capabilities: [
      'Log and geotag customer visits, add leads, and track pipeline stages from any mobile device in the field',
      'Create LPOs, monitor fulfilment status in real-time, and upload payment evidence for confirmation',
      'Track commission eligibility and receive automated reminders for follow-ups and overdue actions',
      'Use territory-level demand data from consumer scans to prioritise the highest-value prospects'
    ]},
    { id: 'merch', icon: '🏪', title: 'Merchandisers & Med Reps', desc: 'Log store visits, capture shelf data, submit HCP engagements and market intelligence reports.', color: 'rgba(142,80,255,0.12)', capabilities: [
      'Log store visits with geotagging, capture shelf photos, and report stock levels and competitor pricing',
      'Submit market intelligence that feeds directly into the brand owner\'s insights and planning dashboard',
      'Track HCP visits, record sample batch numbers, and submit digital compliance documentation',
      'Flag suspected counterfeit stock in trade and escalate directly through the platform for investigation'
    ]},
    { id: 'warehouse', icon: '🏭', title: 'Warehouse & Drivers', desc: 'Process LPOs, manage stock, assign deliveries, and confirm receipt with one-time codes.', color: 'rgba(29,184,122,0.12)', capabilities: [
      'Receive and process LPOs, prepare goods for dispatch, and assign the right driver with the right load',
      'System auto-generates one-time delivery codes sent to customers via SMS or email at point of dispatch',
      'Driver inputs customer code at delivery — order closes, chain of custody recorded, commission triggered',
      'Inventory manager syncs warehouse stock and triggers predictive restocking alerts before stockouts occur'
    ]},
    { id: 'consumer', icon: '📱', title: 'End Consumers', desc: 'Scan QR codes, verify authenticity in seconds, earn loyalty points, and report counterfeits.', color: 'rgba(255,188,53,0.12)', capabilities: [
      'Scan the product QR code — no app download, no login required, works on any smartphone',
      'DORA AI cross-references the product against SartorChain and returns a clear authenticity result in under 2 seconds',
      'Enter the scratch PIN post-purchase to earn loyalty points and unlock milestone rewards from the brand',
      'Flag suspected counterfeits directly — every report feeds into the brand\'s fraud intelligence layer'
    ]}
  ];

  const currentRole = roles.find(r => r.id === activeRole);

  return (
    <section id="roles" style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }} className="border-y px-[5%] py-[100px]">
      <div className="reveal mb-12" ref={el => elementsRef.current[0] = el}>
        <div className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-orange mb-4">
          <div className="w-5 h-[2px] bg-orange rounded-sm"></div>
          Role-Based Access
        </div>
        <h2 className="font-syne text-[clamp(28px,4vw,46px)] font-extrabold tracking-[-0.03em] leading-[1.1] mb-4" style={{ color: 'var(--white)' }}>Built around every<br />person in your operation</h2>
        <p className="text-[17px] leading-relaxed max-w-[520px]" style={{ color: 'var(--text-muted)' }}>
          Each user sees exactly what they need. Role-based dashboards reduce noise and keep your team focused on the right actions at the right time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        <div className="reveal flex flex-col gap-1" ref={el => elementsRef.current[1] = el}>
          {roles.map(role => (
            <div key={role.id}>
              <div 
                onClick={() => {
                  setActiveRole(role.id);
                  setExpandedMobile(expandedMobile === role.id ? null : role.id);
                }}
                className={`flex items-center justify-between gap-4 p-5 rounded-[12px] border transition-all duration-220 cursor-pointer group`}
                style={{
                  backgroundColor: activeRole === role.id ? 'var(--card-bg-hover)' : 'transparent',
                  borderColor: activeRole === role.id ? 'var(--border-light)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeRole !== role.id) e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                }}
                onMouseLeave={(e) => {
                  if (activeRole !== role.id) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[18px] flex-shrink-0 mt-0.5" style={{ backgroundColor: role.color }}>
                    {role.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-syne text-[16px] font-bold mb-1.5 tracking-[-0.01em]" style={{ color: 'var(--white)' }}>{role.title}</div>
                    <div className="text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{role.desc}</div>
                  </div>
                </div>
                
                {/* Dropdown Arrow - visible on mobile, hidden on desktop */}
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="flex-shrink-0 transition-transform duration-220"
                  style={{
                    color: 'var(--text-muted)',
                    transform: expandedMobile === role.id ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {/* Mobile Accordion - show expanded content below each role */}
              {expandedMobile === role.id && (
                <div style={{ background: 'var(--navy-mid)', borderColor: 'var(--border-light)' }} className="border rounded-b-[12px] overflow-hidden mt-1 lg:hidden">
                  <div style={{ borderColor: 'var(--border)' }} className="p-[16px_20px] border-b flex items-center gap-3">
                    <div className="w-[36px] h-[36px] rounded-lg flex items-center justify-center text-[18px]" style={{ backgroundColor: role.color }}>
                      {role.icon}
                    </div>
                    <div>
                      <div className="font-syne text-[14px] font-bold tracking-[-0.01em]" style={{ color: 'var(--white)' }}>{role.title}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Capabilities</div>
                    </div>
                  </div>
                  <div className="p-5">
                    {role.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                        <div className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(29, 184, 122, 0.15)', borderColor: 'rgba(29, 184, 122, 0.3)' }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#1DB87A" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div className="text-[13px] leading-[1.4]" style={{ color: 'var(--white)' }}>{cap}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Panel - hidden on mobile */}
        <div className="reveal hidden lg:block" ref={el => elementsRef.current[2] = el}>
          <div style={{ background: 'var(--navy-mid)', borderColor: 'var(--border-light)' }} className="border rounded-[20px] overflow-hidden animate-fade-in">
            <div style={{ borderColor: 'var(--border)' }} className="p-[24px_28px] border-b flex items-center gap-3.5">
              <div className="w-[46px] h-[46px] rounded-lg flex items-center justify-center text-[22px]" style={{ backgroundColor: currentRole.color }}>
                {currentRole.icon}
              </div>
              <div>
                <div className="font-syne text-[20px] font-bold tracking-[-0.02em]" style={{ color: 'var(--white)' }}>{currentRole.title}</div>
                <div className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Full chain command</div>
              </div>
            </div>
            <div className="p-7">
              {currentRole.capabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(29, 184, 122, 0.15)', borderColor: 'rgba(29, 184, 122, 0.3)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1DB87A" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div className="text-[14px] leading-[1.55]" style={{ color: 'var(--white)' }}>{cap}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roles;

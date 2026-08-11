import React, { useEffect, useRef, useState } from 'react';

const NODES = [
  {
    id: 'sartor-chain', label: 'Sartor-Chain', sublabel: 'Blockchain Provenance',
    color: '#FF5C35', ring: 0, angle: 270,
    tag: 'Core Product · dorascan.ai',
    desc: 'Anchors product identity at factory — an immutable blockchain record that travels through every supply chain handoff.',
    links: ['Blockchain', 'GS1 Barcode', 'EPCIS 2.0', 'SHA-256 Hashing']
  },
  {
    id: 'dora-ai', label: 'DORA AI', sublabel: 'Computer Vision',
    color: '#1DB87A', ring: 0, angle: 150,
    tag: 'Core Product · dorascan.ai',
    desc: 'Creates a digital fingerprint from existing packaging. Scans return an authenticity verdict in under 2 seconds.',
    links: ['CV Fingerprint', '<2s Auth', 'Scan Analytics', 'Gift Engine']
  },
  {
    id: 'sartor-crm', label: 'Sartor CRM', sublabel: 'Sales & Distribution',
    color: '#388BFF', ring: 0, angle: 30,
    tag: 'Core Product · crm.sartor.ng',
    desc: 'Full-stack distribution platform — LPO processing, inventory, field teams, driver tracking, HCP engagement.',
    links: ['LPO Processing', 'Driver Tracking', 'HCP Module', 'Forecasting']
  },
  {
    id: 'factory', label: 'Factory &\nBrand Owner', sublabel: '',
    color: '#FF5C35', ring: 1, angle: 270,
    tag: 'Supply Chain Actor',
    desc: 'Registers batches on Sartor-Chain at production. Enrolls products in DORA AI. Manages the CRM manufacturing pipeline.',
    links: ['Batch Registration', 'DORA Enrollment', 'Production Oversight']
  },
  {
    id: 'warehouse', label: 'Warehouse', sublabel: '',
    color: '#388BFF', ring: 1, angle: 210,
    tag: 'Supply Chain Actor',
    desc: 'Receives stock from factory. Manages inventory via Sartor CRM. Triggers outbound LPOs. Authentication at every handoff.',
    links: ['Inventory Sync', 'LPO Processing', 'Stock Tracking']
  },
  {
    id: 'distributor', label: 'Distributor', sublabel: '',
    color: '#8E50FF', ring: 1, angle: 150,
    tag: 'Supply Chain Actor',
    desc: 'Sales rep pipelines, deal management, delivery confirmation, payment tracking — all inside Sartor CRM.',
    links: ['Sales Pipelines', 'Delivery Confirmation', 'Payment Tracking']
  },
  {
    id: 'retail', label: 'Retail &\nHCP', sublabel: '',
    color: '#1DB87A', ring: 1, angle: 90,
    tag: 'Supply Chain Actor',
    desc: 'Merchandiser visits, shelf visibility reports, competitor intelligence, HCP engagement and detailing tracked by field teams.',
    links: ['Merchandising', 'HCP Visits', 'Competitor Intel']
  },
  {
    id: 'consumer', label: 'Consumer', sublabel: '',
    color: '#FFBC35', ring: 1, angle: 30,
    tag: 'End Actor',
    desc: 'Scans any product with their phone. DORA AI returns an authenticity verdict instantly. Loyalty rewards unlock on milestones.',
    links: ['DORA AI Scan', 'Loyalty Points', 'Fraud Reporting']
  },
  {
    id: 'manufacturer-intel', label: 'Market\nIntelligence', sublabel: '',
    color: '#FF5C35', ring: 1, angle: 330,
    tag: 'Intelligence Layer',
    desc: 'Every consumer scan feeds real-time intelligence back to the manufacturer — where products verify, where fakes appear, demand patterns.',
    links: ['Scan Heatmaps', 'Counterfeit Reports', 'Sales Forecasting', 'Behaviour Data']
  },
];

const EDGES = [
  ['sartor-chain', 'dora-ai', '#FF5C35', 'Batch identity → fingerprint model', 1],
  ['dora-ai', 'sartor-crm', '#1DB87A', 'Auth signals → CRM dashboard', 1],
  ['sartor-chain', 'sartor-crm', '#388BFF', 'Provenance → distribution ops', 1],
  ['factory', 'sartor-chain', '#FF5C35', 'Batch registration', 0],
  ['factory', 'dora-ai', '#1DB87A', 'DORA enrollment', 0],
  ['factory', 'sartor-crm', '#388BFF', 'Production records', 0],
  ['warehouse', 'sartor-crm', '#388BFF', 'Inventory + LPO', 0],
  ['distributor', 'sartor-crm', '#8E50FF', 'Sales pipeline', 0],
  ['retail', 'sartor-crm', '#1DB87A', 'Merchandising data', 0],
  ['consumer', 'dora-ai', '#FFBC35', 'Scan → auth', 0],
  ['consumer', 'sartor-chain', '#FFBC35', 'Provenance lookup', 2],
  ['dora-ai', 'manufacturer-intel', '#1DB87A', 'Scan intelligence', 0],
  ['manufacturer-intel', 'sartor-crm', '#FF5C35', 'Market data → CRM', 0],
  ['manufacturer-intel', 'factory', '#FF5C35', 'Insights loop back', 2],
];

const TICKS = [
  'Batch REG-240611-002 anchored on Sartor-Chain', 'DORA AI scan — ✓ AUTHENTIC — 1.8s', 'LPO #4821 confirmed by driver', 'Consumer scan feeds heatmap update',
  'Sartor-Chain batch registered — SHA-256 locked', 'DORA AI fingerprint enrolled for SKU-0443', 'Field rep visit logged — Retail: Ikeja', 'Counterfeit report filed — Apapa corridor',
  'Inventory sync: Warehouse → Distributor pipeline', 'HCP visit confirmed — Dr. A. Okonkwo', 'DORA scan: ✓ AUTHENTIC — confidence 98.6%', 'Loyalty milestone FIRST_AUTH — reward triggered',
];

const TICKER_COLORS = { 'Batch': '#FF5C35', 'DORA': '#1DB87A', 'LPO': '#388BFF', 'Consumer': '#FFBC35', 'Field': '#8E50FF', 'Sartor-Chain': '#FF5C35', 'Counterfeit': '#FF5C35', 'Loyalty': '#FFBC35', 'HCP': '#8E50FF', 'Inventory': '#388BFF' };

const hexAlpha = (hex, a) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const SartorEcosystem = () => {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const tickerRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0, visible: false });
  const [mobilePanelActive, setMobilePanelActive] = useState(false);
  const [tickerDuration, setTickerDuration] = useState('40s');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const wrap = wrapRef.current;
    let W, H, CX, CY, R0, R1, scale;
    let frame = 0;
    let particles = [];
    let animationFrameId;

    const isMobile = () => window.innerWidth <= 600;

    const resize = () => {
      const w = wrap.clientWidth;
      const ratio = isMobile() ? 1.05 : 0.72;
      W = w; H = Math.round(w * ratio);
      canvas.width = W; canvas.height = H;
      CX = W / 2; CY = H / 2;
      R0 = isMobile() ? Math.min(W, H) * 0.13 : Math.min(W, H) * 0.155;
      R1 = isMobile() ? Math.min(W, H) * 0.38 : Math.min(W, H) * 0.36;
      scale = W / 960;
      computePositions();
    };

    const computePositions = () => {
      NODES.forEach(n => {
        const r = n.ring === 0 ? R0 : R1;
        const a = (n.angle - 90) * Math.PI / 180;
        n.x = CX + r * Math.cos(a);
        n.y = CY + r * Math.sin(a);
        if (isMobile()) {
          n.r = n.ring === 0 ? Math.max(22, 32 * scale) : Math.max(16, 24 * scale);
        } else {
          n.r = n.ring === 0 ? Math.max(28, 38 * scale) : Math.max(20, 28 * scale);
        }
      });
    };

    const spawnParticle = () => {
      const e = EDGES[Math.floor(Math.random() * EDGES.length)];
      const from = NODES.find(n => n.id === e[0]);
      const to = NODES.find(n => n.id === e[1]);
      if (!from || !to) return;
      const baseSpeed = isMobile() ? 0.002 : 0.003;
      particles.push({
        fx: from.x, fy: from.y, tx: to.x, ty: to.y,
        t: 0, speed: baseSpeed + Math.random() * 0.004,
        color: e[2], size: Math.max(2, 3 * scale),
        trail: []
      });
    };

    const updateParticles = () => {
      if (frame % 18 === 0 && particles.length < 24) spawnParticle();
      particles = particles.filter(p => {
        p.t += p.speed;
        const x = p.fx + (p.tx - p.fx) * p.t;
        const y = p.fy + (p.ty - p.fy) * p.t;
        p.trail.push({ x, y });
        if (p.trail.length > 10) p.trail.shift();
        return p.t < 1;
      });
    };

    const drawEdge = (e) => {
      const from = NODES.find(n => n.id === e[0]);
      const to = NODES.find(n => n.id === e[1]);
      if (!from || !to) return;
      ctx.save();
      ctx.strokeStyle = hexAlpha(e[2], 0.22);
      ctx.lineWidth = Math.max(0.8, 1.2 * scale);
      if (e[4] === 1) ctx.setLineDash([5 * scale, 5 * scale]);
      else if (e[4] === 2) ctx.setLineDash([2 * scale, 5 * scale]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.08;
      const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.08;
      ctx.quadraticCurveTo(mx, my, to.x, to.y);
      ctx.stroke();
      ctx.restore();
    };

    const drawNode = (n) => {
      const isHov = hoveredNode && hoveredNode.id === n.id;
      const r = n.r;

      if (isHov) {
        const grad = ctx.createRadialGradient(n.x, n.y, r * 0.9, n.x, n.y, r * 2.2);
        grad.addColorStop(0, hexAlpha(n.color, 0.35));
        grad.addColorStop(1, hexAlpha(n.color, 0));
        ctx.beginPath(); ctx.arc(n.x, n.y, r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
      }

      const pulse = 1 + 0.06 * Math.sin(frame * 0.04 + n.angle * 0.05);
      ctx.save();
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = hexAlpha(n.color, isHov ? 0.5 : 0.18);
      ctx.lineWidth = Math.max(1, 1.5 * scale);
      ctx.stroke();
      ctx.restore();

      const bgGrad = ctx.createRadialGradient(n.x - r * 0.2, n.y - r * 0.2, 0, n.x, n.y, r);
      bgGrad.addColorStop(0, n.ring === 0 ? hexAlpha(n.color, 0.28) : hexAlpha(n.color, 0.16));
      bgGrad.addColorStop(1, hexAlpha(n.color, 0.06));
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = bgGrad; ctx.fill();

      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = hexAlpha(n.color, isHov ? 0.9 : 0.45);
      ctx.lineWidth = Math.max(1, (n.ring === 0 ? 2 : 1.5) * scale);
      ctx.stroke();

      ctx.save();
      const lines = n.label.split('\n');
      const fs = Math.max(8, (n.ring === 0 ? 12 : 10) * scale);
      ctx.font = `700 ${fs}px 'Syne', sans-serif`;
      ctx.fillStyle = isHov ? '#fff' : hexAlpha('#ffffff', 0.9);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lineH = fs * 1.25;
      const startY = n.y - (lines.length - 1) * lineH / 2;
      lines.forEach((l, i) => ctx.fillText(l, n.x, startY + i * lineH));

      if (n.sublabel && n.ring === 0) {
        const sf = Math.max(6, 8.5 * scale);
        ctx.font = `400 ${sf}px 'Epilogue', sans-serif`;
        ctx.fillStyle = hexAlpha(n.color, 0.75);
        ctx.fillText(n.sublabel, n.x, n.y + fs * 0.85);
      }
      ctx.restore();
    };

    const drawParticles = () => {
      particles.forEach(p => {
        p.trail.forEach((pt, i) => {
          const a = (i / p.trail.length) * 0.7;
          const s = p.size * (i / p.trail.length);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, s, 0, Math.PI * 2);
          ctx.fillStyle = hexAlpha(p.color, a);
          ctx.fill();
        });
      });
    };

    const drawCenterHub = () => {
      const r = Math.max(16, 22 * scale);
      const pulse = 1 + 0.04 * Math.sin(frame * 0.05);

      [2.4, 1.7].forEach((m, i) => {
        ctx.beginPath(); ctx.arc(CX, CY, r * m * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${0.04 - i * 0.01})`;
        ctx.lineWidth = 1; ctx.stroke();
      });

      const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, r);
      g.addColorStop(0, 'rgba(255,255,255,0.18)');
      g.addColorStop(1, 'rgba(255,255,255,0.04)');
      ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();

      const fs = Math.max(10, 16 * scale);
      ctx.font = `800 ${fs}px 'Syne', sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('S', CX, CY);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.max(W, H) * 0.7);
      bg.addColorStop(0, 'rgba(26,45,124,0.4)');
      bg.addColorStop(1, 'rgba(11,22,64,0)');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      [R0 * 0.6, R0, (R0 + R1) / 2, R1, R1 * 1.25].forEach(r => {
        ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1; ctx.stroke();
      });

      EDGES.forEach(drawEdge);
      drawParticles();
      drawCenterHub();
      NODES.forEach(drawNode);
      updateParticles();
    };

    const loop = () => {
      frame++;
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    resize();
    loop();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [hoveredNode]);

  // Handle ticker speed and global dismiss
  useEffect(() => {
    const handleGlobalTouch = (e) => {
      if (!mobilePanelActive) return;
      const canvas = canvasRef.current;
      const mobilePanel = document.getElementById('mobile-info-panel');
      if (canvas && !canvas.contains(e.target) && mobilePanel && !mobilePanel.contains(e.target)) {
        setMobilePanelActive(false);
        setHoveredNode(null);
      }
    };

    document.addEventListener('touchstart', handleGlobalTouch, { passive: true });

    const setSpeed = () => {
      if (tickerRef.current) {
        const totalW = tickerRef.current.scrollWidth;
        const scrollDist = totalW / 2;
        const pxPerSec = window.innerWidth <= 600 ? 1000 : 1300;

        const duration = Math.round(scrollDist / pxPerSec);
        setTickerDuration(`${duration}s`);
      }
    };

    setSpeed();
    window.addEventListener('resize', setSpeed);

    return () => {
      document.removeEventListener('touchstart', handleGlobalTouch);
      window.removeEventListener('resize', setSpeed);
    };
  }, [mobilePanelActive]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = canvas.width / rect.width;
    const mx = (e.clientX - rect.left) * ratio;
    const my = (e.clientY - rect.top) * ratio;

    let hit = null;
    for (let i = NODES.length - 1; i >= 0; i--) {
      const n = NODES[i];
      const d = Math.hypot(mx - n.x, my - n.y);
      if (d <= n.r * 1.4) {
        hit = n;
        break;
      }
    }

    setHoveredNode(hit);

    if (hit && window.innerWidth > 600) {
      const wrapRect = wrapRef.current.getBoundingClientRect();
      const hitScreenX = rect.left + hit.x / ratio;
      const hitScreenY = rect.top + hit.y / ratio;
      const panelW = 230;
      const panelH = 200;
      let lx = hitScreenX - wrapRect.left + 20;
      let ly = hitScreenY - wrapRect.top - 20;

      if (lx + panelW > wrapRect.width - 8) lx = hitScreenX - wrapRect.left - panelW - 20;
      if (lx < 8) lx = 8;
      if (ly + panelH > wrapRect.height - 8) ly = wrapRect.height - panelH - 8;
      if (ly < 8) ly = 8;

      setPanelPos({ x: lx, y: ly, visible: true });
    } else {
      setPanelPos(prev => ({ ...prev, visible: false }));
    }
  };

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = canvas.width / rect.width;
    const mx = (t.clientX - rect.left) * ratio;
    const my = (t.clientY - rect.top) * ratio;

    let hit = null;
    for (let i = NODES.length - 1; i >= 0; i--) {
      const n = NODES[i];
      const d = Math.hypot(mx - n.x, my - n.y);
      if (d <= n.r * 1.4) {
        hit = n;
        break;
      }
    }

    if (hit) {
      // Prevent default to avoid scroll when interacting with nodes
      if (e.cancelable) e.preventDefault();
      setHoveredNode(hit);
      setMobilePanelActive(true);
    } else if (mobilePanelActive) {
      setMobilePanelActive(false);
      setHoveredNode(null);
    }
  };

  return (
    <div className="min-h-screen text-white font-dm pb-20 overflow-x-hidden" style={{ backgroundColor: 'var(--navy)' }}>
      {/* Header - Standard project style */}
      <div className="text-center px-6 pt-32 pb-12">
        <div className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-orange mb-4 animate-fade-in">
          <div className="w-5 h-[2px] bg-orange rounded-sm"></div>
          Sartor Limited
           <div className="w-5 h-[2px] bg-orange rounded-sm"></div>
        </div>
        <h1 className="font-syne text-[clamp(32px,7vw,64px)] font-extrabold leading-[1.05] tracking-[-0.03em] mb-6 animate-fade-up" style={{ color: 'var(--white)' }}>
          One Ecosystem.<br />
          <span className="text-orange">End to End.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-[17px] leading-relaxed animate-fade-up [animation-delay:0.1s]" style={{ color: 'var(--text-muted)' }}>
          Sartor-Chain, DORA AI, and Sartor CRM are three layers of one interconnected platform — 
          authentication, intelligence, and operations flowing as a single loop.
        </p>
      </div>

      {/* Canvas Area */}
      <div className="max-w-6xl mx-auto px-6 mb-12 relative" ref={wrapRef}>
        <div className="relative overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { setHoveredNode(null); setPanelPos(prev => ({ ...prev, visible: false })); }}
            onTouchStart={handleTouchStart}
            className="w-full h-auto cursor-default block"
          />

          {/* Desktop Info Panel */}
          {panelPos.visible && hoveredNode && (
            <div 
              className="absolute z-20 bg-navy/90 backdrop-blur-md border border-white/20 p-5 rounded-xl shadow-2xl w-[240px] pointer-events-none transition-opacity duration-300"
              style={{ left: panelPos.x, top: panelPos.y, backgroundColor: 'rgba(11, 22, 64, 0.9)', borderColor: 'var(--border-light)' }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: hoveredNode.color }}>
                {hoveredNode.tag}
              </div>
              <div className="text-lg font-syne font-bold mb-2 text-white">
                {hoveredNode.label.replace('\n', ' ')}
              </div>
              <div className="text-xs text-text-muted leading-relaxed mb-4">
                {hoveredNode.desc}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(hoveredNode.links || []).map((link, i) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-text-mid font-medium">
                    {link}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Info Panel */}
        <div 
          id="mobile-info-panel"
          className={`fixed inset-x-4 bottom-6 z-50 bg-navy-mid/95 backdrop-blur-xl border border-white/15 p-6 rounded-2xl shadow-2xl transition-all duration-500 transform ${mobilePanelActive && hoveredNode ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'} md:hidden`}
          style={{ backgroundColor: 'rgba(15, 30, 85, 0.95)', borderColor: 'var(--border-light)' }}
        >
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: hoveredNode?.color }}>
                {hoveredNode?.tag}
              </div>
              <div className="text-xl font-syne font-bold text-white">
                {hoveredNode?.label.replace('\n', ' ')}
              </div>
            </div>
            <button 
              onClick={() => { setMobilePanelActive(false); setHoveredNode(null); }}
              className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 text-sm hover:bg-white/20 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-text-muted leading-relaxed mb-6">
            {hoveredNode?.desc}
          </p>
          <div className="flex flex-wrap gap-2">
            {(hoveredNode?.links || []).map((link, i) => (
              <span key={i} className="text-[10px] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-text-mid font-medium">
                {link}
              </span>
            ))}
          </div>
        </div>

        <p className="text-center text-text-muted text-[11px] mt-6 opacity-60 uppercase tracking-widest">Tap any node to explore the ecosystem</p>
      </div>

      {/* Legend - Following standard from HTML */}
      <div className="max-w-3xl mx-auto px-6 flex flex-wrap justify-center gap-x-8 gap-y-6 mb-20 opacity-90">
        {[
          { label: 'Sartor-Chain', color: '#FF5C35', type: 'dot' },
          { label: 'DORA AI', color: '#1DB87A', type: 'dot' },
          { label: 'Sartor CRM', color: '#388BFF', type: 'dot' },
          { label: 'Provenance data', color: 'rgba(255,92,53,0.5)', type: 'line' },
          { label: 'Authentication signal', color: 'rgba(29,184,122,0.5)', type: 'line' },
          { label: 'CRM data flow', color: 'rgba(56,139,255,0.5)', type: 'line' }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-mid)' }}>
            {item.type === 'dot' ? (
              <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]" style={{ backgroundColor: item.color }} />
            ) : (
              <div className="w-6 h-[2px] rounded-full" style={{ backgroundColor: item.color }} />
            )}
            {item.label}
          </div>
        ))}
      </div>

      {/* Ticker */}
      <div className="w-full overflow-hidden border-y py-1 group" style={{ backgroundColor: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
        <style>{`
          @keyframes ticker-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-ticker {
            animation: ticker-scroll var(--duration, 40s) linear infinite;
          }
          .group:hover .animate-ticker {
            animation-play-state: paused;
          }
        `}</style>
        <div 
          ref={tickerRef}
          className="flex whitespace-nowrap animate-ticker"
          style={{ '--duration': tickerDuration }}
        >
          {[...TICKS, ...TICKS, ...TICKS, ...TICKS].map((tick, i) => {
            const category = Object.keys(TICKER_COLORS).find(k => tick.includes(k));
            const color = category ? TICKER_COLORS[category] : '#1DB87A';
            return (
              <div key={i} className="inline-flex items-center gap-3 px-10 " style={{ borderColor: 'var(--border)' }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                <span className="text-[13px] font-bold uppercase tracking-wide" style={{ color }}>{tick}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cards Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '⛓️',
              name: 'Sartor-Chain',
              color: '#FF5C35',
              desc: 'Blockchain provenance platform. Every product batch is anchored at factory — a cryptographic identity that travels through every handoff, immutable and verifiable at any point in the chain.',
              tags: ['Batch registration', 'Immutable ledger', 'GS1 barcode', 'EPCIS 2.0']
            },
            {
              icon: '🔍',
              name: 'DORA AI',
              color: '#1DB87A',
              desc: 'Computer vision engine that creates an invisible digital fingerprint from existing packaging. Consumers scan with any phone — authenticity verdict in under 2 seconds. Every scan feeds market intelligence back to the manufacturer.',
              tags: ['CV fingerprint', '<2s auth', 'Scan intelligence', 'Loyalty engine']
            },
            {
              icon: '📊',
              name: 'Sartor CRM',
              color: '#388BFF',
              desc: 'Full-stack sales and distribution management. LPO processing, inventory, field team oversight, driver tracking, HCP engagement, and market intelligence — unified across manufacturer, warehouse, distributor, and retail.',
              tags: ['LPO processing', 'Field teams', 'Driver tracking', 'HCP module']
            }
          ].map((card, i) => (
            <div key={i} className="p-5 rounded-[32px] border transition-all duration-500 hover:scale-[1.02] group relative overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.02] rounded-bl-full pointer-events-none group-hover:bg-white/[0.04] transition-colors duration-500" />
              <div className="w-2 h-2 rounded-lg p-6 flex items-center justify-center text-3xl mb-2 shadow-xl group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: hexAlpha(card.color, 0.12) }}>
                {card.icon}
              </div>
              <h3 className="font-syne text-2xl font-bold mb-1 tracking-tight" style={{ color: card.color }}>{card.name}</h3>
              <p className="leading-[1.6] mb-5 text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {card.desc}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {card.tags.map((tag, j) => (
                  <span key={j} className="text-[7px] uppercase font-extrabold tracking-[0.1em] px-1 py-1 rounded-lg border transition-colors duration-300" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)', color: 'var(--text-mid)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SartorEcosystem;

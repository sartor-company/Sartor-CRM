import React from 'react';

const Hero = ({ openModal }) => {
  return (
    <section className="min-h-screen flex items-center pt-[120px] px-[5%] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 hero-grid-pattern"></div>
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(255,92,53,0.10)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(29,184,122,0.07)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="hero-inner relative z-[2] max-w-[300px] sm:max-w-[900px] mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-[6px] pr-[16px] py-[6px] bg-[var(--card-bg)] border-[0.5px] border-[var(--border-light)] rounded-full text-[13px] font-medium text-[var(--text-mid)] mb-8 animate-fade-up">
          <div className="w-5 h-5 rounded-full bg-[rgba(29,184,122,0.15)] border border-[rgba(29,184,122,0.4)] flex items-center justify-center flex-shrink-0">
            <div className="w-[7px] h-[7px] rounded-full bg-[var(--green)]"></div>
          </div>
          Built for FMCG & Pharma — Powered by Sartor-Chain + DORA AI
        </div>

        <h1 className="font-syne text-[clamp(30px,6vw,74px)] sm:text-[clamp(40px,6vw,74px)] font-extrabold leading-[1.05] tracking-[-0.04em] mb-6 animate-fade-up [animation-delay:0.1s] text-[var(--white)]">
          See everything.<br />
          From <span className="text-[var(--orange)]">factory floor</span><br />
          to <span className="text-[var(--green)]">consumer hands.</span>
        </h1>

        <p className="hero-lead text-[clamp(16px,2vw,19px)] text-[var(--text-muted)] max-w-[620px] mx-auto leading-[1.75] animate-fade-up [animation-delay:0.2s]">
          Sartor CRM gives brand owners complete visibility across their supply chain — tracking products, managing field teams, protecting authenticity, and capturing market intelligence in one unified platform.
        </p>

        <div className="hero-cta-row flex gap-[14px] justify-center flex-wrap animate-fade-up [animation-delay:0.3s]">
          <button
            onClick={openModal}
            className="btn-pilot btn-pilot-hero"
          >
            Request a Pilot
          </button>
          <a
            href="#overview"
            className="btn-ghost"
          >
            See how it works
          </a>
        </div>

        <div className="flex justify-center gap-12 mt-[72px] pt-10 border-t border-[var(--border)] animate-fade-up [animation-delay:0.45s] flex-wrap">
          <div className="text-center">
            <div className="font-syne text-[30px] font-bold tracking-[-0.03em] leading-none mb-1.5 text-[var(--orange)]">5</div>
            <div className="text-[13px] text-[var(--text-muted)]">Chain touchpoints tracked</div>
          </div>
          <div className="text-center">
            <div className="font-syne text-[30px] font-bold tracking-[-0.03em] leading-none mb-1.5 text-[var(--white)]">&lt;2s</div>
            <div className="text-[13px] text-[var(--text-muted)]">Product auth response</div>
          </div>
          <div className="text-center">
            <div className="font-syne text-[30px] font-bold tracking-[-0.03em] leading-none mb-1.5 text-[var(--green)]">99.5%</div>
            <div className="text-[13px] text-[var(--text-muted)]">Platform uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="font-syne text-[30px] font-bold tracking-[-0.03em] leading-none mb-1.5 text-[var(--white)]">360°</div>
            <div className="text-[13px] text-[var(--text-muted)]">Market visibility</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

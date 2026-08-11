import React, { useEffect, useRef } from 'react';

const CTA = ({ openModal }) => {
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

  return (
    <section className="text-center py-[100px] px-[5%] relative overflow-hidden" id="contact">
      <div className="absolute inset-0 cta-radial-bg"></div>
      <div className="relative z-[2] max-w-[620px] mx-auto">
        <div className="reveal inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--orange)] mb-4 justify-center" ref={el => elementsRef.current[0] = el}>
          <div className="w-5 h-[2px] bg-[var(--orange)] rounded-sm"></div>
          Get Started
        </div>
        <h2 className="reveal font-syne text-[clamp(30px,4.5vw,52px)] font-extrabold tracking-[-0.04em] leading-[1.1] mb-5 text-[var(--white)]" ref={el => elementsRef.current[1] = el}>
          Ready to see your<br /><span className="text-[var(--orange)]">whole chain</span><br />at once?
        </h2>
        <p className="reveal text-[17px] text-[var(--text-muted)] leading-[1.7] mb-10" ref={el => elementsRef.current[2] = el}>
          Pilot pricing is available for qualifying FMCG and pharma brands. A member of the Sartor team will be in touch within 24 hours to discuss terms tailored to your operation.
        </p>
        <div className="reveal" ref={el => elementsRef.current[3] = el}>
          <button
            onClick={openModal}
            className="btn-pilot btn-pilot-hero mx-auto"
          >
            Request a Pilot
          </button>
        </div>
        <p className="reveal text-[12px] text-[var(--text-muted)] mt-4" ref={el => elementsRef.current[4] = el}>
          No commitment required. Pilot terms discussed directly with Sartor leadership.
        </p>
      </div>
    </section>
  );
};

export default CTA;

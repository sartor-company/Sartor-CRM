import { useEffect, useState } from 'react';
import './marketing.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SupplyChain from './components/SupplyChain';
import ValuePillars from './components/ValuePillars';
import ProductPreview from './components/ProductPreview';
import Features from './components/Features';
import Roles from './components/Roles';
import SartorEcosystem from './components/SartorEcosystem';
import HowItWorks from './components/HowItWorks';
import Comparison from './components/Comparison';
import CTA from './components/CTA';
import Footer from './components/Footer';
import PilotModal from './components/PilotModal';

export default function LandingPage() {
  const [isDark, setIsDark] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const prevTheme = document.documentElement.getAttribute('data-theme');
    const prevScroll = document.documentElement.style.scrollBehavior;
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevRootOverflow = root?.style.overflow ?? '';

    html.style.scrollBehavior = 'smooth';
    html.style.overflow = 'auto';
    body.style.overflow = 'auto';
    if (root) root.style.overflow = 'auto';

    if (isDark) {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', 'light');
    }

    return () => {
      html.style.scrollBehavior = prevScroll;
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      if (root) root.style.overflow = prevRootOverflow;
      if (prevTheme) {
        html.setAttribute('data-theme', prevTheme);
      } else {
        html.removeAttribute('data-theme');
      }
    };
  }, [isDark]);

  return (
    <div className="landing-root font-dm transition-colors duration-220">
      <Navbar
        isDark={isDark}
        toggleTheme={() => setIsDark((d) => !d)}
        openModal={() => setIsModalOpen(true)}
      />
      <main>
        <Hero openModal={() => setIsModalOpen(true)} />
        <div id="overview">
          <SupplyChain />
        </div>
        <ValuePillars />
        <ProductPreview />
        <div id="features">
          <Features />
        </div>
        <div id="roles">
          <Roles />
        </div>
        <div id="ecosystem">
          <SartorEcosystem />
        </div>
        <div id="how">
          <HowItWorks />
        </div>
        <div id="compare">
          <Comparison />
        </div>
        <CTA openModal={() => setIsModalOpen(true)} />
      </main>
      <Footer />
      <PilotModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
const logo = '/favicon.jpg';

const Footer = () => {
  return (
    <footer style={{
        borderColor: 'var(--border)'
      }} className="px-[5%] py-[60px] pb-10 border-t border-white/10">
      <div className="grid grid-cols-2 md:grid-cols-[2fr_2fr_1fr] gap-12 mb-12">
        <div className="max-w-[240px]">
          <div className="flex items-center gap-[10px] font-syne font-bold text-[18px] tracking-[-0.02em] mb-3">
            <Link to="/" className="flex items-center gap-[10px] font-syne font-bold text-[18px] tracking-[-0.02em] text-[var(--white)]">
              <img src={logo} alt="SartorCRM Logo" className="w-[34px] h-[34px] rounded-full" />
              <span className="text-[12px] sm:text-[18px]">Sartor <span className='text-orange'>CRM</span> </span>
            </Link>
          </div>
          <p className="text-[14px] text-text-muted leading-[1.7]">
            Supply chain intelligence, field team oversight, product protection, and consumer insights — purpose-built for FMCG and pharma businesses across Africa.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-5">
            <span className="px-3 py-1 bg-white/5 border border-white/8 rounded-full text-[11px] text-text-muted font-medium tracking-wide">RC: 1845734</span>
            <span className="px-3 py-1 bg-white/5 border border-white/8 rounded-full text-[11px] text-text-muted font-medium tracking-wide">Abuja, Nigeria</span>
          </div>
        </div>

        <div>
          <div className="font-syne text-[13px] font-bold uppercase tracking-wider text-text-muted mb-4">Platform</div>
          <ul className="flex flex-col gap-2.5">
            <li><FooterLink href="/#overview">Supply Chain</FooterLink></li>
            <li><FooterLink href="/#features">Features</FooterLink></li>
            <li><FooterLink href="/#roles">Roles</FooterLink></li>
            <li><FooterLink href="/#how">How It Works</FooterLink></li>
            <li><FooterLink href="/#compare">Compare</FooterLink></li>
          </ul>
        </div>


        <div>
          <div className="font-syne text-[13px] font-bold uppercase tracking-wider text-text-muted mb-4">Company</div>
          <ul className="flex flex-col gap-2.5">
            <li><FooterLink href="#">About Sartor</FooterLink></li>
            <li><FooterLink href="#">Contact</FooterLink></li>
            <li><FooterLink href="https://sartor.ng">Privacy Policy</FooterLink></li>
            <li><FooterLink href="https://sartor.ng">Terms of Service</FooterLink></li>
          </ul>
        </div>
      </div>

      <div style={{
        borderColor: 'var(--border)'
      }} className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t text-[13px] text-text-muted gap-3">
        <span>© 2026 Sartor Limited. All rights reserved.</span>
        <span>sartor.ng · crm.sartor.ng · sartorhealth.com</span>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, to, children }) => {
  if (to) {
    return (
      <Link to={to} className="text-[14px] text-text-muted hover:text-white transition-colors duration-220">
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className="text-[14px] text-text-muted hover:text-white transition-colors duration-220">
      {children}
    </a>
  );
};

export default Footer;
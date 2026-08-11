import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const logo = '/favicon.jpg';

const Navbar = ({ isDark, toggleTheme, openModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: 'Overview', href: '#overview' },
    { name: 'Features', href: '#features' },
    { name: 'Roles', href: '#roles' },
    { name: 'How It Works', href: '#how' },
    { name: 'Compare', href: '#compare' },
  ];

  const ThemeToggleIcon = () => (
    isDark ? (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ) : (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    )
  );

  return (
    <>
      <nav style={{
        background: isDark ? 'rgba(11, 22, 64, 0.88)' : 'rgba(240, 242, 250, 0.92)',
        borderColor: 'var(--border)'
      }} className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-[5%] h-[68px] backdrop-blur-[18px] border-b-[0.5px] transition-colors duration-220 ease-custom">
        <Link to="/" className="flex items-center gap-[10px] font-syne font-bold text-[18px] tracking-[-0.02em] text-[var(--white)]">
          <img src={logo} alt="SartorCRM Logo" className="w-[34px] h-[34px] rounded-full" />
          <span className="text-[12px] sm:text-[18px]">Sartor <span className='text-orange'>CRM</span> </span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden lg:flex gap-[36px] list-none">
          {navLinks.map((item) => (
            <li key={item.name}>
              <a
                href={isHomePage ? item.href : `/${item.href}`}
                className="text-[14px] font-medium text-[var(--text-muted)] hover:text-[var(--white)] transition-colors duration-220"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-[10px] sm:gap-[14px]">
          {/* Desktop Theme Toggle & Sign In */}
          <div className="hidden lg:flex items-center gap-[14px]">
            <button
              onClick={toggleTheme}
              className="w-[36px] h-[36px] rounded-[8px] bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] cursor-pointer flex items-center justify-center transition-all duration-220 text-[var(--text-muted)] hover:bg-[var(--card-bg-hover)] hover:text-[var(--white)]"
              aria-label="Toggle theme"
            >
              <ThemeToggleIcon />
            </button>
            <Link
              to="/login"
              className="text-[14px] font-medium text-[var(--text-muted)] hover:text-[var(--white)] transition-colors duration-220"
            >
              Sign in
            </Link>
          </div>

          {/* Persistent CTA Button */}
          <button
            onClick={openModal}
            className="btn-pilot btn-pilot-nav"
          >
            Request Pilot
          </button>

          {/* Hamburger Menu Button (Mobile/Tablet Only) */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden w-[36px] h-[36px] rounded-[8px] bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--white)] transition-all duration-220"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Modal */}
      <div
      style={{
        background: isDark ? 'rgba(11, 22, 64, 0.88)' : 'rgba(240, 242, 250, 0.92)',
        borderColor: 'var(--border)'
      }}
        className={`fixed inset-0 z-[200] backdrop-blur-[12px] flex flex-col p-6 transition-all duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-[10px] font-syne font-bold text-[18px] tracking-[-0.02em] text-[var(--white)]">
            <Link to="/" className="flex items-center gap-[10px] font-syne font-bold text-[18px] tracking-[-0.02em] text-[var(--white)]">
              <img src={logo} alt="SartorCRM Logo" className="w-[34px] h-[34px] rounded-full" />
              <span className="text-[12px] sm:text-[18px]">Sartor <span className='text-orange'>CRM</span> </span>
            </Link>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="w-9 h-9 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--white)] transition-all duration-220"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <ul className="flex flex-col gap-6 list-none mb-10">
          {navLinks.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-[28px] font-syne font-bold text-[var(--white)] hover:text-[var(--orange)] transition-colors"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8 border-t border-[var(--border)] flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[var(--text-muted)]">Switch Appearance</span>
            <button
              onClick={toggleTheme}
              className="w-[44px] h-[44px] rounded-[10px] bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] cursor-pointer flex items-center justify-center transition-all duration-220 text-[var(--white)]"
            >
              <ThemeToggleIcon />
            </button>
          </div>
          <Link
            to="/login"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-center gap-[8px] w-full py-4 rounded-[12px] font-dm text-[16px] font-bold bg-[var(--card-bg)] border-[0.5px] border-[var(--border-light)] text-[var(--white)] active:bg-[var(--card-bg-hover)]"
          >
            Sign in to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;

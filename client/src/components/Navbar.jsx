import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ currentView, onViewChange, onReservedAccess, backendUrl }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        <a className="brand" onClick={() => onViewChange('home')}>
          <img
            src={`${backendUrl}/uploads/logo.png`}
            alt="Rami Arnaout Architects"
            className="brand-logo"
            onError={(e) => {
              e.target.onerror = null;
              // Fallback to simple logo text or circle if image fails to load
              e.target.style.display = 'none';
            }}
          />
          <div className="brand-text">
            <span className="brand-name">Rami Arnaout</span>
            <span className="brand-tag">Architects</span>
          </div>
        </a>

        {/* Desktop Links */}
        <ul className="nav-links">
          <li>
            <a
              className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => {
                onViewChange('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Home
            </a>
          </li>
          <li>
            <a
              className="nav-link"
              onClick={() => {
                onViewChange('home');
                setTimeout(() => {
                  document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              Categories
            </a>
          </li>
          <li>
            <a
              className="nav-link"
              onClick={() => {
                onViewChange('home');
                setTimeout(() => {
                  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              Projects
            </a>
          </li>
          <li>
            <a
              className="nav-link"
              onClick={() => {
                onViewChange('home');
                setTimeout(() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              Contact
            </a>
          </li>
          <li>
            <a
              className={`nav-link ${currentView === 'about' ? 'active' : ''}`}
              onClick={() => onViewChange('about')}
            >
              About
            </a>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer (Basic styled toggle) */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: 0,
          width: '100%',
          background: 'rgba(8, 8, 8, 0.98)',
          borderBottom: '1px solid var(--border-glass)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          zIndex: 99
        }}>
          <a
            style={{ textDecoration: 'none', color: '#fff', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            onClick={() => {
              onViewChange('home');
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Home
          </a>
          <a
            style={{ textDecoration: 'none', color: '#fff', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            onClick={() => {
              onViewChange('home');
              setMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Categories
          </a>
          <a
            style={{ textDecoration: 'none', color: '#fff', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            onClick={() => {
              onViewChange('home');
              setMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Projects
          </a>
          <a
            style={{ textDecoration: 'none', color: '#fff', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            onClick={() => {
              onViewChange('home');
              setMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Contact
          </a>
          <a
            style={{ textDecoration: 'none', color: currentView === 'about' ? 'var(--accent-orange)' : '#fff', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            onClick={() => {
              onViewChange('about');
              setMobileMenuOpen(false);
            }}
          >
            About
          </a>
        </div>
      )}
    </nav>
  );
}

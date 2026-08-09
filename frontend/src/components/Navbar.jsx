import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './Navbar.css'

export default function Navbar({ onQuoteClick, onNavigateHome, onNavigateVertical, viewState = 'home', activeVertical = '' }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const categories = [
    { label: 'Home', id: 'home', action: () => onNavigateHome() },
    { label: 'Health & Life', id: 'health', action: () => onNavigateVertical('health') },
    { label: 'Auto & Home', id: 'insurance', action: () => onNavigateVertical('insurance') },
    { label: 'Home Services', id: 'home-services', action: () => onNavigateVertical('home-services') },
    { label: 'Finance', id: 'finance', action: () => onNavigateVertical('finance') },
    { label: 'Legal Help', id: 'legal', action: () => onNavigateVertical('legal') },
  ]

  const isCategoryActive = (catId) => {
    if (catId === 'home') return viewState === 'home'
    return (viewState === 'vertical' || viewState === 'sub-vertical') && activeVertical === catId
  }

  const handleLinkClick = (action) => {
    setMobileOpen(false)
    if (action) action()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar-inner">
        <a className="navbar-logo" href="#" onClick={(e) => { e.preventDefault(); handleLinkClick(onNavigateHome) }}>
          <div className="navbar-logo-icon">SB</div>
          Smart<span>Buyer</span>Quotes
        </a>

        <div className="navbar-links">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`navbar-link ${isCategoryActive(cat.id) ? 'active' : ''}`}
              onClick={() => handleLinkClick(cat.action)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary navbar-cta desktop-only"
          onClick={onQuoteClick}
        >
          Get Free Quote
        </button>

        <button
          className={`navbar-toggle ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`navbar-link ${isCategoryActive(cat.id) ? 'active' : ''}`}
              onClick={() => handleLinkClick(cat.action)}
            >
              {cat.label}
            </button>
          ))}
          <button className="btn btn-primary" onClick={() => { setMobileOpen(false); onQuoteClick() }}>
            Get Free Quote
          </button>
        </div>
      </div>
    </motion.nav>
  )
}


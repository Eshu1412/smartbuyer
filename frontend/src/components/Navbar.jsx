import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './Navbar.css'

export default function Navbar({ 
  onQuoteClick, 
  onNavigateHome, 
  onNavigateVertical, 
  viewState = 'home', 
  activeVertical = '' 
}) {
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
    { label: 'Home', id: 'home', path: '/', action: () => onNavigateHome() },
    { label: 'Health & Life', id: 'health', path: '/services/health', action: () => onNavigateVertical('health') },
    { label: 'Auto & Home', id: 'insurance', path: '/services/insurance', action: () => onNavigateVertical('insurance') },
    { label: 'Home Services', id: 'home-services', path: '/services/home-services', action: () => onNavigateVertical('home-services') },
    { label: 'Finance', id: 'finance', path: '/services/finance', action: () => onNavigateVertical('finance') },
    { label: 'Legal Help', id: 'legal', path: '/services/legal', action: () => onNavigateVertical('legal') },
    { label: 'Flight Booking', id: 'travel', path: '/services/travel', action: () => onNavigateVertical('travel') },
  ]

  const isCategoryActive = (catId) => {
    if (catId === 'home') return viewState === 'home'
    return (viewState === 'vertical' || viewState === 'sub-vertical') && activeVertical === catId
  }

  const handleLinkClick = (action) => {
    setMobileOpen(false)
    if (action) action()
  }

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar-inner">
        <a
          className="navbar-logo"
          href="/"
          onClick={(e) => {
            e.preventDefault()
            handleLinkClick(onNavigateHome)
          }}
        >
          <div className="navbar-logo-icon">SQ</div>
          Smart<span>Quote</span>Hub
        </a>

        <div className="navbar-links">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={cat.path}
              className={`navbar-link ${isCategoryActive(cat.id) ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                handleLinkClick(cat.action)
              }}
            >
              {cat.label}
            </a>
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
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={cat.path}
              className={`navbar-link ${isCategoryActive(cat.id) ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                handleLinkClick(cat.action)
              }}
            >
              {cat.label}
            </a>
          ))}

          <button
            className="btn btn-primary"
            onClick={() => {
              setMobileOpen(false)
              onQuoteClick()
            }}
          >
            Get Free Quote
          </button>
        </div>
      </div>
    </motion.nav>
  )
}

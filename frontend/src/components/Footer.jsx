import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import ScrollReveal from './ScrollReveal'
import './Footer.css'

export default function Footer({ 
  onQuoteClick,
  onNavigateVertical,
  onNavigateSubVertical,
  onNavigateLegal,
  onNavigateSiteMap
}) {
  const currentYear = new Date().getFullYear()

  const handleLink = (e, callback) => {
    e.preventDefault()
    if (callback) callback()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* ── Amber CTA Band ─────────────────────────── */}
      <section className="cta-band">
        <div className="cta-band-geo">
          <div className="cta-band-geo-shape"></div>
          <div className="cta-band-geo-shape"></div>
        </div>
        <div className="container">
          <ScrollReveal duration={0.4}>
            <div className="cta-band-content">
              <h2 className="cta-band-title">Ready to Save?</h2>
              <p className="cta-band-text">
                Join 10,000+ users who found better deals through SmartQuoteHub. It's free, fast, and secure.
              </p>
              <button className="btn" onClick={onQuoteClick}>
                Get Your Free Quote Now
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">SQ</div>
                Smart<span>Quote</span>Hub
              </div>
              <p className="footer-tagline">
                Connecting you with top-rated professionals nationwide. Fast, free, and completely secure.
                Your one-stop platform for comparing plans and getting the best quotes.
              </p>
              <div className="footer-socials">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook"><FaFacebookF /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Twitter"><FaTwitter /></a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn"><FaLinkedinIn /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram"><FaInstagram /></a>
              </div>
            </div>

            {/* Top Services */}
            <div className="footer-column">
              <h4 className="footer-column-title">Top Services</h4>
              <div className="footer-links">
                <a
                  href="/services/health/health-aca"
                  className="footer-link"
                  onClick={(e) => handleLink(e, () => onNavigateSubVertical && onNavigateSubVertical('health', 'health-aca'))}
                >
                  Health Insurance (ACA)
                </a>
                <a
                  href="/services/health/medicare"
                  className="footer-link"
                  onClick={(e) => handleLink(e, () => onNavigateSubVertical && onNavigateSubVertical('health', 'medicare'))}
                >
                  Medicare Advantage
                </a>
                <a
                  href="/services/insurance/auto"
                  className="footer-link"
                  onClick={(e) => handleLink(e, () => onNavigateSubVertical && onNavigateSubVertical('insurance', 'auto'))}
                >
                  Auto Insurance
                </a>
                <a
                  href="/services/home-services/roofing"
                  className="footer-link"
                  onClick={(e) => handleLink(e, () => onNavigateSubVertical && onNavigateSubVertical('home-services', 'roofing'))}
                >
                  Roofing Contractors
                </a>
                <a
                  href="/services/finance/debt-relief"
                  className="footer-link"
                  onClick={(e) => handleLink(e, () => onNavigateSubVertical && onNavigateSubVertical('finance', 'debt-relief'))}
                >
                  Debt Relief Programs
                </a>
                <a
                  href="/services/travel"
                  className="footer-link"
                  onClick={(e) => handleLink(e, () => onNavigateVertical && onNavigateVertical('travel'))}
                >
                  Flight Booking
                </a>
              </div>
            </div>

            {/* Legal & Privacy */}
            <div className="footer-column">
              <h4 className="footer-column-title">Legal &amp; Privacy</h4>
              <div className="footer-links">
                <a
                  href="/privacy-policy"
                  className="footer-link"
                  onClick={(e) => handleLink(e, () => onNavigateLegal && onNavigateLegal('privacy'))}
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms-of-service"
                  className="footer-link"
                  onClick={(e) => handleLink(e, () => onNavigateLegal && onNavigateLegal('terms'))}
                >
                  Terms of Service
                </a>
                <a
                  href="/sitemap"
                  className="footer-link"
                  onClick={(e) => handleLink(e, () => onNavigateSiteMap && onNavigateSiteMap())}
                >
                  HTML Directory Sitemap
                </a>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  XML Sitemap
                </a>
              </div>
            </div>

            {/* Contact */}
            <div className="footer-column">
              <h4 className="footer-column-title">Contact</h4>
              <div className="footer-contact-item">
                <FaEnvelope className="footer-contact-icon" />
                <span>support@smartquotehub.com</span>
              </div>
              <div className="footer-contact-item">
                <FaPhone className="footer-contact-icon" />
                <span>1-800-555-0199</span>
              </div>
              <div className="footer-contact-item">
                <FaMapMarkerAlt className="footer-contact-icon" />
                <span>Nationwide, USA</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              © {currentYear} SmartQuoteHub. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a
                href="/sitemap"
                className="footer-bottom-link"
                onClick={(e) => handleLink(e, () => onNavigateSiteMap && onNavigateSiteMap())}
              >
                Sitemap
              </a>
              <a
                href="/privacy-policy"
                className="footer-bottom-link"
                onClick={(e) => handleLink(e, () => onNavigateLegal && onNavigateLegal('privacy'))}
              >
                Privacy
              </a>
              <a
                href="/terms-of-service"
                className="footer-bottom-link"
                onClick={(e) => handleLink(e, () => onNavigateLegal && onNavigateLegal('terms'))}
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

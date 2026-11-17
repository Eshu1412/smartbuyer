import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import ScrollReveal from './ScrollReveal'
import './Footer.css'

export default function Footer({ onQuoteClick, onNavigateHome, onNavigateVertical }) {
  const currentYear = new Date().getFullYear()

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
                <span className="footer-logo-text">Smart<span className="footer-logo-accent">Quote</span>Hub</span>
              </div>
              <p className="footer-tagline">
                Connecting you with top-rated professionals nationwide. Fast, free, and completely secure.
                Your one-stop platform for comparing plans and getting the best quotes.
              </p>
              <div className="footer-socials">
                <a href="#" className="footer-social-link" aria-label="Facebook"><FaFacebookF /></a>
                <a href="#" className="footer-social-link" aria-label="Twitter"><FaTwitter /></a>
                <a href="#" className="footer-social-link" aria-label="LinkedIn"><FaLinkedinIn /></a>
                <a href="#" className="footer-social-link" aria-label="Instagram"><FaInstagram /></a>
              </div>
            </div>

            {/* Top Services */}
            <div className="footer-column">
              <h4 className="footer-column-title">Top Services</h4>
              <div className="footer-links">
                <a href="#services" className="footer-link" onClick={(e) => { e.preventDefault(); onNavigateVertical ? onNavigateVertical('health') : onNavigateHome?.() }}>Health Insurance</a>
                <a href="#services" className="footer-link" onClick={(e) => { e.preventDefault(); onNavigateVertical ? onNavigateVertical('home-services') : onNavigateHome?.() }}>Home Improvement</a>
                <a href="#services" className="footer-link" onClick={(e) => { e.preventDefault(); onNavigateVertical ? onNavigateVertical('insurance') : onNavigateHome?.() }}>Auto & Home</a>
                <a href="#services" className="footer-link" onClick={(e) => { e.preventDefault(); onNavigateVertical ? onNavigateVertical('finance') : onNavigateHome?.() }}>Debt Relief</a>
                <a href="#services" className="footer-link" onClick={(e) => { e.preventDefault(); onNavigateVertical ? onNavigateVertical('health') : onNavigateHome?.() }}>Medicare</a>
              </div>
            </div>

            {/* Legal & Privacy */}
            <div className="footer-column">
              <h4 className="footer-column-title">Legal & Privacy</h4>
              <div className="footer-links">
                <a href="#footer" className="footer-link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                <a href="#footer" className="footer-link" onClick={(e) => e.preventDefault()}>Terms of Service</a>
                <a href="#footer" className="footer-link" onClick={(e) => e.preventDefault()}>Do Not Sell My Info</a>
                <a href="#footer" className="footer-link" onClick={(e) => e.preventDefault()}>Cookie Policy</a>
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
              <a href="#footer" className="footer-bottom-link" onClick={(e) => e.preventDefault()}>Sitemap</a>
              <a href="#footer" className="footer-bottom-link" onClick={(e) => e.preventDefault()}>Accessibility</a>
              <a href="#footer" className="footer-bottom-link" onClick={(e) => e.preventDefault()}>Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

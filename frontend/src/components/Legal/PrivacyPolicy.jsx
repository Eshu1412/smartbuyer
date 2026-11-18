import React from 'react'
import { FaHome, FaChevronRight, FaShieldAlt } from 'react-icons/fa'
import './Legal.css'

export default function PrivacyPolicy({ onNavigateHome }) {
  return (
    <div className="legal-page section">
      <div className="container max-w-4xl">
        <nav className="breadcrumb">
          <button onClick={onNavigateHome} className="breadcrumb-link">
            <FaHome style={{ marginRight: '6px' }} /> Home
          </button>
          <FaChevronRight className="breadcrumb-separator" />
          <span className="breadcrumb-current">Privacy Policy</span>
        </nav>

        <header className="legal-header">
          <div className="legal-badge">
            <FaShieldAlt style={{ marginRight: '6px' }} /> Security & Transparency
          </div>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">Effective Date: October 10, 2026 | Last Updated: October 2026</p>
        </header>

        <article className="legal-content">
          <section>
            <h2>1. Information We Collect</h2>
            <p>
              At SmartQuoteHub, we are committed to safeguarding your privacy. When you use our quote comparison platform, we collect information you provide directly, such as your full name, email address, telephone number, ZIP code, service preferences, and answers to qualification questionnaires.
            </p>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>
              We utilize collected information solely to:
            </p>
            <ul>
              <li>Match your inquiry with licensed insurance carriers, contractors, and financial specialists in your region.</li>
              <li>Provide accurate, personalized quotes and rate comparisons.</li>
              <li>Verify compliance with consumer protection and TCPA guidelines via TrustedForm certification.</li>
              <li>Improve site performance, user experience, and customer support.</li>
            </ul>
          </section>

          <section>
            <h2>3. Data Protection and Encryption</h2>
            <p>
              We enforce 256-bit SSL encryption across all data transmissions. We maintain administrative, physical, and technical safeguards designed to protect personal data against unauthorized access, loss, or misuse.
            </p>
          </section>

          <section>
            <h2>4. Your Privacy Rights (CCPA / CPRA / GDPR)</h2>
            <p>
              You have the right to request access to the personal information we hold about you, request its correction or permanent deletion, and opt out of the sale or sharing of your personal data at any time by contacting our privacy compliance team at <strong>support@smartquotehub.com</strong>.
            </p>
          </section>

          <section>
            <h2>5. Contact Us</h2>
            <p>
              If you have any questions regarding this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
              SmartQuoteHub Compliance Team<br />
              Email: support@smartquotehub.com<br />
              Toll-Free: 1-800-555-0199
            </p>
          </section>
        </article>

        <div className="legal-footer-nav">
          <button onClick={onNavigateHome} className="btn btn-primary">
            Return to Home
          </button>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { FaHome, FaChevronRight, FaFileContract } from 'react-icons/fa'
import './Legal.css'

export default function TermsOfService({ onNavigateHome }) {
  return (
    <div className="legal-page section">
      <div className="container max-w-4xl">
        <nav className="breadcrumb">
          <button onClick={onNavigateHome} className="breadcrumb-link">
            <FaHome style={{ marginRight: '6px' }} /> Home
          </button>
          <FaChevronRight className="breadcrumb-separator" />
          <span className="breadcrumb-current">Terms of Service</span>
        </nav>

        <header className="legal-header">
          <div className="legal-badge">
            <FaFileContract style={{ marginRight: '6px' }} /> Terms & Conditions
          </div>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-subtitle">Effective Date: October 10, 2026 | Last Updated: October 2026</p>
        </header>

        <article className="legal-content">
          <section>
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using the SmartQuoteHub website and quote comparison matching services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our website or submitting quote requests.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              SmartQuoteHub is a free online marketplace connecting consumers with third-party licensed insurance carriers, home service contractors, and financial specialists. SmartQuoteHub is not an insurance carrier, contractor, or lending institution; quotes and terms provided are determined solely by participating independent providers.
            </p>
          </section>

          <section>
            <h2>3. Telephone Consumer Protection Act (TCPA) Consent</h2>
            <p>
              By submitting a quote request and providing your telephone number, you provide express written consent authorizing SmartQuoteHub and its designated network partners to contact you via telephone, automated dialing technology, SMS text messaging, and prerecorded messages for quote fulfillment. Providing consent is not a required condition of purchase.
            </p>
          </section>

          <section>
            <h2>4. Limitation of Liability</h2>
            <p>
              SmartQuoteHub provides all estimates and informational guides on an "as is" and "as available" basis. We make no representations or warranties regarding third-party service provider availability, exact rate qualifications, or project outcomes.
            </p>
          </section>

          <section>
            <h2>5. Governing Law</h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the United States. Any disputes arising shall be resolved under applicable federal and state jurisdictions.
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

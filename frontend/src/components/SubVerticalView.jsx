import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FaHome, FaChevronRight, FaCheckCircle, FaLock, FaShieldAlt, FaHeartbeat,
  FaHammer, FaHandHoldingUsd, FaGavel, FaStethoscope, FaHeart, FaFileAlt,
  FaCar, FaHome as FaHomeIcon, FaLayerGroup, FaTint, FaThermometerHalf,
  FaWindowMaximize, FaBath, FaBug, FaWater, FaWrench, FaTools, FaBroom,
  FaTree, FaChartLine, FaMoneyBillWave, FaCarCrash, FaUserNurse, FaStar,
  FaPlus, FaMinus, FaLightbulb, FaCheck, FaArrowLeft
} from 'react-icons/fa'
import { servicesDb } from '../data/servicesData'
import { updatePageSEO, buildSubVerticalSchema } from '../utils/seo'
import './SubVerticalView.css'

const iconMap = {
  FaHeartbeat,
  FaShieldAlt,
  FaHammer,
  FaHandHoldingUsd,
  FaGavel,
  FaStethoscope,
  FaHeart,
  FaFileAlt,
  FaCar,
  FaHome: FaHomeIcon,
  FaLayerGroup,
  FaTint,
  FaThermometerHalf,
  FaWindowMaximize,
  FaBath,
  FaBug,
  FaWater,
  FaWrench,
  FaTools,
  FaBroom,
  FaTree,
  FaChartLine,
  FaMoneyBillWave,
  FaCarCrash,
  FaUserNurse,
  FaActivity: FaHeartbeat
}

export default function SubVerticalView({
  verticalId,
  subId,
  onNavigateHome,
  onNavigateVertical,
  onNavigateSubVertical,
  onFormSubmitted
}) {
  const vertical = servicesDb[verticalId]
  const sub = vertical?.subs?.[subId]

  const [customAnswers, setCustomAnswers] = useState({})
  const [contactData, setContactData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    zip_code: '',
    tcpa_consent: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  // Synchronize SEO Title, Meta Tags, Canonical, and Schema.org JSON-LD
  useEffect(() => {
    if (vertical && sub) {
      const schema = buildSubVerticalSchema({ vertical, sub, verticalId, subId })
      updatePageSEO({
        title: sub.seoTitle || `${sub.title} Plans & Free Quotes 2026`,
        description: sub.seoDesc || sub.desc,
        keywords: sub.keywords,
        path: `/services/${verticalId}/${subId}`,
        schema
      })
    }
  }, [verticalId, subId, vertical, sub])

  if (!vertical || !sub) {
    return (
      <div className="subvertical-error section">
        <div className="container text-center">
          <h2>Service Not Found</h2>
          <p>The requested service category could not be located.</p>
          <button onClick={onNavigateHome} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  const HeaderIcon = iconMap[sub.icon] || FaShieldAlt

  const handleCustomChange = (e) => {
    setCustomAnswers({ ...customAnswers, [e.target.name]: e.target.value })
  }

  const handleContactChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setContactData({ ...contactData, [e.target.name]: value })
  }

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const tfCertUrl =
      document.getElementById('xxTrustedFormCertUrl')?.value ||
      document.querySelector('input[name="xxTrustedFormCertUrl"]')?.value ||
      ''

    const payload = {
      vertical_id: verticalId,
      sub_id: subId,
      service_type: sub.title,
      full_name: `${contactData.first_name} ${contactData.last_name}`.trim(),
      email: contactData.email,
      phone: contactData.phone,
      zip_code: contactData.zip_code,
      trusted_form_cert_url: tfCertUrl,
      answers: customAnswers,
    }

    try {
      await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (err) {
      console.warn('Backend endpoint unavailable, continuing to confirmation view.', err)
    } finally {
      setSubmitting(false)
      if (onFormSubmitted) {
        onFormSubmitted({
          name: `${contactData.first_name} ${contactData.last_name}`.trim() || 'Valued Customer',
          first_name: contactData.first_name,
          last_name: contactData.last_name,
          email: contactData.email,
          phone: contactData.phone,
          zip_code: contactData.zip_code,
          service: sub.title,
          category: vertical.title,
          answers: customAnswers,
        })
      }
    }
  }

  return (
    <article className="subvertical-view section">
      <div className="container max-w-5xl">
        {/* Breadcrumbs with Semantic Schema markup */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              onNavigateHome()
            }}
            className="breadcrumb-link"
          >
            <FaHome style={{ marginRight: '6px' }} /> Home
          </a>
          <FaChevronRight className="breadcrumb-separator" />
          <a
            href={`/services/${verticalId}`}
            onClick={(e) => {
              e.preventDefault()
              onNavigateVertical(verticalId)
            }}
            className="breadcrumb-link"
          >
            {vertical.title}
          </a>
          <FaChevronRight className="breadcrumb-separator" />
          <span className="breadcrumb-current" aria-current="page">{sub.title}</span>
        </nav>

        {/* Header */}
        <header className="subvertical-header">
          <div className="subvertical-icon-box" aria-hidden="true">
            <HeaderIcon />
          </div>
          <h1 className="subvertical-title">{sub.title} Plans &amp; Free Quotes</h1>
          <p className="subvertical-subtitle">
            {sub.seoDesc || sub.desc} Compare options below and check your local rates securely in under 60 seconds.
          </p>

          <div className="subvertical-trust-badges">
            <span className="badge-pill">★ 4.9/5 Rating (3,200+ Reviews)</span>
            <span className="badge-pill">✓ 100% Free Comparison</span>
            <span className="badge-pill">🔒 256-Bit SSL Encrypted</span>
          </div>
        </header>

        {/* Plans Grid */}
        <section className="subvertical-plans-section">
          <h2 className="section-subheading">Popular {sub.title} Coverage &amp; Service Tiers</h2>
          <div className={`plans-grid plans-grid--${Math.min(sub.plans.length, 3)}`}>
            {sub.plans.map((plan, idx) => (
              <motion.div
                key={idx}
                className="plan-card"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="plan-card-top"></div>
                <div className="plan-card-body">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">{plan.price}</div>
                  <p className="plan-detail">{plan.detail}</p>
                  <ul className="plan-features">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="plan-feature-item">
                        <FaCheckCircle className="feature-check" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#form-container"
                    className="btn btn-outline plan-cta-btn"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('form-container')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Select Plan &amp; Check Rates
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Form Container */}
        <section className="form-wrapper" id="form-container">
          <div className="form-banner">
            <h2>Check Your Eligibility &amp; Get Local Pricing</h2>
            <p>
              <FaLock style={{ marginRight: '6px' }} /> Takes less than 60 seconds. 100% free with no obligation.
            </p>
          </div>

          <form className="qualification-form" onSubmit={handleSubmit}>
            {/* TrustedForm Certificate Hidden Field */}
            <input type="hidden" id="xxTrustedFormCertUrl" name="xxTrustedFormCertUrl" />

            {/* Step 1: Your Needs */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="step-badge">1</span> Your Needs &amp; Qualifications
              </h3>
              <div className="form-questions-grid">
                {sub.form.map((field, fIdx) => (
                  <div key={fIdx} className="form-field-group">
                    <label className="form-label" htmlFor={`field-${field.name}`}>{field.label}</label>
                    <select
                      id={`field-${field.name}`}
                      name={field.name}
                      required
                      className="form-select"
                      value={customAnswers[field.name] || ''}
                      onChange={handleCustomChange}
                    >
                      <option value="" disabled>-- Select an option --</option>
                      {field.options.map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Contact Details */}
            <div className="form-section pt-4">
              <h3 className="form-section-title">
                <span className="step-badge">2</span> Contact Details &amp; Location
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="first_name">First Name</label>
                  <input
                    id="first_name"
                    type="text"
                    name="first_name"
                    required
                    className="form-input"
                    placeholder="John"
                    value={contactData.first_name}
                    onChange={handleContactChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="last_name">Last Name</label>
                  <input
                    id="last_name"
                    type="text"
                    name="last_name"
                    required
                    className="form-input"
                    placeholder="Doe"
                    value={contactData.last_name}
                    onChange={handleContactChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    required
                    className="form-input"
                    placeholder="(555) 000-0000"
                    value={contactData.phone}
                    onChange={handleContactChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    className="form-input"
                    placeholder="john@example.com"
                    value={contactData.email}
                    onChange={handleContactChange}
                  />
                </div>
              </div>

              <div className="form-group zip-group">
                <label className="form-label" htmlFor="zip_code">ZIP Code</label>
                <input
                  id="zip_code"
                  type="text"
                  name="zip_code"
                  required
                  pattern="[0-9]{5}"
                  maxLength={5}
                  className="form-input"
                  placeholder="12345"
                  value={contactData.zip_code}
                  onChange={handleContactChange}
                />
              </div>
            </div>

            {/* TCPA Compliance */}
            <div className="tcpa-box">
              <label className="tcpa-label">
                <input
                  type="checkbox"
                  name="tcpa_consent"
                  required
                  checked={contactData.tcpa_consent}
                  onChange={handleContactChange}
                  className="tcpa-checkbox"
                />
                <span className="tcpa-text">
                  By checking this box and clicking "Get My Quote Securely", you agree to our <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. You authorize SmartQuoteHub and its partners to contact you at the phone number provided, including via automated dialing systems, prerecorded messages, and text messages. Consent is not a condition of purchase.
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
              <FaShieldAlt style={{ marginRight: '8px' }} />
              <span>{submitting ? 'Processing Request...' : 'Get My Quote Securely'}</span>
            </button>
          </form>
        </section>

        {/* SEO Rich Consumer Buying Guide & Content Section */}
        {sub.guide && (
          <section className="seo-guide-section">
            <h2 className="guide-headline">{sub.guide.headline}</h2>
            <div className="guide-paragraphs">
              {sub.guide.paragraphs.map((p, idx) => (
                <p key={idx} className="guide-text">{p}</p>
              ))}
            </div>

            {sub.guide.tips && sub.guide.tips.length > 0 && (
              <div className="guide-tips-box">
                <h3 className="guide-tips-title">
                  <FaLightbulb style={{ color: '#F59E0B', marginRight: '8px' }} />
                  Expert Tips to Save on {sub.title}
                </h3>
                <ul className="guide-tips-list">
                  {sub.guide.tips.map((tip, idx) => (
                    <li key={idx}>
                      <FaCheck className="guide-check" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Why Choose SmartQuoteHub Comparison Grid */}
        <section className="seo-why-choose">
          <h2 className="section-subheading">Why Compare {sub.title} with SmartQuoteHub?</h2>
          <div className="why-choose-grid">
            <div className="why-card">
              <div className="why-icon-circle">100%</div>
              <h3>Completely Free</h3>
              <p>Our rate comparison tools are 100% free for consumers with zero obligation or hidden service charges.</p>
            </div>
            <div className="why-card">
              <div className="why-icon-circle">★</div>
              <h3>Pre-Screened Network</h3>
              <p>We partner only with verified, licensed, and highly rated providers and carriers across the United States.</p>
            </div>
            <div className="why-card">
              <div className="why-icon-circle">60s</div>
              <h3>Fast &amp; Convenient</h3>
              <p>Answer a few simple questions in under a minute to receive matched quotes tailored to your exact ZIP code.</p>
            </div>
            <div className="why-card">
              <div className="why-icon-circle">🔒</div>
              <h3>Safe &amp; Confidential</h3>
              <p>Your personal information is protected with industry-standard 256-bit SSL encryption and strict privacy protocols.</p>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions (Structured for Google FAQ Rich Snippets) */}
        {sub.faqs && sub.faqs.length > 0 && (
          <section className="seo-faqs-section">
            <h2 className="section-subheading">Frequently Asked Questions About {sub.title}</h2>
            <div className="faq-accordion">
              {sub.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx
                return (
                  <div key={idx} className={`faq-accordion-item ${isOpen ? 'open' : ''}`}>
                    <button
                      className="faq-accordion-header"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-q-text">{faq.question}</span>
                      <span className="faq-q-icon">{isOpen ? <FaMinus /> : <FaPlus />}</span>
                    </button>
                    {isOpen && (
                      <div className="faq-accordion-body">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Bottom Navigation & Internal Link Directory */}
        <nav className="subvertical-bottom-nav">
          <a
            href={`/services/${verticalId}`}
            className="btn btn-outline"
            onClick={(e) => {
              e.preventDefault()
              onNavigateVertical(verticalId)
            }}
          >
            <FaArrowLeft style={{ marginRight: '8px' }} />
            Explore All {vertical.title} Services
          </a>

          <a
            href="/"
            className="btn btn-secondary"
            onClick={(e) => {
              e.preventDefault()
              onNavigateHome()
            }}
          >
            Return to Homepage
          </a>
        </nav>
      </div>
    </article>
  )
}

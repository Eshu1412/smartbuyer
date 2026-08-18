import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaCheck, FaExternalLinkAlt } from 'react-icons/fa'
import './QuoteForm.css'

const REFERRAL_LINK = 'https://smartquotehub.shop/'

const SERVICE_OPTIONS = [
  'Health Insurance',
  'Home Improvement',
  'Auto & Home Insurance',
  'Debt Relief',
  'Legal Help',
  'Medicare',
]

export default function QuoteForm({ isOpen, onClose, defaultService = '' }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    service_type: defaultService || '',
    zip_code: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        service_type: defaultService || prev.service_type || SERVICE_OPTIONS[0]
      }))
    }
  }, [defaultService, isOpen])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Capture ActiveProspect TrustedForm certificate URL from generated hidden field
    const tfCertUrl = document.getElementById('xxTrustedFormCertUrl')?.value || document.querySelector('input[name="xxTrustedFormCertUrl"]')?.value || ''
    const payload = {
      ...formData,
      trusted_form_cert_url: tfCertUrl,
    }

    try {
      const res = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setSuccess(true)
      setSuccessMessage(data.message || 'Your request has been submitted!')
    } catch {
      setSuccess(true)
      setSuccessMessage(`Thank you, ${formData.full_name}! Your quote request has been received. We'll reach out shortly.`)
    } finally {
      setLoading(false)
      // Automatically open referral link after submission
      setTimeout(() => {
        window.open(`${REFERRAL_LINK}?service=${encodeURIComponent(formData.service_type || 'General')}`, '_blank', 'noopener,noreferrer')
      }, 1000)
    }
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSuccess(false)
      setFormData({ full_name: '', email: '', phone: '', service_type: '', zip_code: '' })
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="quote-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="quote-backdrop" onClick={handleClose} />
          <motion.div
            className="quote-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <button className="quote-close" onClick={handleClose} aria-label="Close form">
              <FaTimes />
            </button>

            {!success ? (
              <>
                <div className="quote-header">
                  <h2>Get Your <span className="accent">Free Quote</span></h2>
                  <p>Fill out the form below and we'll connect you with top providers in your area within minutes.</p>
                </div>

                <form className="quote-form" onSubmit={handleSubmit}>
                  {/* TrustedForm Certificate Hidden Input Field */}
                  <input type="hidden" id="xxTrustedFormCertUrl" name="xxTrustedFormCertUrl" />

                  <div className="form-group">
                    <label className="form-label" htmlFor="quote-name">Full Name</label>
                    <input
                      id="quote-name"
                      className="form-input"
                      type="text"
                      name="full_name"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="quote-email">Email</label>
                      <input
                        id="quote-email"
                        className="form-input"
                        type="email"
                        name="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="quote-phone">Phone</label>
                      <input
                        id="quote-phone"
                        className="form-input"
                        type="tel"
                        name="phone"
                        placeholder="(555) 000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="quote-service">Service Type</label>
                      <select
                        id="quote-service"
                        className="form-select"
                        name="service_type"
                        value={formData.service_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>Select a service</option>
                        {SERVICE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="quote-zip">Zip Code</label>
                      <input
                        id="quote-zip"
                        className="form-input"
                        type="text"
                        name="zip_code"
                        placeholder="10001"
                        value={formData.zip_code}
                        onChange={handleChange}
                        required
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary form-submit"
                    disabled={loading}
                  >
                    {loading ? <span className="spinner"></span> : 'Submit Request'}
                  </button>

                  <div className="referral-banner">
                    <span>Direct Form URL:</span>
                    <a
                      href={`${REFERRAL_LINK}?service=${encodeURIComponent(formData.service_type || 'General')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="referral-link"
                    >
                      smartquotehub.shop <FaExternalLinkAlt style={{ fontSize: '10px' }} />
                    </a>
                  </div>
                </form>
              </>
            ) : (
              <motion.div
                className="quote-success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div className="success-icon"><FaCheck /></div>
                <h3>Request Submitted!</h3>
                <p>{successMessage}</p>

                <div style={{
                  background: 'var(--bg-subtle, #f1f5f9)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  margin: '16px 0',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(226, 232, 240, 0.9)'
                }}>
                  <div style={{ fontWeight: '700', marginBottom: '6px', color: '#0f172a' }}>Confirmed Details:</div>
                  <div><strong>Applicant:</strong> {formData.full_name}</div>
                  <div><strong>Selected Service:</strong> {formData.service_type}</div>
                  <div><strong>Email:</strong> {formData.email}</div>
                  <div><strong>Phone:</strong> {formData.phone}</div>
                  <div><strong>ZIP:</strong> {formData.zip_code}</div>
                </div>

                <a
                  href={`${REFERRAL_LINK}?service=${encodeURIComponent(formData.service_type || 'General')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ marginTop: '0.5rem', display: 'inline-flex' }}
                >
                  Continue to Official Form ↗
                </a>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


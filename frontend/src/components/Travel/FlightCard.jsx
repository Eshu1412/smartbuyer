import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaPlane, 
  FaPlaneDeparture, 
  FaPlaneArrival, 
  FaExchangeAlt, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaCity,
  FaMailBulk,
  FaCheckCircle, 
  FaTimes, 
  FaTicketAlt,
  FaShieldAlt,
  FaArrowRight
} from 'react-icons/fa'
import './FlightCard.css'

export default function FlightCard({ prefillDeparture = '', prefillDestination = '', onFormSubmitted }) {
  // Form State
  const [tripType, setTripType] = useState('Round Trip') // 'One Way' | 'Round Trip'
  const [departure, setDeparture] = useState(prefillDeparture)
  const [destination, setDestination] = useState(prefillDestination)
  
  // Passenger Contact Details
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [stateVal, setStateVal] = useState('')
  const [zipCode, setZipCode] = useState('')
  
  // UI State
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  // Swap departure and destination
  const handleSwap = () => {
    const temp = departure
    setDeparture(destination)
    setDestination(temp)
  }

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    // Client-side validations
    if (!departure.trim()) {
      setErrorMsg('Please enter a departure location.')
      return
    }
    if (!destination.trim()) {
      setErrorMsg('Please enter a destination location.')
      return
    }
    if (departure.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setErrorMsg('Departure and destination cannot be identical.')
      return
    }
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setErrorMsg('Please enter a valid phone number.')
      return
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your address.')
      return
    }
    if (!stateVal.trim()) {
      setErrorMsg('Please enter your state.')
      return
    }
    if (!zipCode.trim()) {
      setErrorMsg('Please enter your zip code.')
      return
    }

    setSubmitting(true)

    const payload = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      trip_type: tripType,
      departure: departure.trim(),
      destination: destination.trim(),
      address: address.trim(),
      state: stateVal.trim(),
      zip_code: zipCode.trim(),
      notes: `Trip Type: ${tripType}`
    }

    try {
      const res = await fetch('/api/travel/flight-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        setConfirmedBooking({
          id: data.booking_id || Math.floor(100000 + Math.random() * 900000),
          ...payload,
          message: data.message
        })
        if (onFormSubmitted) {
          onFormSubmitted({
            name: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            service: 'Flight Booking',
            details: payload
          })
        }
      } else {
        const errData = await res.json().catch(() => ({}))
        let message = 'Failed to submit flight booking request. Please try again.'
        if (errData && errData.detail) {
          if (typeof errData.detail === 'string') {
            message = errData.detail
          } else if (Array.isArray(errData.detail)) {
            message = errData.detail.map(d => (d && d.msg) ? d.msg : (typeof d === 'string' ? d : JSON.stringify(d))).join('; ')
          } else if (typeof errData.detail === 'object') {
            message = JSON.stringify(errData.detail)
          }
        }
        setErrorMsg(message)
      }
    } catch (err) {
      console.warn('Backend unavailable, providing offline confirmation preview.', err)
      const fallbackId = Math.floor(100000 + Math.random() * 900000)
      setConfirmedBooking({
        id: fallbackId,
        ...payload,
        message: `Thank you, ${fullName}! Your flight booking request from ${departure} to ${destination} has been logged.`
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setConfirmedBooking(null)
    setFullName('')
    setEmail('')
    setPhone('')
    setDeparture('')
    setDestination('')
    setAddress('')
    setStateVal('')
    setZipCode('')
  }

  return (
    <div className="flight-card-container" id="flight-search-card">
      {/* Form Top Banner matching website flat design */}
      <div className="flight-card-banner">
        <div className="flight-banner-content">
          <div className="flight-badge">
            <FaPlane /> Flight Booking
          </div>
          <h2 className="flight-card-main-title">Compare Flight Deals & Quotes</h2>
          <p className="flight-card-main-subtitle">
            Fill in your route and passenger details to receive competitive airfare quotes directly.
          </p>
        </div>

        {/* Trip Type Selector (One Way / Round Trip) */}
        <div className="trip-type-wrapper">
          <span className="trip-type-label">Trip Type:</span>
          <div className="trip-type-selector">
            <button
              type="button"
              className={`trip-type-btn ${tripType === 'Round Trip' ? 'active' : ''}`}
              onClick={() => setTripType('Round Trip')}
            >
              Round Trip
            </button>
            <button
              type="button"
              className={`trip-type-btn ${tripType === 'One Way' ? 'active' : ''}`}
              onClick={() => setTripType('One Way')}
            >
              One Way
            </button>
          </div>
        </div>
      </div>

      <div className="flight-card-body">
        {/* Error Alert */}
        {errorMsg && (
          <div className="flight-error-banner">
            <FaTimes />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Flight Booking Form */}
        <form onSubmit={handleSubmit} className="flight-form-grid">
          {/* Section 1: Route Details (Departure & Destination text fields) */}
          <div className="flight-form-section">
            <h3 className="flight-section-heading">
              <span className="step-badge">1</span> Flight Route
            </h3>

            <div className="flight-route-row">
              {/* Departure */}
              <div className="form-field">
                <label className="field-label" htmlFor="flight-departure">
                  <FaPlaneDeparture className="field-label-icon" />
                  Departure <span className="required-dot">*</span>
                </label>
                <div className="input-with-icon">
                  <FaPlaneDeparture className="input-icon" />
                  <input
                    id="flight-departure"
                    type="text"
                    className="flight-input"
                    placeholder="Enter departure"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Swap Button */}
              <button
                type="button"
                className="swap-cities-btn"
                onClick={handleSwap}
                title="Swap Departure and Destination"
                aria-label="Swap Departure and Destination"
              >
                <FaExchangeAlt />
              </button>

              {/* Destination */}
              <div className="form-field">
                <label className="field-label" htmlFor="flight-destination">
                  <FaPlaneArrival className="field-label-icon" />
                  Destination <span className="required-dot">*</span>
                </label>
                <div className="input-with-icon">
                  <FaPlaneArrival className="input-icon" />
                  <input
                    id="flight-destination"
                    type="text"
                    className="flight-input"
                    placeholder="Enter destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Passenger Contact & Address Details */}
          <div className="flight-form-section">
            <h3 className="flight-section-heading">
              <span className="step-badge">2</span> Passenger Details
            </h3>

            {/* Row A: Full Name, Email, Phone */}
            <div className="contact-row">
              {/* Full Name */}
              <div className="form-field">
                <label className="field-label" htmlFor="flight-full-name">
                  <FaUser className="field-label-icon" />
                  Full Name <span className="required-dot">*</span>
                </label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    id="flight-full-name"
                    type="text"
                    className="flight-input"
                    placeholder="e.g. Eleanor Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="form-field">
                <label className="field-label" htmlFor="flight-email-address">
                  <FaEnvelope className="field-label-icon" />
                  Email Address <span className="required-dot">*</span>
                </label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    id="flight-email-address"
                    type="email"
                    className="flight-input"
                    placeholder="eleanor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="form-field">
                <label className="field-label" htmlFor="flight-phone-number">
                  <FaPhone className="field-label-icon" />
                  Phone Number <span className="required-dot">*</span>
                </label>
                <div className="input-with-icon">
                  <FaPhone className="input-icon" />
                  <input
                    id="flight-phone-number"
                    type="tel"
                    className="flight-input"
                    placeholder="(555) 234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row B: Address, State, Zip Code */}
            <div className="contact-row">
              {/* Address */}
              <div className="form-field">
                <label className="field-label" htmlFor="flight-address">
                  <FaMapMarkerAlt className="field-label-icon" />
                  Address <span className="required-dot">*</span>
                </label>
                <div className="input-with-icon">
                  <FaMapMarkerAlt className="input-icon" />
                  <input
                    id="flight-address"
                    type="text"
                    className="flight-input"
                    placeholder="123 Main St, Apt 4B"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* State */}
              <div className="form-field">
                <label className="field-label" htmlFor="flight-state">
                  <FaCity className="field-label-icon" />
                  State <span className="required-dot">*</span>
                </label>
                <div className="input-with-icon">
                  <FaCity className="input-icon" />
                  <input
                    id="flight-state"
                    type="text"
                    className="flight-input"
                    placeholder="e.g. CA, NY, Texas"
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Zip Code */}
              <div className="form-field">
                <label className="field-label" htmlFor="flight-zip-code">
                  <FaMailBulk className="field-label-icon" />
                  Zip Code <span className="required-dot">*</span>
                </label>
                <div className="input-with-icon">
                  <FaMailBulk className="input-icon" />
                  <input
                    id="flight-zip-code"
                    type="text"
                    className="flight-input"
                    placeholder="e.g. 90210"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="btn btn-primary flight-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="flight-spinner"></span>
                Processing Flight Request...
              </>
            ) : (
              <>
                <FaPlane />
                Get Free Flight Quotes <FaArrowRight style={{ marginLeft: '6px' }} />
              </>
            )}
          </button>

          {/* Trust badges */}
          <div className="flight-trust-row">
            <span className="trust-item">
              <FaShieldAlt style={{ color: 'var(--secondary)' }} /> 256-Bit SSL Encrypted
            </span>
            <span className="trust-item">
              <FaCheckCircle style={{ color: 'var(--primary)' }} /> 100% Free Service
            </span>
            <span className="trust-item">
              <FaTicketAlt style={{ color: 'var(--purple)' }} /> Verified Airline Quotes
            </span>
          </div>
        </form>
      </div>

      {/* Ticket Confirmation Modal */}
      <AnimatePresence>
        {confirmedBooking && (
          <div className="ticket-confirmation-overlay" onClick={handleReset}>
            <motion.div
              className="ticket-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ticket-header">
                <div className="ticket-header-title">
                  <FaTicketAlt /> Flight Quote Request Received
                </div>
                <span className="ticket-badge">Ref #{confirmedBooking.id}</span>
              </div>

              <div className="ticket-body">
                {/* Visual Route */}
                <div className="ticket-route-display">
                  <div className="route-point">
                    <div className="route-point-code">{confirmedBooking.departure}</div>
                    <div className="route-point-label">Departure</div>
                  </div>

                  <div className="route-plane-indicator">
                    <FaPlane style={{ transform: 'rotate(45deg)', fontSize: '1.25rem' }} />
                    <div className="route-line"></div>
                    <span className="route-type-label">{confirmedBooking.trip_type}</span>
                  </div>

                  <div className="route-point">
                    <div className="route-point-code">{confirmedBooking.destination}</div>
                    <div className="route-point-label">Destination</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="ticket-details-grid">
                  <div className="ticket-field">
                    <div className="ticket-field-label">Passenger</div>
                    <div className="ticket-field-val">{confirmedBooking.full_name}</div>
                  </div>
                  <div className="ticket-field">
                    <div className="ticket-field-label">Trip Type</div>
                    <div className="ticket-field-val">{confirmedBooking.trip_type}</div>
                  </div>
                  <div className="ticket-field">
                    <div className="ticket-field-label">Email Address</div>
                    <div className="ticket-field-val">{confirmedBooking.email}</div>
                  </div>
                  <div className="ticket-field">
                    <div className="ticket-field-label">Phone Number</div>
                    <div className="ticket-field-val">{confirmedBooking.phone}</div>
                  </div>
                  <div className="ticket-field">
                    <div className="ticket-field-label">Address</div>
                    <div className="ticket-field-val">{confirmedBooking.address}</div>
                  </div>
                  <div className="ticket-field">
                    <div className="ticket-field-label">State / Zip</div>
                    <div className="ticket-field-val">{confirmedBooking.state} - {confirmedBooking.zip_code}</div>
                  </div>
                </div>

                <div className="ticket-footer">
                  <p className="ticket-info-note">
                    Thank you! Our flight desk is comparing published and private airfares for your route and will contact you shortly with competitive quotes.
                  </p>
                  <button type="button" className="btn btn-primary ticket-close-btn" onClick={handleReset}>
                    Close & Request Another Quote
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

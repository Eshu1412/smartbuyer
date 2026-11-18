import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaHome, FaChevronRight, FaPlane } from 'react-icons/fa'
import FlightCard from './FlightCard'
import { updatePageSEO } from '../../utils/seo'
import './TravelServicesView.css'

export default function TravelServicesView({ onNavigateHome, onFormSubmitted }) {
  useEffect(() => {
    updatePageSEO({
      title: 'Compare Cheap Flights & Airline Ticket Quotes 2026 | SmartQuoteHub',
      description: 'Compare low airfares across major carriers. Request customized quotes for one-way, round-trip, and bundled vacation packages with zero hidden fees.',
      keywords: ['cheap flights quotes', 'airline ticket comparison', 'flight booking deals', 'discount airfares 2026'],
      path: '/services/travel'
    })
  }, [])

  return (
    <article className="travel-services-view">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="travel-breadcrumb" aria-label="Breadcrumb">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              onNavigateHome()
            }}
            className="travel-breadcrumb-link"
          >
            <FaHome style={{ marginRight: '6px' }} /> Home
          </a>
          <FaChevronRight style={{ fontSize: '0.75rem' }} />
          <span className="travel-breadcrumb-current" aria-current="page">Flight Booking</span>
        </nav>

        {/* Header Title Section - "Flight Booking" */}
        <header className="travel-header">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="travel-header-badge" aria-hidden="true">
              <FaPlane /> Flight Quotes
            </div>
            <h1 className="travel-header-title">Flight Booking &amp; Airfare Quotes</h1>
            <p className="travel-header-subtitle">
              Compare competitive airfares across major carriers. Request a customized quote for one-way or round-trip journeys with zero hidden fees.
            </p>
          </motion.div>
        </header>

        {/* Central Flight Card Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <FlightCard onFormSubmitted={onFormSubmitted} />
        </motion.div>
      </div>
    </article>
  )
}

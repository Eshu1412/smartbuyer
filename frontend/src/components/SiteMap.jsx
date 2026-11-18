import React from 'react'
import { FaHome, FaChevronRight, FaSitemap, FaArrowRight } from 'react-icons/fa'
import { servicesDb } from '../data/servicesData'
import './SiteMap.css'

export default function SiteMap({ onNavigateHome, onNavigateVertical, onNavigateSubVertical }) {
  return (
    <div className="sitemap-page section">
      <div className="container max-w-5xl">
        <nav className="breadcrumb">
          <button onClick={onNavigateHome} className="breadcrumb-link">
            <FaHome style={{ marginRight: '6px' }} /> Home
          </button>
          <FaChevronRight className="breadcrumb-separator" />
          <span className="breadcrumb-current">Website Directory & Sitemap</span>
        </nav>

        <header className="sitemap-header">
          <div className="sitemap-badge">
            <FaSitemap style={{ marginRight: '6px' }} /> HTML Directory
          </div>
          <h1 className="sitemap-title">SmartQuoteHub Directory &amp; Sitemap</h1>
          <p className="sitemap-subtitle">
            Browse our complete directory of free quote comparison services, insurance options, home contractor trades, debt relief, and flight booking.
          </p>
        </header>

        <div className="sitemap-grid">
          {Object.entries(servicesDb).map(([verticalKey, vertical]) => (
            <div key={verticalKey} className="sitemap-card">
              <div className="sitemap-card-head">
                <a
                  href={`/services/${verticalKey}`}
                  className="sitemap-category-link"
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigateVertical(verticalKey)
                  }}
                >
                  <h2>{vertical.title} Hub</h2>
                  <FaArrowRight className="sitemap-icon" />
                </a>
                <p className="sitemap-category-desc">{vertical.description}</p>
              </div>

              <ul className="sitemap-sub-list">
                {Object.entries(vertical.subs || {}).map(([subKey, sub]) => (
                  <li key={subKey}>
                    <a
                      href={`/services/${verticalKey}/${subKey}`}
                      className="sitemap-sub-link"
                      onClick={(e) => {
                        e.preventDefault()
                        onNavigateSubVertical(verticalKey, subKey)
                      }}
                    >
                      <span className="sitemap-sub-title">{sub.title}</span>
                      <span className="sitemap-sub-arrow">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="sitemap-core-links">
          <h3>General &amp; Legal Pages</h3>
          <div className="sitemap-links-row">
            <a href="/" onClick={(e) => { e.preventDefault(); onNavigateHome() }}>Home</a>
            <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/privacy-policy'); window.dispatchEvent(new PopStateEvent('popstate')) }}>Privacy Policy</a>
            <a href="/terms-of-service" onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/terms-of-service'); window.dispatchEvent(new PopStateEvent('popstate')) }}>Terms of Service</a>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">XML Sitemap (for search bots)</a>
          </div>
        </div>
      </div>
    </div>
  )
}

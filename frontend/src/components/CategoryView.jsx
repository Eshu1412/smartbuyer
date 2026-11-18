import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FaHome, FaChevronRight, FaArrowRight, FaHeartbeat, FaShieldAlt, FaHammer,
  FaHandHoldingUsd, FaGavel, FaStethoscope, FaHeart, FaFileAlt, FaCar,
  FaHome as FaHomeIcon, FaLayerGroup, FaTint, FaThermometerHalf, FaWindowMaximize,
  FaBath, FaBug, FaWater, FaWrench, FaTools, FaBroom, FaTree, FaChartLine,
  FaMoneyBillWave, FaCarCrash, FaUserNurse, FaPlane, FaPlaneDeparture, FaSuitcase,
  FaLightbulb, FaCheck, FaPlus, FaMinus
} from 'react-icons/fa'
import { servicesDb } from '../data/servicesData'
import { updatePageSEO, buildCategorySchema } from '../utils/seo'
import './CategoryView.css'

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
  FaPlane,
  FaPlaneDeparture,
  FaSuitcase,
  FaActivity: FaHeartbeat
}

export default function CategoryView({ verticalId, onNavigateHome, onSelectSubVertical }) {
  const vertical = servicesDb[verticalId]
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  useEffect(() => {
    if (vertical) {
      const schema = buildCategorySchema({ vertical, verticalId })
      updatePageSEO({
        title: vertical.seoTitle || `${vertical.title} Services & Quotes 2026`,
        description: vertical.seoDesc || vertical.description,
        keywords: vertical.keywords,
        path: `/services/${verticalId}`,
        schema
      })
    }
  }, [verticalId, vertical])

  if (!vertical) {
    return (
      <div className="category-error section">
        <div className="container text-center">
          <h2>Category Not Found</h2>
          <button onClick={onNavigateHome} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Return Home
          </button>
        </div>
      </div>
    )
  }

  const HeaderIcon = iconMap[vertical.icon] || FaShieldAlt

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)
  }

  return (
    <article className="category-view section">
      <div className="container">
        {/* Breadcrumb Navigation */}
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
          <span className="breadcrumb-current" aria-current="page">{vertical.title}</span>
        </nav>

        {/* Category Header */}
        <header className="category-header">
          <div className="category-title-wrap">
            <div className="category-icon-box" aria-hidden="true">
              <HeaderIcon />
            </div>
            <h1 className="category-title">{vertical.title} Services &amp; Quotes</h1>
          </div>
          <p className="category-subtitle">
            {vertical.seoDesc || vertical.description} Select a specific service category below to view detailed plan comparisons and check local pricing.
          </p>
        </header>

        {/* Sub-vertical Cards Grid with Crawlable <a> Links */}
        <section className="category-grid">
          {Object.entries(vertical.subs || {}).map(([subKey, sub]) => {
            const SubIcon = iconMap[sub.icon] || FaShieldAlt
            return (
              <motion.div
                key={subKey}
                className="sub-card"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectSubVertical(verticalId, subKey)}
              >
                <div className="sub-card-accent"></div>
                <div className="sub-card-body">
                  <div className="sub-card-header">
                    <div className="sub-card-icon" aria-hidden="true">
                      <SubIcon />
                    </div>
                    <h2 className="sub-card-title">{sub.title}</h2>
                  </div>
                  <p className="sub-card-desc">{sub.desc}</p>
                  <a
                    href={`/services/${verticalId}/${subKey}`}
                    className="btn btn-secondary sub-card-btn"
                    onClick={(e) => {
                      e.preventDefault()
                      onSelectSubVertical(verticalId, subKey)
                    }}
                  >
                    View Plans &amp; Rates <FaArrowRight style={{ marginLeft: '8px' }} />
                  </a>
                </div>
              </motion.div>
            )
          })}
        </section>

        {/* SEO Rich Category Buying Guide */}
        {vertical.guide && (
          <section className="seo-guide-section" style={{ marginTop: 'var(--space-12)' }}>
            <h2 className="guide-headline">{vertical.guide.headline}</h2>
            <div className="guide-paragraphs">
              {vertical.guide.paragraphs.map((p, idx) => (
                <p key={idx} className="guide-text">{p}</p>
              ))}
            </div>

            {vertical.guide.tips && vertical.guide.tips.length > 0 && (
              <div className="guide-tips-box">
                <h3 className="guide-tips-title">
                  <FaLightbulb style={{ color: '#F59E0B', marginRight: '8px' }} />
                  Expert Tips for {vertical.title}
                </h3>
                <ul className="guide-tips-list">
                  {vertical.guide.tips.map((tip, idx) => (
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

        {/* Category FAQs */}
        {vertical.faqs && vertical.faqs.length > 0 && (
          <section className="seo-faqs-section">
            <h2 className="section-subheading">Frequently Asked Questions</h2>
            <div className="faq-accordion">
              {vertical.faqs.map((faq, idx) => {
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
      </div>
    </article>
  )
}

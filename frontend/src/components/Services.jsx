import { motion } from 'framer-motion'
import { FaHeartbeat, FaHome, FaCar, FaHandHoldingUsd, FaGavel, FaShieldAlt } from 'react-icons/fa'
import ScrollReveal from './ScrollReveal'
import './Services.css'

const iconMap = {
  health: FaHeartbeat,
  home: FaHome,
  auto: FaCar,
  debt: FaHandHoldingUsd,
  legal: FaGavel,
  medicare: FaShieldAlt,
}

const services = [
  {
    id: 1,
    title: 'Health Insurance',
    verticalId: 'health',
    subId: 'health-aca',
    description: 'Find affordable health coverage plans tailored to your needs and budget. Compare options from leading providers.',
    icon: 'health',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    id: 2,
    title: 'Home Improvement',
    verticalId: 'home-services',
    subId: 'remodeling',
    description: 'Connect with pre-screened, top-rated contractors in your area for renovations, repairs, and remodeling.',
    icon: 'home',
    color: '#D97706',
    bg: '#FFFBEB',
  },
  {
    id: 3,
    title: 'Auto & Home Insurance',
    verticalId: 'insurance',
    subId: 'auto',
    description: 'Bundle your auto and home policies to unlock significant savings with trusted insurance carriers.',
    icon: 'auto',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    id: 4,
    title: 'Debt Relief',
    verticalId: 'finance',
    subId: 'debt-relief',
    description: 'Explore proven solutions to manage and reduce your debt. Get matched with certified financial advisors.',
    icon: 'debt',
    color: '#EF4444',
    bg: '#FEF2F2',
  },
  {
    id: 5,
    title: 'Legal Help',
    verticalId: 'legal',
    subId: 'auto-accident',
    description: 'Connect with qualified, experienced local attorneys who specialize in your specific legal needs.',
    icon: 'legal',
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    id: 6,
    title: 'Medicare',
    verticalId: 'health',
    subId: 'medicare',
    description: 'Navigate Medicare plans with confidence. Compare Medicare Advantage, Supplement, and Part D options.',
    icon: 'medicare',
    color: '#06B6D4',
    bg: '#ECFEFF',
  },
]

export default function Services({ onSelectSubVertical }) {
  const handleCardClick = (service) => {
    if (onSelectSubVertical) {
      onSelectSubVertical(service.verticalId, service.subId)
    }
  }

  return (
    <section className="services section" id="services">
      <div className="services-deco"></div>
      <div className="container">
        <div className="services-header">
          <ScrollReveal duration={0.4}>
            <span className="section-label">What We Cover</span>
          </ScrollReveal>
          <ScrollReveal delay={0.08} duration={0.4}>
            <h2 className="section-title" style={{ textAlign: 'center', margin: '0 auto var(--space-4)' }}>
              Top Services We Offer
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.16} duration={0.4}>
            <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto var(--space-12)' }}>
              From insurance to home services, we connect you with the right professionals for every need.
            </p>
          </ScrollReveal>
        </div>

        <div className="services-grid">
          {services.map((service, i) => {
            const IconComp = iconMap[service.icon]
            return (
              <ScrollReveal key={service.id} delay={i * 0.06} duration={0.4}>
                <motion.div
                  className="service-card group"
                  style={{
                    '--card-bg': service.bg,
                    '--icon-color': service.color,
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'tween', duration: 0.2 }}
                  onClick={() => handleCardClick(service)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleCardClick(service)
                    }
                  }}
                >
                  <div className="service-icon-wrap">
                    <IconComp />
                  </div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-desc">{service.description}</p>
                  <div className="service-actions">
                    <span className="service-link">
                      View Plans & Quotes <span>→</span>
                    </span>
                  </div>
                </motion.div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}



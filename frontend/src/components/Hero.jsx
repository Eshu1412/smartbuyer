import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'
import './Hero.css'

export default function Hero({ onQuoteClick }) {
  const stats = [
    { number: '10,000+', label: 'Happy Users' },
    { number: '500+', label: 'Trusted Providers' },
    { number: '4.9★', label: 'Average Rating' },
    { number: '$2.4M', label: 'Saved by Users' },
  ]

  return (
    <section className="hero" id="hero">
      {/* Geometric Background Shapes */}
      <div className="hero-geo">
        <div className="hero-geo-shape"></div>
        <div className="hero-geo-shape"></div>
        <div className="hero-geo-shape"></div>
        <div className="hero-geo-shape"></div>
      </div>

      <div className="container hero-content">
        <div className="hero-text">
          <ScrollReveal delay={0.1} duration={0.4}>
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              Trusted by thousands nationwide
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} duration={0.4}>
            <h1 className="hero-title">
              Compare Plans.{' '}
              <span className="hero-title-accent">Save Smart.</span>{' '}
              Get Quotes That Work For You.
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.3} duration={0.4}>
            <p className="hero-subtitle">
              Connecting you with top-rated, pre-screened professionals nationwide.
              Get free, personalized quotes for insurance, home services, and more — all in one place.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.4} duration={0.4}>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={onQuoteClick}>
                Get Your Free Quote
              </button>
              <a className="btn btn-outline" href="#services" onClick={(e) => {
                e.preventDefault()
                document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' })
              }}>
                Explore Services
              </a>
            </div>
          </ScrollReveal>
        </div>

        <div className="hero-visual">
          <div className="hero-stats-grid">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={0.3 + i * 0.08} duration={0.4}>
                <motion.div
                  className="hero-stat-card"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'tween', duration: 0.2 }}
                >
                  <div className="hero-stat-number">{stat.number}</div>
                  <div className="hero-stat-label">{stat.label}</div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <span className="hero-scroll-text">Scroll</span>
        <div className="hero-scroll-line"></div>
      </div>
    </section>
  )
}

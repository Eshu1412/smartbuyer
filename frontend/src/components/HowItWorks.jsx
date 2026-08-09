import React from 'react'
import { motion } from 'framer-motion'
import { FaClipboardList, FaBalanceScale, FaCheckCircle, FaArrowRight } from 'react-icons/fa'
import ScrollReveal from './ScrollReveal'
import './HowItWorks.css'

const steps = [
  {
    step: 1,
    title: 'Tell Us What You Need',
    description: 'Answer a few quick questions about the service you\'re looking for. It takes less than 2 minutes.',
    icon: FaClipboardList,
  },
  {
    step: 2,
    title: 'Compare Top Quotes',
    description: 'We match you with pre-screened professionals and deliver competitive quotes directly to you.',
    icon: FaBalanceScale,
  },
  {
    step: 3,
    title: 'Choose & Save',
    description: 'Review your options, pick the best fit, and start saving today. No obligations, no hidden fees.',
    icon: FaCheckCircle,
  },
]

export default function HowItWorks() {
  return (
    <section className="how-it-works section" id="how-it-works">
      <div className="how-it-works-geo">
        <div className="how-it-works-geo-shape"></div>
        <div className="how-it-works-geo-shape"></div>
      </div>

      <div className="container">
        <div className="how-it-works-header">
          <ScrollReveal duration={0.4}>
            <span className="section-label">Simple Process</span>
          </ScrollReveal>
          <ScrollReveal delay={0.08} duration={0.4}>
            <h2 className="section-title">
              How It Works
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.16} duration={0.4}>
            <p className="section-subtitle">
              Getting started is easy. Three simple steps to find the best quotes and save.
            </p>
          </ScrollReveal>
        </div>

        <div className="steps-container">
          {steps.map((step, i) => {
            const IconComp = step.icon
            return (
              <React.Fragment key={step.step}>
                <ScrollReveal delay={0.1 * i} duration={0.4}>
                  <motion.div
                    className="step-card"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'tween', duration: 0.2 }}
                  >
                    <div className="step-number">{step.step}</div>
                    <div className="step-icon">
                      <IconComp />
                    </div>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-desc">{step.description}</p>
                  </motion.div>
                </ScrollReveal>
                {i < steps.length - 1 && (
                  <div className="step-arrow">
                    <FaArrowRight />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}

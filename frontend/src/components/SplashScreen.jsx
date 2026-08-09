import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './SplashScreen.css'

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Simulate loading progress
    const steps = [
      { target: 30, delay: 200 },
      { target: 55, delay: 500 },
      { target: 75, delay: 800 },
      { target: 90, delay: 1200 },
      { target: 100, delay: 1600 },
    ]

    const timers = steps.map(({ target, delay }) =>
      setTimeout(() => setProgress(target), delay)
    )

    // Start exit after loading completes
    const exitTimer = setTimeout(() => setExiting(true), 2000)
    // Fully remove after exit animation
    const completeTimer = setTimeout(() => onComplete(), 2500)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(exitTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Geometric Background */}
          <div className="splash-geo">
            <div className="splash-geo-shape"></div>
            <div className="splash-geo-shape"></div>
            <div className="splash-geo-shape"></div>
            <div className="splash-geo-shape"></div>
          </div>

          <div className="splash-content">
            {/* Logo */}
            <motion.div
              className="splash-logo"
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
            >
              SB
            </motion.div>

            {/* Brand Name */}
            <motion.div
              className="splash-brand"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <div className="splash-name">
                Smart<span>Buyer</span>Quotes
              </div>
              <div className="splash-tagline">Compare Plans & Get Quotes</div>
            </motion.div>

            {/* Loading Bar */}
            <motion.div
              className="splash-loader"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 200 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <div
                className="splash-loader-bar"
                style={{ width: `${progress}%` }}
              />
            </motion.div>

            {/* Pulsing Dots */}
            <motion.div
              className="splash-dots"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.75 }}
            >
              <div className="splash-dot"></div>
              <div className="splash-dot"></div>
              <div className="splash-dot"></div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

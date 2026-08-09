import { motion } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import './ThankYouView.css'

export default function ThankYouView({ leadData, onNavigateHome }) {
  const userName = leadData?.name || 'Valued Customer'
  const serviceName = leadData?.service || 'Service'

  return (
    <div className="thankyou-view section">
      <div className="container max-w-xl text-center">
        <motion.div
          className="thankyou-card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="thankyou-icon">
            <FaCheckCircle />
          </div>
          <h1 className="thankyou-title">Request Received!</h1>
          <p className="thankyou-message">
            Thank you, <strong>{userName}</strong>, for submitting your details regarding <strong>{serviceName}</strong>. A local specialist will review your information and contact you shortly to discuss plans and pricing.
          </p>
          <button onClick={onNavigateHome} className="btn btn-secondary thankyou-btn">
            Return to Home Page
          </button>
        </motion.div>
      </div>
    </div>
  )
}

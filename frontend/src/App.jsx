import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SplashScreen from './components/SplashScreen'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import HowItWorks from './components/HowItWorks'
import Testimonials from './components/Testimonials'
import FAQ from './components/FAQ'
import QuoteForm from './components/QuoteForm'
import Footer from './components/Footer'
import CategoryView from './components/CategoryView'
import SubVerticalView from './components/SubVerticalView'
import ThankYouView from './components/ThankYouView'
import AdminDashboard from './components/Admin/AdminDashboard'
import TravelServicesView from './components/Travel/TravelServicesView'
import ContactRedirectModal from './components/ContactRedirectModal'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [selectedService, setSelectedService] = useState('')

  // View state: 'home' | 'vertical' | 'sub-vertical' | 'thank-you' | 'admin'
  const [viewState, setViewState] = useState('home')
  const [activeVertical, setActiveVertical] = useState('')
  const [activeSub, setActiveSub] = useState('')
  const [submittedLead, setSubmittedLead] = useState(null)

  // On-screen Contact & Redirect Window state
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactConfig, setContactConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('contact_config')
      return cached ? JSON.parse(cached) : {
        enabled: true,
        phone_number: '+18558312264',
        modal_title: 'Speak With an Advisor Right Now',
        modal_message: 'Your request has been received! Our support specialists are available immediately to provide personal assistance and lowest quote rates.',
        auto_redirect: true,
        auto_redirect_seconds: 5
      }
    } catch {
      return {
        enabled: true,
        phone_number: '+18558312264',
        modal_title: 'Speak With an Advisor Right Now',
        modal_message: 'Your request has been received! Our support specialists are available immediately to provide personal assistance and lowest quote rates.',
        auto_redirect: true,
        auto_redirect_seconds: 5
      }
    }
  })

  // Listen to #admin hash or location changes
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        setViewState('admin')
      }
    }
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  // Fetch admin contact configuration on mount
  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        const res = await fetch('/api/settings/contact')
        if (res.ok) {
          const data = await res.json()
          setContactConfig(data)
          localStorage.setItem('contact_config', JSON.stringify(data))
        }
      } catch (err) {
        console.warn('Using cached contact settings', err)
      }
    }
    fetchContactSettings()
  }, [])

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true)
  }, [])

  const handleNavigateHome = () => {
    if (window.location.hash === '#admin') {
      window.location.hash = ''
    }
    setViewState('home')
    setActiveVertical('')
    setActiveSub('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateAdmin = () => {
    window.location.hash = 'admin'
    setViewState('admin')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateVertical = (verticalId) => {
    setActiveVertical(verticalId)
    setViewState('vertical')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateSubVertical = (verticalId, subId) => {
    setActiveVertical(verticalId)
    setActiveSub(subId)
    setViewState('sub-vertical')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFormSubmitted = (leadInfo) => {
    setSubmittedLead(leadInfo)
    setViewState('thank-you')
    if (quoteOpen) setQuoteOpen(false)
    if (contactConfig?.enabled !== false) {
      setShowContactModal(true)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenQuote = (service = '') => {
    setSelectedService(service)
    setQuoteOpen(true)
  }

  const activeKey = `${viewState}-${activeVertical}-${activeSub}`

  if (viewState === 'admin') {
    return <AdminDashboard onNavigateHome={handleNavigateHome} />
  }

  return (
    <>
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Top Sweep Progress Indicator on Page Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bar-${activeKey}`}
          className="page-transition-bar"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>

      <Navbar
        onQuoteClick={() => handleOpenQuote('')}
        onNavigateHome={handleNavigateHome}
        onNavigateVertical={handleNavigateVertical}
        viewState={viewState}
        activeVertical={activeVertical}
      />

      <main style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {viewState === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.995 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <Hero onQuoteClick={() => handleOpenQuote('')} />
              <Services onSelectSubVertical={handleNavigateSubVertical} />
              <HowItWorks />
              <Testimonials />
              <FAQ onQuoteClick={() => handleOpenQuote('')} />
            </motion.div>
          )}

          {viewState === 'vertical' && (
            <motion.div
              key={`vertical-${activeVertical}`}
              initial={{ opacity: 0, y: 20, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.995 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeVertical === 'travel' ? (
                <TravelServicesView
                  onNavigateHome={handleNavigateHome}
                  onFormSubmitted={handleFormSubmitted}
                />
              ) : (
                <CategoryView
                  verticalId={activeVertical}
                  onNavigateHome={handleNavigateHome}
                  onSelectSubVertical={handleNavigateSubVertical}
                />
              )}
            </motion.div>
          )}

          {viewState === 'sub-vertical' && (
            <motion.div
              key={`sub-vertical-${activeVertical}-${activeSub}`}
              initial={{ opacity: 0, y: 20, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.995 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <SubVerticalView
                verticalId={activeVertical}
                subId={activeSub}
                onNavigateHome={handleNavigateHome}
                onNavigateVertical={handleNavigateVertical}
                onFormSubmitted={handleFormSubmitted}
              />
            </motion.div>
          )}

          {viewState === 'thank-you' && (
            <motion.div
              key="thank-you"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <ThankYouView
                leadData={submittedLead}
                onNavigateHome={handleNavigateHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer
        onQuoteClick={() => handleOpenQuote('')}
      />
      <QuoteForm
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        defaultService={selectedService}
        onNavigateVertical={handleNavigateVertical}
        onFormSubmitted={handleFormSubmitted}
      />

      {/* On-screen Contact Us & Redirection Message Window */}
      <ContactRedirectModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        config={contactConfig}
        leadData={submittedLead}
      />
    </>
  )
}



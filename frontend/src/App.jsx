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
import PrivacyPolicy from './components/Legal/PrivacyPolicy'
import TermsOfService from './components/Legal/TermsOfService'
import SiteMap from './components/SiteMap'
import { DEFAULT_CONTACT_CONFIG, getServicePhone } from './utils/serviceContact'
import { updatePageSEO } from './utils/seo'
import { servicesDb } from './data/servicesData'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [selectedService, setSelectedService] = useState('')

  // View state: 'home' | 'vertical' | 'sub-vertical' | 'thank-you' | 'admin' | 'privacy' | 'terms' | 'sitemap'
  const [viewState, setViewState] = useState('home')
  const [activeVertical, setActiveVertical] = useState('')
  const [activeSub, setActiveSub] = useState('')
  const [submittedLead, setSubmittedLead] = useState(null)

  // On-screen Contact & Redirect Window state
  const [showContactModal, setShowContactModal] = useState(false)
  const [activeServicePhone, setActiveServicePhone] = useState('')
  const [contactConfig, setContactConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('contact_config')
      return cached ? JSON.parse(cached) : DEFAULT_CONTACT_CONFIG
    } catch {
      return DEFAULT_CONTACT_CONFIG
    }
  })

  // URL Parser for Deep-Linking and History
  const parseCurrentLocation = useCallback(() => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/'
    const hash = window.location.hash

    if (hash === '#admin' || path === '/admin') {
      setViewState('admin')
      return
    }

    if (path === '/privacy-policy') {
      setViewState('privacy')
      updatePageSEO({
        title: 'Privacy Policy | SmartQuoteHub',
        description: 'Read the SmartQuoteHub Privacy Policy. Learn how we safeguard your personal information, handle quote requests, and ensure TCPA compliance.',
        path: '/privacy-policy'
      })
      return
    }

    if (path === '/terms-of-service') {
      setViewState('terms')
      updatePageSEO({
        title: 'Terms of Service | SmartQuoteHub',
        description: 'Read the SmartQuoteHub Terms of Service. Understand our rate comparison platform terms, TCPA consent, and usage policies.',
        path: '/terms-of-service'
      })
      return
    }

    if (path === '/sitemap') {
      setViewState('sitemap')
      updatePageSEO({
        title: 'Website Directory & HTML Sitemap | SmartQuoteHub',
        description: 'Complete directory of all free quote comparison services, insurance options, home improvement trades, and flight booking.',
        path: '/sitemap'
      })
      return
    }

    if (path === '/thank-you') {
      setViewState('thank-you')
      return
    }

    // Match /services/:vertical/:sub or /services/:vertical
    const parts = path.split('/').filter(Boolean)
    if (parts[0] === 'services' && parts[1]) {
      const verticalKey = parts[1]
      if (servicesDb[verticalKey]) {
        setActiveVertical(verticalKey)
        if (parts[2] && servicesDb[verticalKey].subs?.[parts[2]]) {
          setActiveSub(parts[2])
          setViewState('sub-vertical')
          return
        }
        setActiveSub('')
        setViewState('vertical')
        return
      }
    }

    // Default to Home
    setViewState('home')
    setActiveVertical('')
    setActiveSub('')
    updatePageSEO({
      title: 'SmartQuoteHub — Compare Plans & Get Free Quotes Nationwide',
      description: 'Compare free quotes from top-rated providers nationwide. Find affordable ACA health insurance, Medicare, auto & home insurance, home improvement, debt relief, and flight booking in 60 seconds.',
      keywords: ['compare quotes', 'health insurance quotes', 'medicare advantage plans', 'auto insurance comparison', 'home insurance quotes', 'roofing contractors', 'debt relief programs', 'flight booking'],
      path: '/'
    })
  }, [])

  // Listen to popstate and initial load
  useEffect(() => {
    parseCurrentLocation()
    window.addEventListener('popstate', parseCurrentLocation)
    window.addEventListener('hashchange', parseCurrentLocation)
    return () => {
      window.removeEventListener('popstate', parseCurrentLocation)
      window.removeEventListener('hashchange', parseCurrentLocation)
    }
  }, [parseCurrentLocation])

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

  // Listen to contact config updates across tabs or admin panel saves
  useEffect(() => {
    const handleConfigSync = (e) => {
      if (e?.detail) setContactConfig(e.detail)
    }
    window.addEventListener('contact_config_updated', handleConfigSync)
    return () => window.removeEventListener('contact_config_updated', handleConfigSync)
  }, [])

  // Track Meta Pixel PageView on SPA view navigation
  useEffect(() => {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }
  }, [viewState, activeVertical, activeSub])

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true)
  }, [])

  // Navigation handlers with HTML5 History API pushState
  const handleNavigateHome = () => {
    if (window.location.hash === '#admin') {
      window.location.hash = ''
    }
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/')
    }
    setViewState('home')
    setActiveVertical('')
    setActiveSub('')
    updatePageSEO({
      title: 'SmartQuoteHub — Compare Plans & Get Free Quotes Nationwide',
      description: 'Compare free quotes from top-rated providers nationwide. Find affordable ACA health insurance, Medicare, auto & home insurance, home improvement, debt relief, and flight booking in 60 seconds.',
      path: '/'
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateVertical = (verticalId) => {
    const newPath = `/services/${verticalId}`
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath)
    }
    setActiveVertical(verticalId)
    setActiveSub('')
    setViewState('vertical')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateSubVertical = (verticalId, subId) => {
    const newPath = `/services/${verticalId}/${subId}`
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath)
    }
    setActiveVertical(verticalId)
    setActiveSub(subId)
    setViewState('sub-vertical')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateLegal = (type) => {
    const newPath = type === 'privacy' ? '/privacy-policy' : '/terms-of-service'
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath)
    }
    setViewState(type === 'privacy' ? 'privacy' : 'terms')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigateSiteMap = () => {
    const newPath = '/sitemap'
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath)
    }
    setViewState('sitemap')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFormSubmitted = (leadInfo) => {
    setSubmittedLead(leadInfo)
    setViewState('thank-you')
    if (quoteOpen) setQuoteOpen(false)
    if (window.location.pathname !== '/thank-you') {
      window.history.pushState(null, '', '/thank-you')
    }

    let liveConfig = contactConfig
    try {
      const cached = localStorage.getItem('contact_config')
      if (cached) {
        liveConfig = JSON.parse(cached)
        setContactConfig(liveConfig)
      }
    } catch {}

    const sPhone = getServicePhone(leadInfo?.service, leadInfo?.category, liveConfig)

    if (liveConfig?.enabled !== false && sPhone && sPhone.trim().length > 0) {
      setActiveServicePhone(sPhone.trim())
      setShowContactModal(true)
    } else {
      setActiveServicePhone('')
      setShowContactModal(false)
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
                onNavigateSubVertical={handleNavigateSubVertical}
                onFormSubmitted={handleFormSubmitted}
              />
            </motion.div>
          )}

          {viewState === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <PrivacyPolicy onNavigateHome={handleNavigateHome} />
            </motion.div>
          )}

          {viewState === 'terms' && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <TermsOfService onNavigateHome={handleNavigateHome} />
            </motion.div>
          )}

          {viewState === 'sitemap' && (
            <motion.div
              key="sitemap"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <SiteMap
                onNavigateHome={handleNavigateHome}
                onNavigateVertical={handleNavigateVertical}
                onNavigateSubVertical={handleNavigateSubVertical}
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
        onNavigateVertical={handleNavigateVertical}
        onNavigateSubVertical={handleNavigateSubVertical}
        onNavigateLegal={handleNavigateLegal}
        onNavigateSiteMap={handleNavigateSiteMap}
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
        overridePhone={activeServicePhone}
      />
    </>
  )
}

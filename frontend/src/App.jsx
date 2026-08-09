import { useState, useCallback } from 'react'
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

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [selectedService, setSelectedService] = useState('')

  // View state: 'home' | 'vertical' | 'sub-vertical' | 'thank-you'
  const [viewState, setViewState] = useState('home')
  const [activeVertical, setActiveVertical] = useState('')
  const [activeSub, setActiveSub] = useState('')
  const [submittedLead, setSubmittedLead] = useState(null)

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true)
  }, [])

  const handleNavigateHome = () => {
    setViewState('home')
    setActiveVertical('')
    setActiveSub('')
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenQuote = (service = '') => {
    setSelectedService(service)
    setQuoteOpen(true)
  }

  return (
    <>
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      <Navbar
        onQuoteClick={() => handleOpenQuote('')}
        onNavigateHome={handleNavigateHome}
        onNavigateVertical={handleNavigateVertical}
        viewState={viewState}
        activeVertical={activeVertical}
      />
      <main>
        {viewState === 'home' && (
          <>
            <Hero onQuoteClick={() => handleOpenQuote('')} />
            <Services onSelectSubVertical={handleNavigateSubVertical} />
            <HowItWorks />
            <Testimonials />
            <FAQ onQuoteClick={() => handleOpenQuote('')} />
          </>
        )}

        {viewState === 'vertical' && (
          <CategoryView
            verticalId={activeVertical}
            onNavigateHome={handleNavigateHome}
            onSelectSubVertical={handleNavigateSubVertical}
          />
        )}

        {viewState === 'sub-vertical' && (
          <SubVerticalView
            verticalId={activeVertical}
            subId={activeSub}
            onNavigateHome={handleNavigateHome}
            onNavigateVertical={handleNavigateVertical}
            onFormSubmitted={handleFormSubmitted}
          />
        )}

        {viewState === 'thank-you' && (
          <ThankYouView
            leadData={submittedLead}
            onNavigateHome={handleNavigateHome}
          />
        )}
      </main>
      <Footer onQuoteClick={() => handleOpenQuote('')} />
      <QuoteForm
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        defaultService={selectedService}
      />
    </>
  )
}



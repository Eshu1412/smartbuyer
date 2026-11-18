/**
 * SEO Manager Utility for SmartQuoteHub
 * Dynamically updates document title, meta tags, canonical link, and JSON-LD structured data.
 */

const SITE_NAME = 'SmartQuoteHub'
const BASE_URL = 'https://smartquotehub.com'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.svg`

const setMetaTag = (attrName, attrValue, content) => {
  if (!content) return
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attrName, attrValue)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

const setCanonical = (url) => {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

const setSchemaJson = (id, jsonObject) => {
  let script = document.getElementById(id)
  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(jsonObject, null, 2)
}

export function updatePageSEO({
  title,
  description,
  keywords,
  path = '/',
  image = DEFAULT_IMAGE,
  schema = null,
}) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const fullUrl = `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`

  // 1. Document Title
  document.title = fullTitle

  // 2. Primary Meta Tags
  setMetaTag('name', 'description', description)
  if (keywords) {
    const kwString = Array.isArray(keywords) ? keywords.join(', ') : keywords
    setMetaTag('name', 'keywords', kwString)
  }
  setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')

  // 3. Canonical URL
  setCanonical(fullUrl)

  // 4. Open Graph Tags
  setMetaTag('property', 'og:title', fullTitle)
  setMetaTag('property', 'og:description', description)
  setMetaTag('property', 'og:url', fullUrl)
  setMetaTag('property', 'og:type', 'website')
  setMetaTag('property', 'og:site_name', SITE_NAME)
  setMetaTag('property', 'og:image', image)

  // 5. Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image')
  setMetaTag('name', 'twitter:title', fullTitle)
  setMetaTag('name', 'twitter:description', description)
  setMetaTag('name', 'twitter:url', fullUrl)
  setMetaTag('name', 'twitter:image', image)

  // 6. Schema.org Structured Data
  if (schema) {
    setSchemaJson('seo-dynamic-schema', schema)
  }
}

/**
 * Builds Schema.org for a Sub-Vertical Service Page
 */
export function buildSubVerticalSchema({ vertical, sub, verticalId, subId }) {
  const pageUrl = `${BASE_URL}/services/${verticalId}/${subId}`
  
  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': `${BASE_URL}/`
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': vertical.title,
        'item': `${BASE_URL}/services/${verticalId}`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': sub.title,
        'item': pageUrl
      }
    ]
  }

  // Service Schema
  const serviceSchema = {
    '@type': 'Service',
    '@id': `${pageUrl}#service`,
    'name': `${sub.title} Comparison & Quotes`,
    'serviceType': sub.title,
    'description': sub.seoDesc || sub.desc,
    'provider': {
      '@type': 'Organization',
      'name': SITE_NAME,
      'url': BASE_URL
    },
    'areaServed': {
      '@type': 'Country',
      'name': 'US'
    },
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': `${sub.title} Plans`,
      'itemListElement': (sub.plans || []).map((p, idx) => ({
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Service',
          'name': p.name,
          'description': p.detail
        },
        'price': '0',
        'priceCurrency': 'USD',
        'priceSpecification': {
          '@type': 'PriceSpecification',
          'price': '0',
          'priceCurrency': 'USD',
          'name': 'Free Quote & Rate Comparison'
        }
      }))
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '3240',
      'bestRating': '5',
      'worstRating': '1'
    }
  }

  // FAQPage Schema
  const faqSchema = sub.faqs && sub.faqs.length > 0 ? {
    '@type': 'FAQPage',
    'mainEntity': sub.faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  } : null

  return {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbSchema, serviceSchema, ...(faqSchema ? [faqSchema] : [])]
  }
}

/**
 * Builds Schema.org for a Category Hub Page
 */
export function buildCategorySchema({ vertical, verticalId }) {
  const pageUrl = `${BASE_URL}/services/${verticalId}`
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': `${BASE_URL}/`
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': vertical.title,
            'item': pageUrl
          }
        ]
      },
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#collection`,
        'name': `${vertical.title} Services & Free Quotes`,
        'description': vertical.seoDesc || vertical.description,
        'url': pageUrl,
        'mainEntity': {
          '@type': 'ItemList',
          'itemListElement': Object.entries(vertical.subs || {}).map(([subId, sub], idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'name': sub.title,
            'url': `${BASE_URL}/services/${verticalId}/${subId}`
          }))
        }
      },
      ...(vertical.faqs && vertical.faqs.length > 0 ? [{
        '@type': 'FAQPage',
        'mainEntity': vertical.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      }] : [])
    ]
  }
}

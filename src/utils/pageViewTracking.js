// Page View Tracking Utility
// Privacy-friendly tracking without cookies - uses fingerprinting for visitor identification

const BOT_PATTERNS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java',
  'node-fetch', 'axios', 'headless', 'phantom', 'selenium', 'puppeteer',
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
  'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot',
  'applebot', 'pingdom', 'uptimerobot', 'statuscake', 'gtmetrix', 'lighthouse'
]

/**
 * Check if the user agent looks like a bot
 */
function isBot(userAgent) {
  if (!userAgent) return true
  const ua = userAgent.toLowerCase()
  return BOT_PATTERNS.some(pattern => ua.includes(pattern))
}

/**
 * Generate a simple visitor fingerprint (no cookies needed)
 * Combines browser characteristics to create a semi-unique ID
 */
function generateVisitorId() {
  if (typeof window === 'undefined') return null

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.deviceMemory || 'unknown'
  ]

  // Simple hash function
  const str = components.join('|')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  return 'v_' + Math.abs(hash).toString(36)
}

/**
 * Get or create a session ID (stored in sessionStorage)
 */
function getSessionId() {
  if (typeof window === 'undefined') return null

  let sessionId = sessionStorage.getItem('pv_session_id')
  if (!sessionId) {
    sessionId = 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    sessionStorage.setItem('pv_session_id', sessionId)
  }
  return sessionId
}

/**
 * Check if this is a new visitor (first time seeing this fingerprint in localStorage)
 */
function checkNewVisitor(visitorId) {
  if (typeof window === 'undefined') return true

  const knownVisitor = localStorage.getItem('pv_known')
  if (knownVisitor === visitorId) {
    return false
  }
  localStorage.setItem('pv_known', visitorId)
  return true
}

/**
 * Parse UTM parameters from URL
 */
function getUtmParams() {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign')
  }
}

/**
 * Get device type from user agent
 */
function getDeviceType() {
  if (typeof window === 'undefined') return 'unknown'

  const ua = navigator.userAgent.toLowerCase()
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

/**
 * Get browser name from user agent
 */
function getBrowser() {
  if (typeof window === 'undefined') return 'unknown'

  const ua = navigator.userAgent
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('SamsungBrowser')) return 'Samsung'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  if (ua.includes('Edge')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  return 'Other'
}

/**
 * Get OS from user agent
 */
function getOS() {
  if (typeof window === 'undefined') return 'unknown'

  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  return 'Other'
}

/**
 * Get referrer domain
 */
function getReferrerDomain() {
  if (typeof document === 'undefined' || !document.referrer) return null

  try {
    const url = new URL(document.referrer)
    // Don't count internal referrers
    if (url.hostname === window.location.hostname) return null
    return url.hostname
  } catch {
    return null
  }
}

/**
 * Track a page view
 * Non-blocking - fails silently if tracking fails
 */
export async function trackPageView() {
  if (typeof window === 'undefined') return

  // Skip bots
  if (isBot(navigator.userAgent)) {
    console.log('[PageView] Bot detected, skipping')
    return
  }

  // Skip admin pages
  if (window.location.pathname.startsWith('/admin')) {
    return
  }

  const visitorId = generateVisitorId()
  const sessionId = getSessionId()
  const isNewVisitor = checkNewVisitor(visitorId)
  const utmParams = getUtmParams()

  const pageViewData = {
    visitor_id: visitorId,
    session_id: sessionId,
    page_path: window.location.pathname,
    page_title: document.title,
    referrer: document.referrer || null,
    referrer_domain: getReferrerDomain(),
    utm_source: utmParams.utm_source,
    utm_medium: utmParams.utm_medium,
    utm_campaign: utmParams.utm_campaign,
    device_type: getDeviceType(),
    browser: getBrowser(),
    os: getOS(),
    screen_resolution: `${screen.width}x${screen.height}`,
    is_new_visitor: isNewVisitor,
    // Link to party tracking if exists
    party_tracking_session_id: localStorage.getItem('tracking_session_id') || null
  }

  try {
    // Use sendBeacon for non-blocking request (best for page views)
    const blob = new Blob([JSON.stringify(pageViewData)], { type: 'application/json' })
    const sent = navigator.sendBeacon('/api/track/pageview', blob)

    // Fallback to fetch if sendBeacon fails
    if (!sent) {
      fetch('/api/track/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageViewData),
        keepalive: true
      }).catch(() => {}) // Fail silently
    }
  } catch (error) {
    // Fail silently - tracking should never break the site
    console.error('[PageView] Tracking error:', error)
  }
}

/**
 * Get the current visitor ID (for linking with party tracking)
 */
export function getVisitorId() {
  return generateVisitorId()
}

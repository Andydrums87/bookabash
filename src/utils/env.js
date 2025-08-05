// utils/env.js or lib/env.js

export const getBaseUrl = () => {
    // For client-side
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    }
    
    // For server-side
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
    
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  }
  
  export const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || `${getBaseUrl()}/api`
  }
  
  export const getDomain = () => {
    return process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000'
  }
  
  // For building full URLs
  export const buildUrl = (path = '') => {
    const baseUrl = getBaseUrl()
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${baseUrl}${cleanPath}`
  }
  
  // Check if we're in development
  export const isDev = process.env.NODE_ENV === 'development'
  
  // Check if we're in production
  export const isProd = process.env.NODE_ENV === 'production'
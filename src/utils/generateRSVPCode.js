// Generate a unique RSVP code for guests
// Format: 8-character alphanumeric code (e.g., "AB12CD34")

export function generateRSVPCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing characters (0, O, I, 1)
  let code = ''

  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return code
}

// Generate a friendly URL slug from the code
export function getRSVPUrl(code) {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://partysnap.co.uk'

  return `${baseUrl}/e-invites/${code}`
}

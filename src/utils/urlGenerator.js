// 1. URL Generator Utility: /utils/urlGenerator.js
export const urlGenerator = {
    // Generate friendly URLs for AI-generated invites
    createInviteSlug: (partyData, inviteId) => {
      // Get child's first name and last name
      const childName = partyData.childName || partyData.child_name || 'party'
      const nameParts = childName.toLowerCase().trim().split(/\s+/)
      const firstName = nameParts[0] || 'party'
      const lastName = nameParts[1] || ''

      // Get party date
      const partyDate = partyData.date || partyData.party_date || new Date().toISOString()
      const dateObj = new Date(partyDate)
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')

      // Create slug: firstname-lastname-yyyy-mm-dd
      const namePart = lastName ? `${firstName}-${lastName}` : firstName
      const cleanName = namePart.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')

      return `${cleanName}-${year}-${month}-${day}`
      // Result: emma-smith-2025-06-15 or emma-2025-06-15
    },
  
    createRegistrySlug: (partyData, registryId) => {
      const childName = partyData.childName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'party'
      const shortId = registryId.slice(-8)
      
      return `${childName}-gifts-${shortId}`
      // Result: emma-gifts-def67890
    },
  
    // Generate absolute URLs for sharing
    createAbsoluteUrl: (path) => {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://partysnap.com'
        : 'http://localhost:3000'
      return `${baseUrl}${path}`
    },
  
    // Extract party data from friendly slug
    parseInviteSlug: (slug) => {
      const parts = slug.split('-')
      return {
        shortId: parts[parts.length - 1],
        childName: parts.slice(0, -2).join('-'),
        theme: parts[parts.length - 2]
      }
    }
  }
  
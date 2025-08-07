// 1. URL Generator Utility: /utils/urlGenerator.js
export const urlGenerator = {
    // Generate friendly URLs for AI-generated invites
    createInviteSlug: (partyData, inviteId) => {
      const childName = partyData.childName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'party'
      const theme = partyData.themeName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'birthday'
      const shortId = inviteId.slice(-8) // Last 8 chars
      
      return `${childName}-${theme}-${shortId}`
      // Result: emma-princess-abc12345
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
  
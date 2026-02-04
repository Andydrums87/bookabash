/**
 * Utility functions for generating and managing venue claim tokens
 */

/**
 * Generate a random claim token
 * @returns {string} A unique claim token
 */
export function generateClaimToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

/**
 * Generate a claim link for a venue
 * @param {string} token - The claim token
 * @param {string} baseUrl - The base URL (defaults to NEXT_PUBLIC_SITE_URL)
 * @returns {string} The full claim URL
 */
export function getClaimLink(token, baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://partysnap.co.uk') {
  return `${baseUrl}/suppliers/claim/${token}`
}

/**
 * SQL helper - generates SQL to create a claim token for a supplier
 * @param {string} supplierId - The supplier UUID
 * @param {string} ownerEmail - The intended owner's email (optional)
 * @param {number} expiryDays - Days until token expires (optional, default: no expiry)
 * @returns {string} SQL statement
 */
export function generateClaimTokenSQL(supplierId, ownerEmail = null, expiryDays = null) {
  const token = generateClaimToken()
  const expiry = expiryDays
    ? `NOW() + INTERVAL '${expiryDays} days'`
    : 'NULL'
  const email = ownerEmail ? `'${ownerEmail}'` : 'NULL'

  return `
UPDATE suppliers
SET
  claim_token = '${token}',
  claim_token_expires_at = ${expiry},
  pending_owner_email = ${email}
WHERE id = '${supplierId}';

-- Claim link: ${getClaimLink(token)}
`
}

// utils/previewLinks.js
import crypto from 'crypto'

export function generateSupplierPreviewLink({
  supplierId,
  supplierName,
  expiresInDays = 30,
  includeToken = false
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourapp.com'
  let previewUrl = `${baseUrl}/preview/supplier/${supplierId}`
  
  const params = new URLSearchParams()
  
  // Optional: Add security token
  if (includeToken) {
    const token = generatePreviewToken(supplierId, expiresInDays)
    params.append('token', token)
  }
  
  // Optional: Add supplier name for tracking
  if (supplierName) {
    params.append('ref', supplierName.toLowerCase().replace(/\s+/g, '-'))
  }
  
  if (params.toString()) {
    previewUrl += `?${params.toString()}`
  }
  
  return previewUrl
}

// Optional: Generate secure tokens for preview links
function generatePreviewToken(supplierId, expiresInDays) {
  const expiresAt = Date.now() + (expiresInDays * 24 * 60 * 60 * 1000)
  const payload = `${supplierId}:${expiresAt}`
  const secret = process.env.PREVIEW_TOKEN_SECRET || 'your-secret-key'
  
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
    .substring(0, 32)
}

// Optional: Validate preview tokens
export function isValidPreviewToken(token, supplierId) {
  try {
    // Implementation depends on how you store token expiry
    // This is a simplified version
    return token.length === 32 && /^[a-f0-9]+$/.test(token)
  } catch {
    return false
  }
}

// Email template helper
export function getSupplierPreviewEmailTemplate(
  supplierName, 
  previewLink
) {
  return {
    subject: `Your Supplier Profile is Live - ${supplierName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${supplierName}!</h2>
        
        <p>Your supplier profile is now live and ready to attract customers!</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Preview Your Profile:</h3>
          <a href="${previewLink}" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Your Profile
          </a>
        </div>
        
        <p>This preview shows exactly how customers will see your profile, including:</p>
        <ul>
          <li>Your packages and pricing</li>
          <li>Photo gallery</li>
          <li>Customer reviews</li>
          <li>Contact information</li>
        </ul>
        
        <p>Share this link with friends and family to get their feedback!</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
          This preview link will remain active for 30 days. 
          <a href="mailto:support@yourapp.com">Contact us</a> if you need any changes.
        </p>
      </div>
    `,
    text: `
Hello ${supplierName}!

Your supplier profile is now live and ready to attract customers!

Preview your profile here: ${previewLink}

This preview shows exactly how customers will see your profile, including your packages, photo gallery, reviews, and contact information.

Share this link with friends and family to get their feedback!
    `
  }
}
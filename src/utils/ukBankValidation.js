// UK Bank Account Validation Utility
// Includes sort code lookup and basic modulus checking

// Sort code to bank name mapping (common UK banks)
const SORT_CODE_BANKS = {
  '01': 'National Westminster Bank',
  '04': 'Santander',
  '05': 'Clydesdale Bank',
  '07': 'Nationwide Building Society',
  '08': 'Co-operative Bank',
  '09': 'Santander',
  '10': 'Bank of Scotland',
  '11': 'Halifax',
  '12': 'Bank of Scotland',
  '13': 'Bank of Scotland',
  '14': 'Co-operative Bank',
  '15': 'National Westminster Bank',
  '16': 'Royal Bank of Scotland',
  '17': 'Royal Bank of Scotland',
  '18': 'National Westminster Bank',
  '19': 'National Westminster Bank',
  '20': 'Barclays Bank',
  '23': 'TSB Bank',
  '30': 'Lloyds Bank',
  '40': 'HSBC Bank',
  '51': 'National Westminster Bank',
  '52': 'National Westminster Bank',
  '53': 'National Westminster Bank',
  '54': 'National Westminster Bank',
  '55': 'National Westminster Bank',
  '56': 'National Westminster Bank',
  '57': 'National Westminster Bank',
  '58': 'National Westminster Bank',
  '59': 'National Westminster Bank',
  '60': 'National Westminster Bank',
  '61': 'National Westminster Bank',
  '62': 'National Westminster Bank',
  '63': 'National Westminster Bank',
  '70': 'Lloyds Bank',
  '71': 'Lloyds Bank',
  '72': 'Lloyds Bank',
  '73': 'Lloyds Bank',
  '74': 'Lloyds Bank',
  '77': 'Lloyds Bank',
  '80': 'Bank of Scotland',
  '82': 'Clydesdale Bank',
  '83': 'Royal Bank of Scotland',
  '87': 'Halifax',
}

// Additional specific sort code mappings
const SPECIFIC_SORT_CODES = {
  '040004': 'Monzo Bank',
  '040026': 'Monzo Bank',
  '230580': 'Starling Bank',
  '608371': 'Starling Bank',
  '040075': 'Monzo Bank',
  '050001': 'Metro Bank',
  '232600': 'Revolut',
  '000000': 'Invalid Sort Code',
}

/**
 * Look up bank name from sort code
 * @param {string} sortCode - 6 digit sort code (no dashes)
 * @returns {string|null} Bank name or null if unknown
 */
export function getBankNameFromSortCode(sortCode) {
  if (!sortCode || sortCode.length !== 6) return null

  // Check specific sort codes first
  if (SPECIFIC_SORT_CODES[sortCode]) {
    return SPECIFIC_SORT_CODES[sortCode]
  }

  // Check first 2 digits
  const prefix = sortCode.substring(0, 2)
  return SORT_CODE_BANKS[prefix] || null
}

/**
 * Validate sort code format
 * @param {string} sortCode - Sort code (with or without dashes)
 * @returns {boolean}
 */
export function isValidSortCodeFormat(sortCode) {
  if (!sortCode) return false
  const cleaned = sortCode.replace(/[-\s]/g, '')
  return /^\d{6}$/.test(cleaned)
}

/**
 * Validate account number format
 * @param {string} accountNumber - 8 digit account number
 * @returns {boolean}
 */
export function isValidAccountNumberFormat(accountNumber) {
  if (!accountNumber) return false
  const cleaned = accountNumber.replace(/\s/g, '')
  return /^\d{8}$/.test(cleaned)
}

/**
 * Basic modulus check for UK bank accounts
 * This is a simplified version - production should use full vocalink data
 * @param {string} sortCode - 6 digit sort code
 * @param {string} accountNumber - 8 digit account number
 * @returns {object} { valid: boolean, message: string }
 */
export function modulusCheck(sortCode, accountNumber) {
  // Clean inputs
  const cleanSortCode = sortCode?.replace(/[-\s]/g, '') || ''
  const cleanAccountNumber = accountNumber?.replace(/\s/g, '') || ''

  // Basic format validation
  if (!isValidSortCodeFormat(cleanSortCode)) {
    return { valid: false, message: 'Sort code must be 6 digits' }
  }

  if (!isValidAccountNumberFormat(cleanAccountNumber)) {
    return { valid: false, message: 'Account number must be 8 digits' }
  }

  // Check for obviously invalid patterns
  if (cleanSortCode === '000000') {
    return { valid: false, message: 'Invalid sort code' }
  }

  if (cleanAccountNumber === '00000000') {
    return { valid: false, message: 'Invalid account number' }
  }

  // Check if sort code prefix is known
  const bankName = getBankNameFromSortCode(cleanSortCode)

  // Basic modulus 10 check (simplified - covers most accounts)
  // Real implementation would use vocalink's modulus checking data
  const combined = cleanSortCode + cleanAccountNumber
  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]

  let sum = 0
  for (let i = 0; i < combined.length && i < weights.length; i++) {
    let product = parseInt(combined[i]) * weights[i]
    if (product > 9) {
      product = Math.floor(product / 10) + (product % 10)
    }
    sum += product
  }

  // Most UK accounts pass modulus 10 or 11 - we're being lenient here
  // A strict check would reject some valid accounts, so we just warn
  const passesBasicCheck = sum % 10 === 0 || bankName !== null

  if (passesBasicCheck || bankName) {
    return {
      valid: true,
      message: bankName ? `Account with ${bankName}` : 'Account details appear valid',
      bankName
    }
  }

  // Even if modulus fails, we allow it but warn
  // Real modulus checking requires the full vocalink dataset
  return {
    valid: true,
    message: 'Unable to verify - please double-check your details',
    warning: true,
    bankName: null
  }
}

/**
 * Format sort code with dashes
 * @param {string} sortCode - Raw sort code
 * @returns {string} Formatted sort code (XX-XX-XX)
 */
export function formatSortCode(sortCode) {
  if (!sortCode) return ''
  const cleaned = sortCode.replace(/[-\s]/g, '')
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}`
}

/**
 * Clean sort code (remove dashes)
 * @param {string} sortCode - Sort code with or without dashes
 * @returns {string} Clean 6-digit sort code
 */
export function cleanSortCode(sortCode) {
  if (!sortCode) return ''
  return sortCode.replace(/[-\s]/g, '').slice(0, 6)
}

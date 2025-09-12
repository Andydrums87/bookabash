// utils/profileCompletion.js - FIXED FOR MULTI-BUSINESS

// PRIMARY BUSINESS: Full completion requirements
const PRIMARY_BUSINESS_FIELDS = {
  'entertainment': {
    businessName: { required: true },
    'owner.name': { required: true },
    'owner.email': { required: true },
    aboutUs: { required: true, minWords: 10 },
    extraHourRate: { required: true, min: 1 },
    portfolioImages: { required: true, minimum: 1 }
  },
  'venues': {
    businessName: { required: true },
    'owner.name': { required: true },
    'owner.email': { required: true },
    'serviceDetails.aboutUs': { required: true, minWords: 10 },
    'serviceDetails.pricing.hourlyRate': { required: true, min: 1 },
    'serviceDetails.venueType': { required: true },
    'serviceDetails.venueDetails.parkingInfo': { required: true, minLength: 10 },
    image: { required: true, notPlaceholder: true },
    coverPhoto: { required: true },
    portfolioImages: { required: true, minimum: 1 }
  },
  'catering': {
    businessName: { required: true },
    'owner.name': { required: true },
    'owner.email': { required: true },
    aboutUs: { required: true, minWords: 10 },
    portfolioImages: { required: true, minimum: 1 }
  }
}

// THEMED BUSINESS: Minimal requirements (inherits most from primary)
const THEMED_BUSINESS_FIELDS = {
  'entertainment': {
    name: { required: true },
    description: { required: true, minWords: 5 },
    serviceType: { required: true },
    theme: { required: true }
  },
  'venues': {
    name: { required: true },
    'serviceDetails.aboutUs': { required: true, minWords: 10 },
    'serviceDetails.pricing.hourlyRate': { required: true, min: 1 },
    'serviceDetails.venueType': { required: true },
    portfolioImages: { required: true, minimum: 1 },
    coverPhoto: { required: true, notPlaceholder: true },
    serviceType: { required: true }
  },
  'catering': {
    name: { required: true },
    description: { required: true, minWords: 5 },
    serviceType: { required: true }
  },
  'photography': {
    name: { required: true },
    description: { required: true, minWords: 5 },
    serviceType: { required: true }
  },
  'decorations': {
    name: { required: true },
    description: { required: true, minWords: 5 },
    serviceType: { required: true }
  }
}

export const calculateProfileCompletion = (supplierData, businessType, isPrimary = true) => {
  // Choose the right requirements based on business type
  const requirements = isPrimary 
    ? (PRIMARY_BUSINESS_FIELDS[businessType?.toLowerCase()] || {})
    : (THEMED_BUSINESS_FIELDS[businessType?.toLowerCase()] || {})
  
  let completed = 0
  let total = Object.keys(requirements).length
  let missingFields = []
  
  // If no requirements defined, assume complete
  if (total === 0) {
    return {
      percentage: 100,
      completed: 0,
      total: 0,
      missingFields: [],
      canGoLive: true
    }
  }
  
  Object.entries(requirements).forEach(([field, rules]) => {
    const isComplete = checkFieldCompletion(supplierData, field, rules)
    if (isComplete) {
      completed++
    } else {
      missingFields.push({
        field,
        displayName: getFieldDisplayName(field, isPrimary),
        rules
      })
    }
  })
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 100
  
  return {
    percentage,
    completed,
    total,
    missingFields,
    canGoLive: percentage >= 100
  }
}

const checkFieldCompletion = (data, fieldPath, rules) => {
  const value = getNestedValue(data, fieldPath)
  
  if (rules.required && !value) return false
  if (rules.minWords && (!value || value.split(' ').filter(w => w.length > 0).length < rules.minWords)) return false
  if (rules.minimum && (!Array.isArray(value) || value.length < rules.minimum)) return false
  if (rules.min && (!value || value < rules.min)) return false
  if (rules.minLength && (!value || value.length < rules.minLength)) return false
  
  // Check for placeholder images (not real uploads)
  if (rules.notPlaceholder && value && value.includes('placeholder.svg')) return false
  
  return true
}

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

const getFieldDisplayName = (field, isPrimary = true) => {
  const primaryDisplayNames = {
    businessName: 'Business Name',
    'owner.name': 'Contact Person',
    'owner.email': 'Email Address',
    aboutUs: 'Business Description',
    extraHourRate: 'Extra Hour Rate',
    portfolioImages: 'Photos',
    'serviceDetails.aboutUs': 'Business Description',
    'serviceDetails.pricing.hourlyRate': 'Hourly Rate',
    'serviceDetails.venueType': 'Venue Type',
    'serviceDetails.venueDetails.parkingInfo': 'Parking Information',
    image: 'Business Logo',
    coverPhoto: 'Cover Photo'
  }

  const themedDisplayNames = {
    name: 'Business Name',
    description: 'Business Description', 
    serviceType: 'Service Type',
    theme: 'Theme/Specialty',
    'serviceDetails.aboutUs': 'Business Description'
  }

  const displayNames = isPrimary ? primaryDisplayNames : themedDisplayNames
  return displayNames[field] || field
}
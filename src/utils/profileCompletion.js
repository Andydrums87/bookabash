// utils/profileCompletion.js - UPDATED WITH MANDATORY VERIFICATION

// Field definitions with verification requirements
const FIELD_METADATA = {
  businessName: {
    displayName: 'Business Name',
    helpText: 'Your official business name as customers will see it',
    estimatedTime: '1 min',
    priority: 'high',
    impact: 'Essential for customer trust and search',
    section: 'basic',
    icon: 'building'
  },
  'owner.name': {
    displayName: 'Contact Person',
    helpText: 'Your full name as the primary business contact',
    estimatedTime: '1 min',
    priority: 'high',
    impact: 'Required for legal compliance',
    section: 'basic',
    icon: 'user'
  },
  'owner.email': {
    displayName: 'Email Address',
    helpText: 'Primary email for booking notifications and customer contact',
    estimatedTime: '1 min',
    priority: 'high',
    impact: 'Essential for booking system',
    section: 'basic',
    icon: 'mail'
  },
  aboutUs: {
    displayName: 'Business Description',
    helpText: 'Write a compelling description that showcases your expertise (minimum 10 words)',
    estimatedTime: '5 min',
    priority: 'high',
    impact: 'Profiles with good descriptions get 40% more bookings',
    section: 'details',
    icon: 'fileText'
  },
  extraHourRate: {
    displayName: 'Extra Hour Rate',
    helpText: 'Set your hourly rate for extending events beyond the original booking',
    estimatedTime: '2 min',
    priority: 'high',
    impact: 'Enables additional revenue from extended events',
    section: 'pricing',
    icon: 'dollarSign'
  },
  portfolioImages: {
    displayName: 'Portfolio Photos',
    helpText: 'Add at least 3 high-quality photos showcasing your best work',
    estimatedTime: '10 min',
    priority: 'high',
    impact: 'Profiles with photos get 5x more views and bookings',
    section: 'media',
    icon: 'camera'
  },
  // NEW: Verification requirements
  'verification.dbs': {
    displayName: 'DBS Certificate',
    helpText: 'Enhanced DBS certificate - legally required for working with children',
    estimatedTime: '5 min',
    priority: 'critical',
    impact: 'Required by UK law for child safety',
    section: 'verification',
    icon: 'shield'
  },
  'verification.id': {
    displayName: 'Photo ID',
    helpText: 'Government-issued photo ID (passport, driving license, or national ID)',
    estimatedTime: '3 min',
    priority: 'critical',
    impact: 'Essential for identity verification',
    section: 'verification',
    icon: 'camera'
  },
  'verification.address': {
    displayName: 'Address Proof',
    helpText: 'Recent utility bill, bank statement, or council tax document',
    estimatedTime: '3 min',
    priority: 'critical',
    impact: 'Required for address verification',
    section: 'verification',
    icon: 'mapPin'
  },
  // Venue-specific fields
  'serviceDetails.venueType': {
    displayName: 'Venue Type',
    helpText: 'Specify what type of venue you offer (e.g., Community Hall, Private Garden)',
    estimatedTime: '2 min',
    priority: 'high',
    impact: 'Essential for customers to understand your space',
    section: 'venue',
    icon: 'home'
  },
  'serviceDetails.pricing.hourlyRate': {
    displayName: 'Hourly Rate',
    helpText: 'Set your venue hire rate per hour',
    estimatedTime: '2 min',
    priority: 'high',
    impact: 'Required for customers to book your venue',
    section: 'pricing',
    icon: 'dollarSign'
  },
  'serviceDetails.capacity.max': {
    displayName: 'Maximum Capacity',
    helpText: 'Maximum number of guests your venue can accommodate',
    estimatedTime: '2 min',
    priority: 'high',
    impact: 'Helps customers find venues that fit their party size',
    section: 'venue',
    icon: 'users'
  },
  'serviceDetails.venueAddress.addressLine1': {
    displayName: 'Venue Address',
    helpText: 'Full address of your venue location',
    estimatedTime: '2 min',
    priority: 'high',
    impact: 'Required for customers to find your venue',
    section: 'venue',
    icon: 'mapPin'
  }
};

// Updated step-based organization with verification step
const COMPLETION_STEPS = {
  'entertainment': {
    primary: [
      {
        id: 1,
        title: 'Basic Information',
        description: 'Essential contact details and business info',
        fields: ['businessName', 'owner.name', 'owner.email'],
        estimatedTime: '3 min'
      },
      {
        id: 2,
        title: 'Business Description',
        description: 'Tell customers about your services',
        fields: ['aboutUs'],
        estimatedTime: '5 min'
      },
      {
        id: 3,
        title: 'Pricing Setup',
        description: 'Set your rates and pricing options',
        fields: ['extraHourRate'],
        estimatedTime: '2 min'
      },
      {
        id: 4,
        title: 'Portfolio & Media',
        description: 'Showcase your work with photos',
        fields: ['portfolioImages'],
        estimatedTime: '10 min'
      },
      {
        id: 5,
        title: 'Verification Documents',
        description: 'Upload required verification documents - legally required for child safety',
        fields: ['verification.dbs', 'verification.id', 'verification.address'],
        estimatedTime: '11 min',
        priority: 'critical'
      }
    ]
  },
  'venues': {
    primary: [
      {
        id: 1,
        title: 'Basic Information',
        description: 'Essential contact details and venue info',
        fields: ['businessName', 'owner.name', 'owner.email'],
        estimatedTime: '3 min'
      },
      {
        id: 2,
        title: 'Venue Details',
        description: 'Describe your venue space and type',
        fields: ['aboutUs', 'serviceDetails.venueType'],
        estimatedTime: '7 min'
      },
      {
        id: 3,
        title: 'Capacity & Pricing',
        description: 'Set your venue capacity and pricing',
        fields: ['serviceDetails.capacity.max', 'serviceDetails.pricing.hourlyRate'],
        estimatedTime: '4 min'
      },
      {
        id: 4,
        title: 'Location & Access',
        description: 'Venue address and practical information',
        fields: ['serviceDetails.venueAddress.addressLine1'],
        estimatedTime: '2 min'
      },
      {
        id: 5,
        title: 'Portfolio & Media',
        description: 'Show off your venue with photos',
        fields: ['portfolioImages'],
        estimatedTime: '10 min'
      }
      // Note: Venues may not require verification depending on your business rules
    ]
  }
};
const PRIMARY_BUSINESS_FIELDS = {
  'entertainment': {
    aboutUs: {  
      required: true, 
      validation: { minLength: 10 },
      errorMessage: 'Business description required'
    },
    extraHourRate: {  
      required: true, 
      validation: { min: 10 },
      errorMessage: 'Extra hour rate required'
    },
    portfolioImages: { 
      required: true, 
      validation: { minimum: 1 },
      errorMessage: 'At least 1 photo required'
    },
    'verification.dbs': { 
      required: true, 
      validation: { status: 'approved' },
      errorMessage: 'DBS must be approved'
    }
  },
  'venues': {
    aboutUs: {  
      required: true, 
      validation: { minLength: 10 },
      errorMessage: 'Venue description required'
    },
    'serviceDetails.venueType': {  
      required: true, 
      validation: { minLength: 3 },
      errorMessage: 'Venue type required'
    },
    'serviceDetails.pricing.hourlyRate': {  
      required: true, 
      validation: { min: 20 },
      errorMessage: 'Hourly rate required'
    },
    'serviceDetails.capacity.max': {  
      required: true, 
      validation: { min: 10 },
      errorMessage: 'Capacity required'
    },
    portfolioImages: { 
      required: true, 
      validation: { minimum: 1 },
      errorMessage: 'At least 1 photo required'
    }
    // No verification required for venues
  }
}
export const calculateProfileCompletion = (supplierData, businessType, isPrimary = true) => {
  const requirements = isPrimary 
    ? (PRIMARY_BUSINESS_FIELDS[businessType?.toLowerCase()] || {})
    : {};
  
  let completed = 0;
  let total = Object.keys(requirements).length;
  let missingFields = [];
  let validationErrors = [];
  
  if (total === 0) {
    return {
      percentage: 100,
      completed: 0,
      total: 0,
      missingFields: [],
      validationErrors: [],
      canGoLive: true,
      steps: []
    };
  }
  
  Object.entries(requirements).forEach(([field, rules]) => {
    const fieldValue = getNestedValue(supplierData, field);
    const validationResult = validateField(fieldValue, rules, field);
    
    if (validationResult.isValid) {
      completed++;
    } else {
      const metadata = FIELD_METADATA[field] || {};
      missingFields.push({
        field,
        displayName: metadata.displayName || field,
        helpText: metadata.helpText || '',
        estimatedTime: metadata.estimatedTime || '2 min',
        priority: metadata.priority || 'medium',
        impact: metadata.impact || '',
        section: metadata.section || 'general',
        icon: metadata.icon || 'circle',
        rules,
        currentValue: fieldValue,
        errorMessage: validationResult.error || rules.errorMessage
      });
      
      if (validationResult.error) {
        validationErrors.push({
          field,
          message: validationResult.error
        });
      }
    }
  });
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 100;
  const steps = generateCompletionSteps(missingFields, businessType, isPrimary);
  
  return {
    percentage,
    completed,
    total,
    missingFields,
    validationErrors,
    canGoLive: percentage >= 100 && validationErrors.length === 0,
    steps,
    estimatedTimeRemaining: calculateTotalTime(missingFields),
    priorityBreakdown: categorizePriority(missingFields)
  };
};

const validateField = (value, rules, fieldName) => {
  // Special validation for verification fields
  if (fieldName.startsWith('verification.')) {
    return validateVerificationField(value, rules, fieldName);
  }
  
  // Check required
  if (rules.required && (!value || (Array.isArray(value) && value.length === 0))) {
    return { isValid: false, error: 'This field is required' };
  }
  
  if (!value && !rules.required) {
    return { isValid: true };
  }
  
  // Validate based on rules
  if (rules.validation) {
    const { validation } = rules;
    
    // String length validation
    if (validation.minLength && value.length < validation.minLength) {
      return { isValid: false, error: `Minimum ${validation.minLength} characters required` };
    }
    
    if (validation.maxLength && value.length > validation.maxLength) {
      return { isValid: false, error: `Maximum ${validation.maxLength} characters allowed` };
    }
    
    // Word count validation
    if (validation.minWords) {
      const wordCount = value.split(' ').filter(w => w.length > 0).length;
      if (wordCount < validation.minWords) {
        return { isValid: false, error: `Minimum ${validation.minWords} words required` };
      }
    }
    
    // Pattern validation
    if (validation.pattern && !validation.pattern.test(value)) {
      return { isValid: false, error: 'Invalid format' };
    }
    
    // Numeric validation
    if (validation.min && parseFloat(value) < validation.min) {
      return { isValid: false, error: `Minimum value: ${validation.min}` };
    }
    
    if (validation.max && parseFloat(value) > validation.max) {
      return { isValid: false, error: `Maximum value: ${validation.max}` };
    }
    
    // Array validation
    if (Array.isArray(value)) {
      if (validation.minimum && value.length < validation.minimum) {
        return { isValid: false, error: `At least ${validation.minimum} items required` };
      }
      
      if (validation.maximum && value.length > validation.maximum) {
        return { isValid: false, error: `Maximum ${validation.maximum} items allowed` };
      }
    }
  }
  
  return { isValid: true };
};

const validateVerificationField = (value, rules, fieldName) => {
  if (!value || typeof value !== 'object') {
    return { isValid: false, error: 'Verification document required' };
  }
  
  // Check if document has been uploaded
  if (!value.status || value.status === 'not_submitted') {
    return { isValid: false, error: 'Document must be uploaded' };
  }
  
  // Special validation for DBS - must be approved
  if (fieldName === 'verification.dbs') {
    if (value.status !== 'approved') {
      if (value.status === 'rejected') {
        return { isValid: false, error: 'DBS certificate was rejected - please resubmit' };
      }
      if (value.status === 'submitted') {
        return { isValid: false, error: 'DBS certificate is under review' };
      }
      return { isValid: false, error: 'DBS certificate must be approved' };
    }
  }
  
  // ID and address can be submitted or approved
  if (fieldName === 'verification.id' || fieldName === 'verification.address') {
    if (!['submitted', 'approved'].includes(value.status)) {
      if (value.status === 'rejected') {
        return { isValid: false, error: 'Document was rejected - please resubmit' };
      }
      return { isValid: false, error: 'Document must be uploaded' };
    }
  }
  
  return { isValid: true };
};

// Helper function to get field action URL with verification routes
export const getFieldActionUrl = (fieldName, businessType = 'entertainment') => {
  const urlMap = {
    'portfolioImages': '/suppliers/media',
    'extraHourRate': '/suppliers/profile#pricing',
    'aboutUs': '/suppliers/profile#about',
    'businessName': '/suppliers/profile#basic',
    'owner.name': '/suppliers/profile#contact',
    'owner.email': '/suppliers/profile#contact',
    'serviceDetails.aboutUs': '/suppliers/profile#about',
    'serviceDetails.pricing.hourlyRate': '/suppliers/profile#pricing',
    'serviceDetails.venueType': '/suppliers/profile#venue-details',
    'serviceDetails.capacity.max': '/suppliers/profile#venue-details',
    'serviceDetails.venueAddress.addressLine1': '/suppliers/profile#venue-address',
    // NEW: Verification routes
    'verification.dbs': '/suppliers/verification',
    'verification.id': '/suppliers/verification',
    'verification.address': '/suppliers/verification'
  };
  
  return urlMap[fieldName] || '/suppliers/profile';
};

// Helper function to get completion insights with verification-specific messaging
export const getCompletionInsights = (completionData, businessType) => {
  const { missingFields, percentage, priorityBreakdown } = completionData;
  const isEntertainment = businessType?.toLowerCase() === 'entertainment';
  
  const insights = [];
  
  // Critical verification warnings for entertainers
  if (isEntertainment) {
    const verificationFields = missingFields.filter(f => f.field.startsWith('verification.'));
    if (verificationFields.length > 0) {
      insights.push({
        type: 'critical',
        message: 'Verification is legally required for entertainers working with children',
        action: 'Complete verification documents immediately',
        priority: 'urgent'
      });
    }
    
    const dbsField = missingFields.find(f => f.field === 'verification.dbs');
    if (dbsField) {
      insights.push({
        type: 'critical',
        message: 'Enhanced DBS certificate is required by UK law',
        action: 'Upload your DBS certificate or apply for one',
        priority: 'urgent'
      });
    }
  }
  
  if (priorityBreakdown.high.length > 0) {
    insights.push({
      type: 'important',
      message: `${priorityBreakdown.high.length} important items need attention`,
      action: 'Focus on required fields first'
    });
  }
  
  if (percentage >= 80 && percentage < 100) {
    insights.push({
      type: 'success',
      message: 'You\'re almost ready to go live!',
      action: 'Complete the remaining items'
    });
  }
  
  const portfolioField = missingFields.find(f => f.field === 'portfolioImages');
  if (portfolioField) {
    insights.push({
      type: 'tip',
      message: 'Adding portfolio photos increases bookings by 5x',
      action: 'Upload your best work photos'
    });
  }
  
  return insights;
};

// Additional helper functions remain the same...
const generateCompletionSteps = (missingFields, businessType, isPrimary) => {
  const stepConfig = COMPLETION_STEPS[businessType?.toLowerCase()]?.[isPrimary ? 'primary' : 'themed'] || [];
  
  return stepConfig.map(step => {
    const stepMissingFields = missingFields.filter(field => 
      step.fields.includes(field.field)
    );
    
    const stepCompletedFields = step.fields.filter(field => 
      !missingFields.some(missing => missing.field === field)
    );
    
    const completionPercentage = step.fields.length > 0 
      ? Math.round((stepCompletedFields.length / step.fields.length) * 100)
      : 100;
    
    return {
      ...step,
      missingFields: stepMissingFields,
      completedFields: stepCompletedFields,
      isComplete: stepMissingFields.length === 0,
      completionPercentage,
      highPriorityCount: stepMissingFields.filter(f => f.priority === 'high').length,
      criticalCount: stepMissingFields.filter(f => f.priority === 'critical').length
    };
  });
};

const categorizePriority = (missingFields) => {
  const breakdown = { critical: [], high: [], medium: [], low: [] };
  
  missingFields.forEach(field => {
    const priority = field.priority || 'medium';
    if (breakdown[priority]) {
      breakdown[priority].push(field);
    }
  });
  
  return breakdown;
};

const calculateTotalTime = (missingFields) => {
  return missingFields.reduce((total, field) => {
    const time = parseInt(field.estimatedTime) || 2;
    return total + time;
  }, 0);
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};
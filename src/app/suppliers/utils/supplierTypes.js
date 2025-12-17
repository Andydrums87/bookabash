// utils/supplierTypes.js

export const AVAILABILITY_TYPES = {
    TIME_SLOT_BASED: 'time_slot_based',
    LEAD_TIME_BASED: 'lead_time_based',
    CAKE_CALENDAR: 'cake_calendar'
  }
  
  // Map supplier categories to availability types
  export const SUPPLIER_AVAILABILITY_CONFIG = {
    // Time slot based suppliers (need specific appointment times)
    'venue': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'venues': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'entertainment': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'entertainer': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'face_painting': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'face painting': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'facepainting': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'face_painter': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'photographer': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'photography': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'catering': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'caterer': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'magician': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'clown': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'balloon artist': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    'balloon designer': AVAILABILITY_TYPES.TIME_SLOT_BASED,
    
    // Cake suppliers (simplified calendar)
    'cakes': AVAILABILITY_TYPES.CAKE_CALENDAR,
    'cake': AVAILABILITY_TYPES.CAKE_CALENDAR,
    'baker': AVAILABILITY_TYPES.CAKE_CALENDAR,
    'bakery': AVAILABILITY_TYPES.CAKE_CALENDAR,

    // Lead time based suppliers (stock/product based)
    'party bags': AVAILABILITY_TYPES.LEAD_TIME_BASED,
    'partybags': AVAILABILITY_TYPES.LEAD_TIME_BASED,
    'party_bags': AVAILABILITY_TYPES.LEAD_TIME_BASED,
    'bouncy_castle': AVAILABILITY_TYPES.LEAD_TIME_BASED,
    'bouncy castle hire': AVAILABILITY_TYPES.LEAD_TIME_BASED,
    'inflatable hire': AVAILABILITY_TYPES.LEAD_TIME_BASED,
    'decorations': AVAILABILITY_TYPES.LEAD_TIME_BASED,
    'decoration': AVAILABILITY_TYPES.LEAD_TIME_BASED,
    'party decorations': AVAILABILITY_TYPES.LEAD_TIME_BASED,
    'party supplies': AVAILABILITY_TYPES.LEAD_TIME_BASED,
    'party_supplies': AVAILABILITY_TYPES.LEAD_TIME_BASED,
    'activities': AVAILABILITY_TYPES.LEAD_TIME_BASED, // Could be either, but defaulting to lead time
    'soft play': AVAILABILITY_TYPES.LEAD_TIME_BASED,
    'party equipment': AVAILABILITY_TYPES.LEAD_TIME_BASED
  }
  
  /**
   * Determines the availability type for a given supplier category
   * @param {string} category - The supplier category
   * @returns {string} - The availability type (TIME_SLOT_BASED or LEAD_TIME_BASED)
   */
  export const getAvailabilityType = (category) => {
    if (!category) {
      console.warn('No category provided to getAvailabilityType, defaulting to TIME_SLOT_BASED');
      return AVAILABILITY_TYPES.TIME_SLOT_BASED;
    }
    
    const normalizedCategory = category.toLowerCase().trim();
    const availabilityType = SUPPLIER_AVAILABILITY_CONFIG[normalizedCategory];
    
    if (!availabilityType) {
      console.warn(`Unknown category '${category}', defaulting to TIME_SLOT_BASED`);
      return AVAILABILITY_TYPES.TIME_SLOT_BASED;
    }
    
    console.log(`Category '${category}' mapped to availability type: ${availabilityType}`);
    return availabilityType;
  }
  
  /**
   * Checks if a supplier category uses time slot based availability
   * @param {string} category - The supplier category
   * @returns {boolean}
   */
  export const isTimeSlotBased = (category) => {
    return getAvailabilityType(category) === AVAILABILITY_TYPES.TIME_SLOT_BASED;
  }
  
  /**
   * Checks if a supplier category uses lead time based availability
   * @param {string} category - The supplier category
   * @returns {boolean}
   */
  export const isLeadTimeBased = (category) => {
    return getAvailabilityType(category) === AVAILABILITY_TYPES.LEAD_TIME_BASED;
  }
  
  /**
   * Gets a human-readable name for the availability type
   * @param {string} category - The supplier category
   * @returns {string}
   */
  export const getAvailabilityTypeName = (category) => {
    const type = getAvailabilityType(category);
    return type === AVAILABILITY_TYPES.TIME_SLOT_BASED 
      ? 'Time Slot Based' 
      : 'Lead Time Based';
  }
  
  /**
   * Gets configuration info for the availability type
   * @param {string} category - The supplier category
   * @returns {object}
   */
  export const getAvailabilityConfig = (category) => {
    const type = getAvailabilityType(category);
    
    if (type === AVAILABILITY_TYPES.TIME_SLOT_BASED) {
      return {
        type: AVAILABILITY_TYPES.TIME_SLOT_BASED,
        name: 'Time Slot Based',
        description: 'Availability based on specific time slots and working hours',
        features: [
          'Morning/afternoon time slots',
          'Working hours per day',
          'Specific unavailable dates',
          'Time slot blocking'
        ],
        suitableFor: 'Services requiring specific appointment times (venues, entertainers, face painters)'
      };
    } else {
      return {
        type: AVAILABILITY_TYPES.LEAD_TIME_BASED,
        name: 'Lead Time Based',
        description: 'Availability based on lead times and stock levels',
        features: [
          'Minimum/maximum lead times',
          'Stock level tracking',
          'Processing time requirements',
          'Order quantity management'
        ],
        suitableFor: 'Product-based suppliers with stock or processing requirements (party bags, cakes, decorations)'
      };
    }
  }
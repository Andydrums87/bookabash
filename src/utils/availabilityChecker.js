// utils/availabilityChecker.js
// Utility functions for checking supplier availability

/**
 * Parse human-readable date formats like "26th December, 2025"
 * @param {string} dateStr - Human-readable date string
 * @returns {Date|null} - Parsed Date object or null if parsing fails
 */
function parseHumanReadableDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;

  try {
    // Remove ordinal suffixes (st, nd, rd, th) from day numbers
    const cleanedStr = dateStr.replace(/(\d+)(st|nd|rd|th)/gi, '$1');

    // Try parsing the cleaned string
    const date = new Date(cleanedStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try alternative parsing: "26 December, 2025" or "December 26, 2025"
    const months = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
    };

    // Match patterns like "26 December, 2025" or "26 December 2025"
    const dayFirstMatch = cleanedStr.match(/(\d{1,2})\s+(\w+),?\s+(\d{4})/i);
    if (dayFirstMatch) {
      const day = parseInt(dayFirstMatch[1], 10);
      const month = months[dayFirstMatch[2].toLowerCase()];
      const year = parseInt(dayFirstMatch[3], 10);
      if (month !== undefined && day >= 1 && day <= 31) {
        return new Date(year, month, day);
      }
    }

    // Match patterns like "December 26, 2025"
    const monthFirstMatch = cleanedStr.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/i);
    if (monthFirstMatch) {
      const month = months[monthFirstMatch[1].toLowerCase()];
      const day = parseInt(monthFirstMatch[2], 10);
      const year = parseInt(monthFirstMatch[3], 10);
      if (month !== undefined && day >= 1 && day <= 31) {
        return new Date(year, month, day);
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a supplier is available on a given date and time
 * @param {Object} supplier - Supplier object with availability data
 * @param {string|Date} partyDate - Party date (ISO string or Date object)
 * @param {string} partyTime - Party time (e.g., "14:00", "2:00 PM")
 * @param {number} partyDuration - Party duration in hours (default: 2)
 * @returns {Object} { available: boolean, reason: string|null }
 */
export function checkSupplierAvailability(supplier, partyDate, partyTime = null, partyDuration = 2) {
  if (!supplier) {
    return { available: false, reason: 'No supplier provided' };
  }

  if (!partyDate) {
    // If no party date is set yet, allow adding supplier
    return { available: true, reason: null };
  }

  try {
    let date;
    if (typeof partyDate === 'string') {
      // Try standard Date parsing first
      date = new Date(partyDate);

      // If invalid, try parsing human-readable formats like "26th December, 2025"
      if (isNaN(date.getTime())) {
        date = parseHumanReadableDate(partyDate);
      }
    } else {
      date = partyDate;
    }

    // Check if date is valid
    if (!date || isNaN(date.getTime())) {
      // Silently allow if date can't be parsed - don't spam console
      return { available: true, reason: null };
    }

    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // 1. Check unavailable dates (blocked dates)
    if (supplier.unavailableDates && Array.isArray(supplier.unavailableDates)) {
      const isUnavailable = supplier.unavailableDates.some(unavailableDate => {
        // Handle both string format and object format
        if (typeof unavailableDate === 'string') {
          return unavailableDate === dateString || unavailableDate.startsWith(dateString);
        } else if (typeof unavailableDate === 'object' && unavailableDate.date) {
          // Handle object format: { date: "2025-11-29", timeSlots: [...] }
          return unavailableDate.date === dateString || unavailableDate.date.startsWith(dateString);
        }
        return false;
      });

      if (isUnavailable) {
        return {
          available: false,
          reason: `${supplier.name} is not available on ${formatDate(date)}. They have blocked this date.`
        };
      }
    }

    // 2. Check busy dates (already booked)
    if (supplier.busyDates && Array.isArray(supplier.busyDates)) {
      const isBusy = supplier.busyDates.some(busyDate => {
        // Handle both string format and object format
        if (typeof busyDate === 'string') {
          return busyDate === dateString || busyDate.startsWith(dateString);
        } else if (typeof busyDate === 'object' && busyDate.date) {
          // Handle object format: { date: "2025-11-29", timeSlots: [...] }
          return busyDate.date === dateString || busyDate.date.startsWith(dateString);
        }
        return false;
      });

      if (isBusy) {
        return {
          available: false,
          reason: `${supplier.name} is already booked on ${formatDate(date)}. Please choose a different supplier or date.`
        };
      }
    }

    // 3. Check working hours and days of week
    if (supplier.workingHours && partyTime) {
      const workingHoursCheck = checkWorkingHours(supplier.workingHours, dayOfWeek, partyTime, partyDuration);

      if (!workingHoursCheck.available) {
        return workingHoursCheck;
      }
    }

    // 4. Check advance booking / lead time requirements
    // Check multiple possible locations for minimum lead time:
    // - supplier.advanceBookingDays (legacy)
    // - supplier.leadTimeSettings.minLeadTimeDays (lead-based suppliers)
    // - supplier.data.serviceDetails.leadTime.minimum (cake suppliers)
    // - supplier.serviceDetails.leadTime.minimum (alternate location)
    const minLeadTime =
      supplier.advanceBookingDays ||
      supplier.leadTimeSettings?.minLeadTimeDays ||
      supplier.data?.serviceDetails?.leadTime?.minimum ||
      supplier.serviceDetails?.leadTime?.minimum ||
      0;

    if (minLeadTime > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      const daysUntilParty = Math.ceil((checkDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntilParty < minLeadTime) {
        const leadTimeLabel = minLeadTime === 7 ? '1 week' :
                              minLeadTime === 14 ? '2 weeks' :
                              minLeadTime === 21 ? '3 weeks' :
                              minLeadTime === 28 ? '4 weeks' :
                              `${minLeadTime} days`;
        return {
          available: false,
          reason: `${supplier.name || 'This supplier'} requires at least ${leadTimeLabel} advance notice. Your party is in ${daysUntilParty} days.`,
          requiredLeadTime: minLeadTime
        };
      }
    }

    // 5. Check maximum booking days in advance
    if (supplier.maxBookingDays) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      const daysUntilParty = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

      if (daysUntilParty > supplier.maxBookingDays) {
        return {
          available: false,
          reason: `${supplier.name} only accepts bookings up to ${supplier.maxBookingDays} days in advance. Your party is ${daysUntilParty} days away.`
        };
      }
    }

    // All checks passed
    return { available: true, reason: null };

  } catch (error) {
    console.error('Error checking supplier availability:', error);
    // If there's an error, allow the booking but log it
    return { available: true, reason: null };
  }
}

/**
 * Check if supplier works on the given day and time
 * @param {Object} workingHours - Supplier's working hours configuration
 * @param {number} dayOfWeek - Day of week (0 = Sunday, 6 = Saturday)
 * @param {string} partyTime - Party start time
 * @param {number} partyDuration - Party duration in hours
 * @returns {Object} { available: boolean, reason: string|null }
 */
function checkWorkingHours(workingHours, dayOfWeek, partyTime, partyDuration) {
  try {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    // Check if supplier works on this day
    if (workingHours[dayName] === false || workingHours[dayName]?.enabled === false) {
      return {
        available: false,
        reason: `This supplier doesn't work on ${capitalize(dayName)}s. Please choose a different date.`
      };
    }

    // If working hours are specified for this day, check time range
    const daySchedule = workingHours[dayName];
    if (daySchedule && typeof daySchedule === 'object' && daySchedule.start && daySchedule.end) {
      const partyStartTime = parseTime(partyTime);
      const partyEndTime = partyStartTime + partyDuration;
      const workStart = parseTime(daySchedule.start);
      const workEnd = parseTime(daySchedule.end);

      if (partyStartTime < workStart || partyEndTime > workEnd) {
        return {
          available: false,
          reason: `This supplier only works ${daySchedule.start} - ${daySchedule.end} on ${capitalize(dayName)}s. Your party time doesn't fit their schedule.`
        };
      }
    }

    return { available: true, reason: null };

  } catch (error) {
    console.error('Error checking working hours:', error);
    return { available: true, reason: null };
  }
}

/**
 * Parse time string to decimal hours
 * @param {string} timeStr - Time string (e.g., "14:00", "2:00 PM")
 * @returns {number} Hours in decimal format (e.g., 14.5 for 2:30 PM)
 */
function parseTime(timeStr) {
  if (!timeStr) return 0;

  timeStr = timeStr.trim();

  // Handle 12-hour format (e.g., "2:00 PM")
  const twelveHourMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (twelveHourMatch) {
    let hours = parseInt(twelveHourMatch[1]);
    const minutes = parseInt(twelveHourMatch[2]);
    const ampm = twelveHourMatch[3].toUpperCase();

    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return hours + (minutes / 60);
  }

  // Handle 24-hour format (e.g., "14:00")
  const twentyFourHourMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (twentyFourHourMatch) {
    const hours = parseInt(twentyFourHourMatch[1]);
    const minutes = parseInt(twentyFourHourMatch[2]);
    return hours + (minutes / 60);
  }

  return 0;
}

/**
 * Format date for display
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Check availability for multiple suppliers at once
 * @param {Array} suppliers - Array of supplier objects
 * @param {string|Date} partyDate - Party date
 * @param {string} partyTime - Party time
 * @param {number} partyDuration - Party duration in hours
 * @returns {Object} Map of supplier IDs to availability results
 */
export function checkMultipleSuppliers(suppliers, partyDate, partyTime, partyDuration = 2) {
  const results = {};

  suppliers.forEach(supplier => {
    if (supplier && supplier.id) {
      results[supplier.id] = checkSupplierAvailability(supplier, partyDate, partyTime, partyDuration);
    }
  });

  return results;
}

/**
 * Get available suppliers from a list
 * @param {Array} suppliers - Array of supplier objects
 * @param {string|Date} partyDate - Party date
 * @param {string} partyTime - Party time
 * @param {number} partyDuration - Party duration in hours
 * @returns {Array} Array of available suppliers
 */
export function filterAvailableSuppliers(suppliers, partyDate, partyTime, partyDuration = 2) {
  if (!suppliers || !Array.isArray(suppliers)) {
    return [];
  }

  return suppliers.filter(supplier => {
    const check = checkSupplierAvailability(supplier, partyDate, partyTime, partyDuration);
    return check.available;
  });
}

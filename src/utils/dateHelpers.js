// utils/dateHelpers.js
// Centralized date handling to avoid timezone issues across all components

/**
 * Convert a Date object to YYYY-MM-DD string using local timezone
 * This prevents the off-by-one day error caused by toISOString()
 */
export const dateToLocalString = (date) => {
    if (!date) return null;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Convert YYYY-MM-DD string to Date object in local timezone
   */
  export const stringToLocalDate = (dateString) => {
    if (!dateString) return null;
    
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
  /**
   * Check if two dates are the same day (ignoring time)
   */
  export const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    return dateToLocalString(date1) === dateToLocalString(date2);
  };
  
  /**
   * Add days to a date
   */
  export const addDays = (date, days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };
  
  /**
   * Format date for display
   */
  export const formatDate = (date) => {
    if (!date) return '';
    
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric", 
      month: "long",
      day: "numeric",
    });
  };
  
  /**
   * Get date string that matches what's stored in supplier data
   * This ensures consistent comparison across all components
   */
  export const getDateStringForComparison = (date) => {
    if (!date) return null;
    
    if (typeof date === 'string') {
      // If it's already a string, clean it up
      return date.includes('T') ? date.split('T')[0] : date;
    }
    
    // Convert Date object to local string
    return dateToLocalString(date);
  };
  
  /**
   * Parse various date formats into a consistent Date object
   */
  export const parseSupplierDate = (dateValue) => {
    if (!dateValue) return null;
    
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    if (typeof dateValue === 'string') {
      if (dateValue.includes('T')) {
        // ISO string - use Date constructor but be aware of timezone
        return new Date(dateValue);
      } else {
        // YYYY-MM-DD format - convert to local date
        return stringToLocalDate(dateValue);
      }
    }
    
    return null;
  };
  
  /**
   * Migration utility for date arrays (updated version)
   */
  export const migrateDateArray = (dateArray) => {
    if (!Array.isArray(dateArray)) return [];
    
    return dateArray.map(dateItem => {
      if (typeof dateItem === 'string') {
        // Handle ISO string dates properly
        const dateStr = dateItem.includes('T') ? dateItem.split('T')[0] : dateItem;
        return {
          date: dateStr,
          timeSlots: ['morning', 'afternoon']
        };
      } else if (dateItem && typeof dateItem === 'object' && dateItem.date) {
        // Ensure the date string is in the correct format
        const dateStr = dateItem.date.includes('T') ? dateItem.date.split('T')[0] : dateItem.date;
        return {
          ...dateItem,
          date: dateStr
        };
      } else {
        // Handle Date objects
        const date = new Date(dateItem);
        return {
          date: dateToLocalString(date),
          timeSlots: ['morning', 'afternoon']
        };
      }
    });
  };
  
  /**
   * Mark date range as unavailable - used in availability settings
   */
  export const markUnavailableRange = (days, timeSlots = ['morning', 'afternoon']) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = addDays(new Date(), i);
      dates.push({
        date: dateToLocalString(date),
        timeSlots: timeSlots
      });
    }
    return dates;
  };
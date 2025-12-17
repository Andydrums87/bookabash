/**
 * Edit Deadline Utility
 * Manages the 48-hour cutoff before party date for booking edits
 * and order status restrictions
 */

// Order statuses that block editing (cake is being prepared or already sent)
const LOCKED_ORDER_STATUSES = [
  'preparing',
  'dispatched',
  'delivered',
  'ready_for_collection',
  'collected'
]

/**
 * Check if order status allows editing
 * @param {string} orderStatus - The current order status
 * @returns {boolean} - True if editing is allowed based on status
 */
export function canEditByOrderStatus(orderStatus) {
  if (!orderStatus) return true // No status yet = can edit
  return !LOCKED_ORDER_STATUSES.includes(orderStatus)
}

/**
 * Get reason why editing is blocked by order status
 * @param {string} orderStatus - The current order status
 * @returns {string|null} - Message explaining why editing is blocked, or null if allowed
 */
export function getOrderStatusEditBlockReason(orderStatus) {
  if (!orderStatus || canEditByOrderStatus(orderStatus)) return null

  switch (orderStatus) {
    case 'preparing':
      return 'This order is being prepared and cannot be modified'
    case 'dispatched':
      return 'This order has been dispatched and cannot be modified'
    case 'delivered':
      return 'This order has been delivered'
    case 'ready_for_collection':
      return 'This order is ready for collection and cannot be modified'
    case 'collected':
      return 'This order has been collected'
    default:
      return 'This order cannot be modified'
  }
}

/**
 * Check if a booking can still be edited (more than 48 hours before party)
 * @param {string|Date} partyDate - The party date
 * @param {string} orderStatus - Optional order status to check
 * @returns {boolean} - True if editing is allowed
 */
export function canEditBooking(partyDate, orderStatus = null) {
  // Check order status first (takes priority)
  if (orderStatus && !canEditByOrderStatus(orderStatus)) {
    return false
  }

  if (!partyDate) return false

  const deadline = getEditDeadline(partyDate)
  return new Date() < deadline
}

/**
 * Get the edit deadline (48 hours before party)
 * @param {string|Date} partyDate - The party date
 * @returns {Date} - The deadline after which edits are locked
 */
export function getEditDeadline(partyDate) {
  if (!partyDate) return new Date()

  const deadline = new Date(partyDate)
  deadline.setHours(deadline.getHours() - 48)
  return deadline
}

/**
 * Get time remaining until edit deadline
 * @param {string|Date} partyDate - The party date
 * @returns {object} - { canEdit, hoursRemaining, deadline }
 */
export function getEditTimeRemaining(partyDate) {
  if (!partyDate) {
    return { canEdit: false, hoursRemaining: 0, deadline: null }
  }

  const deadline = getEditDeadline(partyDate)
  const now = new Date()
  const diffMs = deadline - now
  const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)))

  return {
    canEdit: diffMs > 0,
    hoursRemaining,
    deadline
  }
}

/**
 * Format the edit deadline for display
 * @param {string|Date} partyDate - The party date
 * @returns {string} - Formatted deadline string
 */
export function formatEditDeadline(partyDate) {
  const deadline = getEditDeadline(partyDate)
  return deadline.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

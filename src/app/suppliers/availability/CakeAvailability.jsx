"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight, ChevronDown, Settings, Clock, Check, Loader2, AlertCircle, X, Calendar, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

// Auto-save indicator
const AutoSaveIndicator = ({ status }) => {
  if (status === "idle") return null

  const config = {
    saving: { icon: Loader2, text: "Saving...", className: "animate-spin text-gray-400" },
    saved: { icon: Check, text: "Saved", className: "text-green-500" },
    error: { icon: AlertCircle, text: "Error saving", className: "text-red-500" },
  }

  const { icon: Icon, text, className } = config[status] || config.saved

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-full px-4 py-2 border flex items-center gap-2 z-50">
      <Icon className={`w-4 h-4 ${className}`} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  )
}

// Helper functions
const dateToLocalString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Block date modal - simplified for cakes (no time slots)
function BlockDateModal({ date, isBlocked, onToggle, onClose }) {
  const dateStr = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">{dateStr}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            {isBlocked
              ? "This date is currently blocked. Unblock to accept orders."
              : "Block this date to prevent new orders."
            }
          </p>

          <button
            onClick={() => {
              onToggle()
              onClose()
            }}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              isBlocked
                ? "border-green-500 bg-green-50 hover:bg-green-100"
                : "border-red-200 bg-red-50 hover:bg-red-100"
            }`}
          >
            <div className="font-medium text-gray-900">
              {isBlocked ? "Unblock this date" : "Block this date"}
            </div>
            <div className="text-sm text-gray-500">
              {isBlocked
                ? "Allow orders for this date"
                : "No orders will be accepted for this date"
              }
            </div>
          </button>
        </div>

        <div className="p-4 border-t">
          <Button onClick={onClose} variant="outline" className="w-full rounded-lg">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Order detail modal
function OrderDetailModal({ order, onClose }) {
  if (!order) return null

  const formattedDeliveryDate = order.delivery_date
    ? new Date(order.delivery_date).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : ''

  const formattedPartyDate = order.party_date
    ? new Date(order.party_date).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    : ''

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary-500 text-white p-5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full text-xs font-medium">
              <Check className="w-3 h-3" />
              {order.status || 'Confirmed'}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-xl font-bold mt-3">{order.cake_name || 'Cake Order'}</h2>
          {order.customer_name && (
            <p className="text-primary-100 text-sm mt-1">{order.customer_name}'s Party</p>
          )}
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Delivery/Collection Date */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {order.fulfillment === 'pickup' ? 'Collection by' : 'Deliver by'}
            </p>
            <p className="font-semibold text-gray-900">{formattedDeliveryDate}</p>
            {formattedPartyDate && (
              <p className="text-sm text-gray-500 mt-1">Party: {formattedPartyDate}</p>
            )}
          </div>

          {/* Cake Details */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Order Details</h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {order.size && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Size</p>
                  <p className="font-medium text-gray-900">{order.size}</p>
                </div>
              )}
              {order.flavor && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Flavor</p>
                  <p className="font-medium text-gray-900">{order.flavor}</p>
                </div>
              )}
              {order.servings && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Servings</p>
                  <p className="font-medium text-gray-900">{order.servings}</p>
                </div>
              )}
              {order.tiers && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Tiers</p>
                  <p className="font-medium text-gray-900">{order.tiers}</p>
                </div>
              )}
            </div>

            {order.dietary && order.dietary.length > 0 && order.dietary[0] !== 'Standard' && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Dietary Requirements</p>
                <div className="flex flex-wrap gap-1">
                  {order.dietary.map((d, i) => (
                    <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {order.customMessage && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Message on Cake</p>
                <p className="font-medium text-gray-900 italic">"{order.customMessage}"</p>
              </div>
            )}

            {order.fulfillment && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Fulfillment</p>
                <p className="font-medium text-gray-900 capitalize">{order.fulfillment}</p>
              </div>
            )}
          </div>

          {/* Price and Reference */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            {order.price && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">£{order.price}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Reference</p>
              <p className="text-sm font-mono text-gray-700">{order.id?.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <Button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}


// Calendar skeleton
const CalendarSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-7 gap-px border-b border-gray-100 mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="h-24 sm:h-28 rounded-2xl border-2 border-gray-100 bg-gray-50 p-3"
          >
            <div className="h-5 w-6 bg-gray-200 rounded mb-2" />
          </div>
        ))}
      </div>
    </div>
  )
}

const CakeAvailabilityContent = ({
  supplier,
  supplierData,
  setSupplierData,
  loading,
  currentBusiness,
  primaryBusiness,
  businesses,
}) => {
  const currentSupplier = primaryBusiness?.data || supplierData
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [blockedDates, setBlockedDates] = useState([])
  const [minimumNotice, setMinimumNotice] = useState(7)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [saveStatus, setSaveStatus] = useState("idle")
  const [orders, setOrders] = useState([])
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [monthPickerMonth, setMonthPickerMonth] = useState(currentMonth.getMonth())
  const [monthPickerYear, setMonthPickerYear] = useState(currentMonth.getFullYear())
  const monthPickerRef = useRef(null)
  const saveTimeoutRef = useRef(null)
  const lastSavedDataRef = useRef(null)

  // Load initial data
  useEffect(() => {
    if (currentSupplier) {
      setBlockedDates(currentSupplier.blockedDates || currentSupplier.unavailableDates?.map(d => d.date || d) || [])
    }
    // Load lead time from serviceDetails (where settings page saves it)
    if (primaryBusiness) {
      const serviceDetails = primaryBusiness.serviceDetails || primaryBusiness.data?.serviceDetails || {}
      const leadTime = serviceDetails.leadTime?.minimum || serviceDetails.fulfilment?.leadTime?.minimum || currentSupplier?.advanceBookingDays || 7
      setMinimumNotice(leadTime)
    }
  }, [currentSupplier, primaryBusiness])

  // Reset month picker view when opening
  useEffect(() => {
    if (showMonthPicker) {
      setMonthPickerMonth(currentMonth.getMonth())
      setMonthPickerYear(currentMonth.getFullYear())
    }
  }, [showMonthPicker, currentMonth])

  // Close month picker on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
        setShowMonthPicker(false)
      }
    }
    if (showMonthPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMonthPicker])

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      console.log('🍰 CakeAvailability - Debug info:', {
        businessesCount: businesses?.length,
        businessIds: businesses?.map(b => b.id),
        businessNames: businesses?.map(b => b.name || b.businessName || b.data?.name),
        primaryBusinessId: primaryBusiness?.id,
        supplierId: supplier?.id,
        currentBusinessId: currentBusiness?.id,
        lookingForEnquirySupplier: 'aff33a36-9c02-4341-b091-76eca74a99e9',
        isEnquirySupplierInBusinesses: businesses?.some(b => b.id === 'aff33a36-9c02-4341-b091-76eca74a99e9')
      })

      // Get all supplier IDs from businesses array (each cake product is its own supplier record)
      const supplierIds = businesses?.map(b => b.id).filter(Boolean) || []

      // Fallback to single ID if businesses not available
      if (supplierIds.length === 0) {
        const singleId = primaryBusiness?.id || supplier?.id || currentBusiness?.id
        if (singleId) supplierIds.push(singleId)
      }

      if (supplierIds.length === 0) {
        console.log('🍰 CakeAvailability - No supplier IDs found, skipping fetch')
        return
      }

      console.log('🍰 CakeAvailability fetching orders for supplier IDs:', supplierIds)

      try {
        const { data, error } = await supabase
          .from('enquiries')
          .select(`
            id,
            party_id,
            supplier_id,
            status,
            payment_status,
            addon_details,
            parties (
              id,
              child_name,
              party_date
            ),
            supplier:suppliers (
              id,
              business_name
            )
          `)
          .in('supplier_id', supplierIds)
          .eq('status', 'accepted')
          .in('payment_status', ['paid', 'fully_paid', 'deposit_paid'])

        if (error) {
          console.error('Error fetching orders:', error)
          return
        }

        console.log('🍰 CakeAvailability found orders:', data?.length || 0, data)

        // Transform to order format
        const transformedOrders = data?.map(enquiry => {
          // Parse addon_details for cake name
          const addonDetails = typeof enquiry?.addon_details === 'string'
            ? JSON.parse(enquiry?.addon_details || '{}')
            : enquiry?.addon_details || {}
          const cakeCustomization = addonDetails?.cakeCustomization || {}

          // Calculate delivery date (Friday before weekend, day before weekday)
          const partyDate = enquiry.parties?.party_date ? new Date(enquiry.parties.party_date) : null
          let deliveryDate = null
          if (partyDate) {
            const dayOfWeek = partyDate.getDay() // 0 = Sunday, 6 = Saturday
            deliveryDate = new Date(partyDate)
            if (dayOfWeek === 0) {
              // Sunday - deliver Friday (2 days before)
              deliveryDate.setDate(partyDate.getDate() - 2)
            } else if (dayOfWeek === 6) {
              // Saturday - deliver Friday (1 day before)
              deliveryDate.setDate(partyDate.getDate() - 1)
            } else {
              // Weekday - deliver day before
              deliveryDate.setDate(partyDate.getDate() - 1)
            }
          }

          // Get cake name from businesses array (more reliable than join)
          const matchingBusiness = businesses?.find(b => b.id === enquiry.supplier_id)
          const cakeName = matchingBusiness?.name ||
                          matchingBusiness?.businessName ||
                          matchingBusiness?.data?.name ||
                          enquiry.supplier?.business_name ||
                          cakeCustomization.productName ||
                          'Cake Order'

          return {
            id: enquiry.id,
            customer_name: enquiry.parties?.child_name,
            delivery_date: deliveryDate ? deliveryDate.toISOString().split('T')[0] : enquiry.parties?.party_date,
            party_date: enquiry.parties?.party_date,
            status: enquiry.status,
            cake_name: cakeName,
            // Cake details from customization
            size: cakeCustomization.size,
            flavor: cakeCustomization.flavorName,
            servings: cakeCustomization.servings,
            dietary: cakeCustomization.dietaryNames || (cakeCustomization.dietaryName ? [cakeCustomization.dietaryName] : []),
            fulfillment: cakeCustomization.fulfillmentMethod,
            tiers: cakeCustomization.tiers,
            customMessage: cakeCustomization.customMessage,
            price: cakeCustomization.totalPrice
          }
        }) || []

        console.log('🍰 CakeAvailability transformed orders:', transformedOrders)

        setOrders(transformedOrders)
      } catch (err) {
        console.error('Failed to fetch orders:', err)
      }
    }

    fetchOrders()
  }, [businesses, primaryBusiness?.id, supplier?.id, currentBusiness?.id])

  // Auto-save
  const saveToDatabase = useCallback(async (data) => {
    const dataString = JSON.stringify(data)
    if (lastSavedDataRef.current === dataString) return

    try {
      setSaveStatus("saving")

      if (!primaryBusiness) throw new Error("No business found")

      const updatedData = {
        ...primaryBusiness.data,
        blockedDates: data.blockedDates,
        unavailableDates: data.blockedDates.map(date => ({ date, timeSlots: ['morning', 'afternoon'] })),
        lastUpdated: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("suppliers")
        .update({ data: updatedData })
        .eq("id", primaryBusiness.id)

      if (error) throw error

      lastSavedDataRef.current = dataString
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (error) {
      console.error("Save error:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }, [primaryBusiness])

  useEffect(() => {
    if (!primaryBusiness) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(() => {
      saveToDatabase({ blockedDates })
    }, 1500)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [blockedDates, saveToDatabase, primaryBusiness])

  // Calendar navigation
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))

  // Check if date is blocked
  const isDateBlocked = (date) => {
    const dateStr = dateToLocalString(date)
    return blockedDates.includes(dateStr)
  }

  // Toggle blocked date
  const toggleBlockedDate = (date) => {
    const dateStr = dateToLocalString(date)
    setBlockedDates(prev =>
      prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr]
    )
  }

  // Handle lead time change - saves to serviceDetails.leadTime (same as settings page)
  const handleLeadTimeChange = async (newLeadTime) => {
    setMinimumNotice(newLeadTime)

    if (!primaryBusiness) return

    try {
      setSaveStatus("saving")

      // serviceDetails is stored inside the data JSONB column
      const currentData = primaryBusiness.data || {}
      const currentServiceDetails = currentData.serviceDetails || primaryBusiness.serviceDetails || {}

      const updatedServiceDetails = {
        ...currentServiceDetails,
        leadTime: {
          ...(currentServiceDetails.leadTime || {}),
          minimum: newLeadTime
        }
      }

      const updatedData = {
        ...currentData,
        serviceDetails: updatedServiceDetails
      }

      const { error } = await supabase
        .from("suppliers")
        .update({ data: updatedData })
        .eq("id", primaryBusiness.id)

      if (error) throw error

      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (error) {
      console.error("Failed to save lead time:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  // Get order for date
  const getOrderForDate = (date) => {
    const dateStr = dateToLocalString(date)
    return orders.find(order => {
      if (!order.delivery_date) return false
      const orderDateStr = order.delivery_date.split('T')[0]
      return orderDateStr === dateStr
    })
  }

  // Check if date is within minimum notice
  const isWithinMinimumNotice = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const noticeDate = new Date(today)
    noticeDate.setDate(noticeDate.getDate() + minimumNotice)
    return date < noticeDate && date >= today
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOffset = firstDay === 0 ? 6 : firstDay - 1
    const days = []

    // Empty cells
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 sm:h-24" />)
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isPast = date < today
      const isToday = date.toDateString() === today.toDateString()
      const isBlocked = isDateBlocked(date)
      const order = getOrderForDate(date)
      const hasOrder = !!order
      const isNoticeDay = isWithinMinimumNotice(date)

      const handleClick = () => {
        if (isPast) return
        if (hasOrder) {
          setSelectedOrder(order)
        } else {
          setSelectedDate(date)
        }
      }

      days.push(
        <button
          key={day}
          onClick={handleClick}
          disabled={isPast || isNoticeDay}
          className={`
            h-24 sm:h-28 rounded-2xl border-2 transition-all relative p-3 flex flex-col overflow-hidden
            ${isPast || isNoticeDay
              ? "bg-gray-50 text-gray-300 cursor-not-allowed border-gray-100"
              : hasOrder
                ? "bg-green-50 border-green-200 cursor-pointer hover:shadow-md"
                : isBlocked
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-pointer hover:border-gray-300"
                  : "bg-white border-gray-200 cursor-pointer hover:border-gray-400 hover:shadow-sm"
            }
            ${isToday ? "ring-2 ring-gray-900 ring-offset-2" : ""}
          `}
        >
          {/* Date number */}
          <span
            className={`text-lg font-semibold ${
              isPast || isNoticeDay ? "text-gray-300"
              : hasOrder ? "text-green-700"
              : isBlocked ? "text-gray-400"
              : "text-gray-900"
            }`}
          >
            {day}
          </span>

          {/* Content area */}
          <div className="flex-1 flex flex-col justify-end mt-1">
            {!isPast && !isNoticeDay && hasOrder && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <p className="text-xs font-medium text-green-700 truncate">
                  Order
                </p>
              </div>
            )}
            {!isPast && !isNoticeDay && !hasOrder && isBlocked && (
              <span className="text-sm text-gray-400 font-medium">Blocked</span>
            )}
          </div>
        </button>
      )
    }

    return days
  }, [currentMonth, blockedDates, orders, minimumNotice])

  // Mobile month view
  const MobileMonthView = ({ year, month }) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const startOffset = firstDay === 0 ? 6 : firstDay - 1
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December']

    const days = []

    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isPast = date < today
      const isToday = date.toDateString() === today.toDateString()
      const isBlocked = isDateBlocked(date)
      const order = getOrderForDate(date)
      const hasOrder = !!order
      const isNoticeDay = isWithinMinimumNotice(date)
      const isDisabled = isPast || isNoticeDay

      const handleClick = () => {
        if (isDisabled) return
        if (hasOrder) {
          setSelectedOrder(order)
        } else {
          setSelectedDate(date)
        }
      }

      days.push(
        <button
          key={day}
          onClick={handleClick}
          disabled={isDisabled}
          className={`
            aspect-square p-1 border-b border-r border-gray-100 flex flex-col items-center justify-center relative
            ${isDisabled ? 'opacity-40' : 'active:bg-gray-100'}
            ${isToday ? 'ring-2 ring-gray-900 ring-inset' : ''}
            ${hasOrder && !isDisabled ? 'bg-green-50' : ''}
            ${isBlocked && !hasOrder && !isDisabled ? 'bg-gray-100' : ''}
          `}
        >
          <span
            className={`text-base ${
              isDisabled ? 'text-gray-300'
              : hasOrder ? 'font-semibold text-green-700'
              : isBlocked ? 'text-gray-400'
              : 'text-gray-900'
            }`}
          >
            {day}
          </span>
          {!isDisabled && hasOrder && (
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          )}
        </button>
      )
    }

    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 px-1">
          {monthNames[month]} {year}
        </h2>
        <div className="grid grid-cols-7 gap-0 bg-white rounded-xl overflow-hidden border border-gray-200">
          {days}
        </div>
      </div>
    )
  }

  // Generate mobile months
  const generateMobileMonths = () => {
    const months = []
    const today = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
      months.push({ year: date.getFullYear(), month: date.getMonth() })
    }
    return months
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const mobileMonths = generateMobileMonths()
  const getNoticeLabel = (days) => {
    if (days === 1) return "24 hours"
    if (days === 2) return "48 hours"
    if (days === 7) return "1 week"
    if (days === 14) return "2 weeks"
    if (days === 21) return "3 weeks"
    if (days === 28) return "4 weeks"
    return `${days} days`
  }

  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="min-h-screen bg-white">
          {/* Fixed Header */}
          <div className="fixed top-0 left-0 right-0 z-20 bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h1 className="text-xl font-bold text-gray-900">Calendar</h1>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-white border-b border-gray-200">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="px-4 pt-4 pb-24 mt-[104px]">
            {mobileMonths.map(({ year, month }) => (
              <MobileMonthView key={`${year}-${month}`} year={year} month={month} />
            ))}

            {/* Legend */}
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-gray-200 bg-white" />
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-50 border border-green-200" />
                  <span className="text-gray-600">Has order</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
                  <span className="text-gray-600">Blocked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative" ref={monthPickerRef}>
              <button
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 -ml-2 transition-colors"
              >
                <h1 className="text-2xl font-semibold text-gray-900">
                  {currentMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </h1>
                <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
              </button>

              {/* Month Picker Dropdown */}
              {showMonthPicker && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 w-[320px]">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => {
                        if (monthPickerMonth === 0) {
                          setMonthPickerMonth(11)
                          setMonthPickerYear(monthPickerYear - 1)
                        } else {
                          setMonthPickerMonth(monthPickerMonth - 1)
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="font-semibold text-gray-900">
                      {new Date(monthPickerYear, monthPickerMonth).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                    </span>
                    <button
                      onClick={() => {
                        if (monthPickerMonth === 11) {
                          setMonthPickerMonth(0)
                          setMonthPickerYear(monthPickerYear + 1)
                        } else {
                          setMonthPickerMonth(monthPickerMonth + 1)
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const daysInMonth = new Date(monthPickerYear, monthPickerMonth + 1, 0).getDate()
                      const firstDay = new Date(monthPickerYear, monthPickerMonth, 1).getDay()
                      const startOffset = firstDay === 0 ? 6 : firstDay - 1
                      const today = new Date()
                      const days = []

                      for (let i = 0; i < startOffset; i++) {
                        days.push(<div key={`empty-${i}`} className="h-9" />)
                      }

                      for (let day = 1; day <= daysInMonth; day++) {
                        const isToday = day === today.getDate() &&
                                        monthPickerMonth === today.getMonth() &&
                                        monthPickerYear === today.getFullYear()

                        days.push(
                          <button
                            key={day}
                            onClick={() => {
                              setCurrentMonth(new Date(monthPickerYear, monthPickerMonth, day))
                              setShowMonthPicker(false)
                            }}
                            className={`
                              h-9 w-full rounded-full text-sm transition-all
                              hover:bg-gray-100
                              ${isToday ? 'font-bold text-gray-900' : 'text-gray-700'}
                            `}
                          >
                            {day}
                          </button>
                        )
                      }

                      return days
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Calendar Grid */}
            <div className="flex-1">
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-px border-b border-gray-100 mb-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-6 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border border-gray-200 bg-white" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-50 border border-green-200" />
                  <span>Has order</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
                  <span>Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded ring-2 ring-gray-900 ring-offset-1 bg-white" />
                  <span>Today</span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-80 flex-shrink-0 space-y-3">
              {/* Minimum notice selector */}
              <div className="p-4 border border-gray-200 rounded-xl bg-white">
                <p className="text-xs text-gray-500 mb-1">Minimum notice</p>
                <select
                  value={minimumNotice}
                  onChange={(e) => handleLeadTimeChange(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-400 bg-white cursor-pointer"
                >
                  <option value={1}>24 hours</option>
                  <option value={2}>48 hours</option>
                  <option value={3}>3 days</option>
                  <option value={5}>5 days</option>
                  <option value={7}>1 week</option>
                  <option value={14}>2 weeks</option>
                  <option value={21}>3 weeks</option>
                  <option value={28}>4 weeks</option>
                </select>
              </div>

              {/* Quick stats */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white">
                <p className="text-xs text-gray-500 mb-0.5">This month</p>
                <p className="text-sm font-medium text-gray-900 mb-3">
                  {orders.filter(o => {
                    const orderDate = o.delivery_date ? new Date(o.delivery_date) : null
                    return orderDate &&
                           orderDate.getMonth() === currentMonth.getMonth() &&
                           orderDate.getFullYear() === currentMonth.getFullYear()
                  }).length} orders, {blockedDates.filter(d => {
                    const date = new Date(d)
                    return date.getMonth() === currentMonth.getMonth() &&
                           date.getFullYear() === currentMonth.getFullYear()
                  }).length} blocked
                </p>
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Blocked days</span>
                    <span className="font-medium text-gray-900">
                      {blockedDates.filter(d => {
                        const date = new Date(d)
                        return date.getMonth() === currentMonth.getMonth() &&
                               date.getFullYear() === currentMonth.getFullYear()
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Confirmed orders</span>
                    <span className="font-medium text-gray-900">
                      {orders.filter(o => {
                        const orderDate = o.delivery_date ? new Date(o.delivery_date) : null
                        return orderDate &&
                               orderDate.getMonth() === currentMonth.getMonth() &&
                               orderDate.getFullYear() === currentMonth.getFullYear()
                      }).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block date modal */}
      {selectedDate && (
        <BlockDateModal
          date={selectedDate}
          isBlocked={isDateBlocked(selectedDate)}
          onToggle={() => toggleBlockedDate(selectedDate)}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}


      {/* Auto-save indicator */}
      <AutoSaveIndicator status={saveStatus} />
    </>
  )
}

export default CakeAvailabilityContent

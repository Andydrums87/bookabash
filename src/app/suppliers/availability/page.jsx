// "use client"

// import { useState, useEffect, useMemo } from "react"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { CalendarDays, Trash2, Check, Clock, Save, Settings, Calendar as CalendarIcon, Info, Building2, Users, Sun, Moon } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Calendar } from "@/components/ui/calendar"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { startOfDay } from "date-fns"
// import { useSupplier } from "@/hooks/useSupplier"
// import { useBusiness } from "@/contexts/BusinessContext"
// import { useSupplierDashboard } from "@/utils/mockBackend"
// import { GlobalSaveButton } from "@/components/GlobalSaveButton"

// // Time slot definitions - FIXED to match exactly
// const TIME_SLOTS = {
//   morning: {
//     id: 'morning',
//     label: 'Morning',
//     defaultStart: '09:00',
//     defaultEnd: '13:00',
//     displayTime: '9am - 1pm',
//     icon: Sun
//   },
//   afternoon: {
//     id: 'afternoon', 
//     label: 'Afternoon',
//     defaultStart: '13:00',
//     defaultEnd: '17:00',
//     displayTime: '1pm - 5pm',
//     icon: Moon
//   },
//   allday: {
//     id: 'allday',
//     label: 'All Day',
//     defaultStart: '09:00',
//     defaultEnd: '17:00',
//     displayTime: 'Entire day',
//     icon: CalendarIcon
//   }
// }

// const formatDate = (date) => {
//   return date.toLocaleDateString("en-US", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   })
// }

// const isDateEqual = (date1, date2) => {
//   return date1.toDateString() === date2.toDateString()
// }


// const addDays = (date, days) => {
//   const newDate = new Date(date)
//   newDate.setDate(newDate.getDate() + days)
//   return newDate
// }

// const isBefore = (date1, date2) => {
//   return date1.getTime() < date2.getTime()
// }

// // FIXED: Proper date to string conversion that preserves local date
// const dateToLocalString = (date) => {
//   const year = date.getFullYear()
//   const month = String(date.getMonth() + 1).padStart(2, '0')
//   const day = String(date.getDate()).padStart(2, '0')
//   return `${year}-${month}-${day}`
// }

// // FIXED: Proper string to date conversion that preserves local date
// const stringToLocalDate = (dateString) => {
//   const [year, month, day] = dateString.split('-').map(Number)
//   return new Date(year, month - 1, day)
// }

// // Migration utility
// const migrateWorkingHours = (legacyHours) => {
//   if (!legacyHours) return getDefaultWorkingHours()
  
//   if (legacyHours.Monday?.timeSlots) {
//     return legacyHours
//   }
  
//   const migrated = {}
//   Object.entries(legacyHours).forEach(([day, hours]) => {
//     if (hours && typeof hours === 'object' && 'active' in hours) {
//       migrated[day] = {
//         active: hours.active,
//         timeSlots: {
//           morning: { 
//             available: hours.active, 
//             startTime: hours.start || "09:00", 
//             endTime: "13:00" 
//           },
//           afternoon: { 
//             available: hours.active, 
//             startTime: "13:00", 
//             endTime: hours.end || "17:00" 
//           }
//         }
//       }
//     } else {
//       migrated[day] = getDefaultDaySchedule()
//     }
//   })
  
//   return migrated
// }

// const getDefaultDaySchedule = (active = true) => ({
//   active,
//   timeSlots: {
//     morning: { 
//       available: active, 
//       startTime: "09:00", 
//       endTime: "13:00" 
//     },
//     afternoon: { 
//       available: active, 
//       startTime: "13:00", 
//       endTime: "17:00" 
//     }
//   }
// })

// const getDefaultWorkingHours = () => ({
//   Monday: getDefaultDaySchedule(true),
//   Tuesday: getDefaultDaySchedule(true),
//   Wednesday: getDefaultDaySchedule(true),
//   Thursday: getDefaultDaySchedule(true),
//   Friday: getDefaultDaySchedule(true),
//   Saturday: getDefaultDaySchedule(true),
//   Sunday: getDefaultDaySchedule(false),
// })

// const migrateDateArray = (dateArray) => {
//   if (!Array.isArray(dateArray)) return []
  
//   return dateArray.map(dateItem => {
//     if (typeof dateItem === 'string') {
//       return {
//         date: dateItem.split('T')[0],
//         timeSlots: ['morning', 'afternoon']
//       }
//     } else if (dateItem && typeof dateItem === 'object' && dateItem.date) {
//       return dateItem
//     } else {
//       const date = new Date(dateItem)
//       return {
//         date: date.toISOString().split('T')[0],
//         timeSlots: ['morning', 'afternoon']
//       }
//     }
//   })
// }

// const TimeSlotCalendar = ({ currentMonth, setCurrentMonth, unavailableDates, setUnavailableDates }) => {
//   const [selectedDate, setSelectedDate] = useState(null)
//   const [showTimeSlotPicker, setShowTimeSlotPicker] = useState(false)
  
//   const nextMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
//   }
  
//   const prevMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
//   }
  
//   const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
//   const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  
//   const getBlockedSlots = (date) => {
//     // FIXED: Use proper local date string conversion
//     const dateStr = dateToLocalString(date)
//     const blockedDate = unavailableDates.find(item => item.date === dateStr)
//     console.log(`🔍 Getting blocked slots for ${dateStr} (${date.toDateString()}):`, blockedDate?.timeSlots || [])
//     return blockedDate?.timeSlots || []
//   }
//   const handleDateClick = (date) => {
//     const today = new Date()
//     today.setHours(0, 0, 0, 0)
    
//     if (date < today) return
    
//     console.log('📅 Date clicked:', date.toDateString(), 'Local string:', dateToLocalString(date))
//     setSelectedDate(date)
//     setShowTimeSlotPicker(true)
//   }
  
  
//   const handleTimeSlotToggle = (timeSlot) => {
//     if (!selectedDate) return
    
//   // FIXED: Use proper local date string conversion
//   const dateStr = dateToLocalString(selectedDate)
//   console.log(`🔄 Toggling time slot ${timeSlot} for date ${dateStr} (${selectedDate.toDateString()})`)
    
//     setUnavailableDates(prev => {
//       const existing = prev.find(item => item.date === dateStr)
//       console.log('🔍 Existing blocked data for this date:', existing)
      
//       if (existing) {
//         if (timeSlot === 'allday') {
//           // If selecting "All Day", replace with both morning and afternoon
//           if (existing.timeSlots.includes('morning') && existing.timeSlots.includes('afternoon')) {
//             // All day is already blocked, so unblock everything
//             console.log('🔄 Removing all blocks for this date')
//             return prev.filter(item => item.date !== dateStr)
//           } else {
//             // Set to all day (both morning and afternoon)
//             console.log('🔄 Setting to all day block')
//             return prev.map(item =>
//               item.date === dateStr
//                 ? { ...item, timeSlots: ['morning', 'afternoon'] }
//                 : item
//             )
//           }
//         } else {
//           // Handle individual time slots
//           if (existing.timeSlots.includes(timeSlot)) {
//             // Remove time slot
//             console.log(`🔄 Removing ${timeSlot} from blocked slots`)
//             const updatedSlots = existing.timeSlots.filter(slot => slot !== timeSlot)
//             if (updatedSlots.length === 0) {
//               // Remove entire date if no slots left
//               return prev.filter(item => item.date !== dateStr)
//             } else {
//               // Update with remaining slots
//               return prev.map(item => 
//                 item.date === dateStr 
//                   ? { ...item, timeSlots: updatedSlots }
//                   : item
//               )
//             }
//           } else {
//             // Add time slot
//             console.log(`🔄 Adding ${timeSlot} to blocked slots`)
//             let newSlots = [...existing.timeSlots, timeSlot]
            
//             // Remove duplicates
//             newSlots = [...new Set(newSlots)]
            
//             return prev.map(item =>
//               item.date === dateStr
//                 ? { ...item, timeSlots: newSlots }
//                 : item
//             )
//           }
//         }
//       } else {
//         // Add new date with time slot
//         console.log(`🔄 Creating new blocked date with ${timeSlot}`)
//         if (timeSlot === 'allday') {
//           return [...prev, { date: dateStr, timeSlots: ['morning', 'afternoon'] }]
//         } else {
//           return [...prev, { date: dateStr, timeSlots: [timeSlot] }]
//         }
//       }
//     })
//   }
  
//   const calendarDays = useMemo(() => {
//     const year = currentMonth.getFullYear()
//     const month = currentMonth.getMonth()
//     const firstDayIndex = getFirstDayOfMonth(currentMonth)
//     const daysInMonthCount = getDaysInMonth(currentMonth)
//     const days = []
//     const today = new Date()
//     today.setHours(0, 0, 0, 0)

//     for (let i = 0; i < firstDayIndex; i++) {
//       days.push(<div key={`empty-${i}`} className="h-12 w-full"></div>)
//     }

//     for (let day = 1; day <= daysInMonthCount; day++) {
//       const date = new Date(year, month, day)
//       const blockedSlots = getBlockedSlots(date)
//       const isPast = date < today
//       const isToday = date.toDateString() === today.toDateString()
      
//       let dayStyle = 'h-12 w-full rounded-lg text-sm font-medium transition-all duration-200 border relative flex items-center justify-center '
      
//       if (isPast) {
//         dayStyle += 'text-gray-300 cursor-not-allowed bg-gray-50 border-gray-200'
//       } else if (blockedSlots.length === 2) {
//         // All day blocked (both morning and afternoon)
//         dayStyle += 'bg-red-100 text-red-800 border-red-300 line-through cursor-pointer hover:bg-red-200'
//       } else if (blockedSlots.length === 1) {
//         // Partially blocked (one time slot)
//         dayStyle += 'bg-yellow-100 text-yellow-800 border-yellow-300 cursor-pointer hover:bg-yellow-200'
//       } else {
//         // Available
//         dayStyle += 'bg-white text-gray-700 border-gray-200 cursor-pointer hover:bg-gray-50'
//       }
      
//       if (isToday) {
//         dayStyle += ' ring-2 ring-primary-500'
//       }

//       days.push(
//         <button
//           key={day}
//           onClick={() => !isPast && handleDateClick(date)}
//           className={dayStyle}
//           disabled={isPast}
//           title={
//             isPast 
//               ? 'Past date'
//               : blockedSlots.length === 2
//               ? 'All day blocked'
//               : blockedSlots.length === 1
//               ? `${TIME_SLOTS[blockedSlots[0]]?.label || blockedSlots[0]} blocked`
//               : 'Available'
//           }
//         >
//           {day}
//           {!isPast && blockedSlots.length > 0 && (
//             <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
//               {blockedSlots.map(slot => {
//                 const SlotIcon = TIME_SLOTS[slot]?.icon || Clock
//                 return (
//                   <SlotIcon key={slot} className="w-2 h-2 text-current opacity-70" />
//                 )
//               })}
//             </div>
//           )}
          
//           {/* Show AM/PM text for partially blocked days */}
//           {!isPast && blockedSlots.length === 1 && (
//             <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-bold">
//               {blockedSlots[0] === 'morning' ? 'AM' : 'PM'}
//             </div>
//           )}
//         </button>
//       )
//     }
//     return days
//   }, [currentMonth, unavailableDates])

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-gray-900">
//           {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
//         </h3>
//         <div className="flex gap-2">
//           <Button variant="outline" size="sm" onClick={prevMonth} className="h-9 w-9 p-0">←</Button>
//           <Button variant="outline" size="sm" onClick={nextMonth} className="h-9 w-9 p-0">→</Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-7 gap-2">
//         {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//           <div key={day} className="text-center font-semibold text-gray-600 py-3 text-sm">
//             {day}
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-7 gap-2 mb-4">
//         {calendarDays}
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
//         {[
//           { label: "Available", color: "bg-white border-gray-200" },
//           { label: "Partially Blocked", color: "bg-yellow-100 border-yellow-300" },
//           { label: "All Day Blocked", color: "bg-red-100 border-red-300" },
//           { label: "Past Date", color: "bg-gray-50 border-gray-200 text-gray-300" },
//         ].map((item) => (
//           <div key={item.label} className="flex items-center gap-2">
//             <div className={`w-4 h-4 rounded border ${item.color}`}></div>
//             <span className="text-gray-600">{item.label}</span>
//           </div>
//         ))}
//       </div>

//       {showTimeSlotPicker && selectedDate && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
//             <h3 className="text-lg font-semibold mb-4">Select Time Slots to Block</h3>
//             <p className="text-sm text-gray-600 mb-4">
//               {selectedDate.toLocaleDateString('en-US', { 
//                 weekday: 'long', 
//                 year: 'numeric', 
//                 month: 'long', 
//                 day: 'numeric' 
//               })}
//             </p>
            
//             <div className="space-y-3 mb-6">
//               {/* All Day option first */}
//               <div
//                 onClick={() => handleTimeSlotToggle('allday')}
//                 className={`p-3 border rounded-lg cursor-pointer transition-colors ${
//                   (getBlockedSlots(selectedDate).includes('morning') && getBlockedSlots(selectedDate).includes('afternoon'))
//                     ? 'border-red-300 bg-red-50' 
//                     : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   <Checkbox
//                     checked={getBlockedSlots(selectedDate).includes('morning') && getBlockedSlots(selectedDate).includes('afternoon')}
//                     readOnly
//                     className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
//                   />
//                   <CalendarIcon className={`w-5 h-5 ${
//                     (getBlockedSlots(selectedDate).includes('morning') && getBlockedSlots(selectedDate).includes('afternoon'))
//                       ? 'text-red-600' 
//                       : 'text-purple-500'
//                   }`} />
//                   <div>
//                     <div className="font-medium">All Day</div>
//                     <div className="text-sm text-gray-500">Block entire day (9am - 5pm)</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Divider */}
//               <div className="flex items-center gap-3">
//                 <div className="flex-1 h-px bg-gray-200"></div>
//                 <span className="text-xs text-gray-500 uppercase font-medium">Or choose specific times</span>
//                 <div className="flex-1 h-px bg-gray-200"></div>
//               </div>

//               {/* Individual time slots - FIXED ORDER AND MAPPING */}
//               {['morning', 'afternoon'].map((slotId) => {
//                 const slotConfig = TIME_SLOTS[slotId]
//                 const SlotIcon = slotConfig.icon
//                 const isBlocked = getBlockedSlots(selectedDate).includes(slotId)
                
//                 console.log(`🔍 Rendering time slot picker for ${slotId}:`, { isBlocked, slotConfig })
                
//                 return (
//                   <div
//                     key={slotId}
//                     onClick={() => {
//                       console.log(`🔄 User clicked ${slotId} - currently blocked: ${isBlocked}`)
//                       handleTimeSlotToggle(slotId)
//                     }}
//                     className={`p-3 border rounded-lg cursor-pointer transition-colors ${
//                       isBlocked 
//                         ? 'border-red-300 bg-red-50' 
//                         : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <Checkbox
//                         checked={isBlocked}
//                         readOnly
//                         className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
//                       />
//                       <SlotIcon className={`w-5 h-5 ${isBlocked ? 'text-red-600' : 'text-amber-500'}`} />
//                       <div>
//                         <div className="font-medium">{slotConfig.label}</div>
//                         <div className="text-sm text-gray-500">{slotConfig.displayTime}</div>
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
            
//             <Button
//               onClick={() => {
//                 setShowTimeSlotPicker(false)
//                 setSelectedDate(null)
//               }}
//               className="w-full"
//             >
//               Done
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// // Main Component
// const AvailabilityContent = () => {
//   const { supplier, supplierData, setSupplierData, loading, error, refresh } = useSupplier()
//   const { currentBusiness, getPrimaryBusiness, businesses } = useBusiness()
//   const { saving, updateProfile } = useSupplierDashboard()
  
//   const primaryBusiness = getPrimaryBusiness()
//   const isPrimaryBusiness = currentBusiness?.isPrimary || false
//   const availabilitySource = primaryBusiness || currentBusiness
//   const currentSupplier = availabilitySource?.data || supplierData

//   const [workingHours, setWorkingHours] = useState(() => getDefaultWorkingHours())
//   const [unavailableDates, setUnavailableDates] = useState([])
//   const [busyDates, setBusyDates] = useState([])
//   const [currentMonth, setCurrentMonth] = useState(new Date())
//   const [availabilityNotes, setAvailabilityNotes] = useState("")
//   const [advanceBookingDays, setAdvanceBookingDays] = useState(7)
//   const [maxBookingDays, setMaxBookingDays] = useState(365)
//   const [saveSuccess, setSaveSuccess] = useState(false)

//   useEffect(() => {
//     const loadAvailabilityData = () => {
//       if (currentSupplier) {
//         console.log("📅 Loading availability data with inheritance support")
//         console.log("📅 Current supplier:", currentSupplier.businessName)
//         console.log("📅 Is primary:", isPrimaryBusiness)
//         console.log("📅 Primary business available:", !!primaryBusiness)
        
//         let effectiveSupplier = currentSupplier
        
//         // CRITICAL FIX: Themed businesses inherit from primary
//         if (!isPrimaryBusiness && primaryBusiness) {
//           console.log("🔄 INHERITANCE: Using primary business availability for themed business")
//           console.log("🔄 INHERITANCE: Primary business:", primaryBusiness.name)
          
//           effectiveSupplier = {
//             ...currentSupplier,
//             // Inherit availability settings from primary business
//             workingHours: primaryBusiness.data?.workingHours || {},
//             unavailableDates: primaryBusiness.data?.unavailableDates || [],
//             busyDates: primaryBusiness.data?.busyDates || [],
//             advanceBookingDays: primaryBusiness.data?.advanceBookingDays || 7,
//             maxBookingDays: primaryBusiness.data?.maxBookingDays || 365,
//             availabilityNotes: primaryBusiness.data?.availabilityNotes || "",
            
//             // Mark as inherited for debugging
//             _inheritedFromPrimary: true,
//             _primaryBusinessName: primaryBusiness.name
//           }
          
//           console.log("✅ INHERITANCE: Successfully inherited availability")
//           console.log("✅ INHERITANCE: Working hours available:", !!effectiveSupplier.workingHours)
//           console.log("✅ INHERITANCE: Unavailable dates count:", effectiveSupplier.unavailableDates.length)
//         }
        
//         // Handle completely missing working hours (default to available)
//         if (!effectiveSupplier.workingHours || Object.keys(effectiveSupplier.workingHours).length === 0) {
//           console.log("⚠️ No working hours found - applying default availability")
//           effectiveSupplier.workingHours = getDefaultWorkingHours()
//         }
        
//         // Load working hours
//         if (effectiveSupplier.workingHours) {
//           const migratedHours = migrateWorkingHours(effectiveSupplier.workingHours)
//           setWorkingHours(migratedHours)
//           console.log("✅ Working hours loaded successfully")
//         }
        
//         // Load unavailable dates
//         if (effectiveSupplier.unavailableDates) {
//           const migratedUnavailable = migrateDateArray(effectiveSupplier.unavailableDates)
//           console.log('📅 Loaded unavailable dates:', migratedUnavailable.length)
//           setUnavailableDates(migratedUnavailable)
//         }
        
//         // Load busy dates
//         if (effectiveSupplier.busyDates) {
//           const migratedBusy = migrateDateArray(effectiveSupplier.busyDates)
//           console.log('📅 Loaded busy dates:', migratedBusy.length)
//           setBusyDates(migratedBusy)
//         }
        
//         // Load other settings
//         if (effectiveSupplier.availabilityNotes) {
//           setAvailabilityNotes(effectiveSupplier.availabilityNotes)
//         }
//         if (effectiveSupplier.advanceBookingDays !== undefined) {
//           setAdvanceBookingDays(effectiveSupplier.advanceBookingDays)
//         }
//         if (effectiveSupplier.maxBookingDays !== undefined) {
//           setMaxBookingDays(effectiveSupplier.maxBookingDays)
//         }
        
//         console.log("✅ Availability data loaded successfully")
//       }
//     }
    
//     loadAvailabilityData()
//   }, [currentSupplier, isPrimaryBusiness, primaryBusiness])

//   const handleSave = async () => {
//     try {
//       // CRITICAL: Always save availability to primary business
//       const targetBusiness = primaryBusiness
      
//       if (!targetBusiness) {
//         throw new Error("No primary business found. Cannot save shared availability.")
//       }
  
//       console.log("💾 INHERITANCE: Saving availability to primary business:", targetBusiness.name)
//       console.log("💾 INHERITANCE: This will affect all themed businesses under this primary")
  
//       const availabilityData = {
//         workingHours: workingHours,
//         unavailableDates: unavailableDates,
//         busyDates: busyDates,
//         availabilityNotes: availabilityNotes,
//         advanceBookingDays: Number(advanceBookingDays),
//         maxBookingDays: Number(maxBookingDays),
//         availabilityVersion: '2.0',
//         lastUpdated: new Date().toISOString()
//       }
  
//       const updatedPrimaryData = {
//         ...targetBusiness.data,
//         ...availabilityData,
//         updatedAt: new Date().toISOString()
//       }
      
//       const result = await updateProfile(updatedPrimaryData, null, targetBusiness.id)
      
//       if (result.success) {
//         console.log("✅ INHERITANCE: Availability saved to primary business")
//         console.log("✅ INHERITANCE: All themed businesses will inherit these settings")
        
//         // Update the primary business data
//         setSupplierData(updatedPrimaryData)
//         setSaveSuccess(true)
//         setTimeout(() => setSaveSuccess(false), 3000)
//         refresh()
//       } else {
//         throw new Error(result.error)
//       }
//     } catch (error) {
//       console.error("❌ Failed to save availability:", error)
//       alert("Failed to save availability: " + error.message)
//     }
//   }

//   const handleWorkingHoursChange = (day, field, value) => {
//     setWorkingHours((prev) => {
//       const updated = { ...prev }
      
//       if (field === 'active') {
//         updated[day] = {
//           ...updated[day],
//           active: value,
//           timeSlots: {
//             ...updated[day].timeSlots,
//             morning: { ...updated[day].timeSlots.morning, available: value },
//             afternoon: { ...updated[day].timeSlots.afternoon, available: value }
//           }
//         }
//       } else {
//         updated[day] = {
//           ...updated[day],
//           [field]: value
//         }
//       }
      
//       return updated
//     })
//   }

//   const handleTimeSlotChange = (day, timeSlot, field, value) => {
//     console.log(`🔄 Changing ${day} ${timeSlot} ${field} to ${value}`)
//     setWorkingHours((prev) => {
//       const updated = { ...prev }
      
//       updated[day] = {
//         ...updated[day],
//         timeSlots: {
//           ...updated[day].timeSlots,
//           [timeSlot]: {
//             ...updated[day].timeSlots[timeSlot],
//             [field]: value
//           }
//         }
//       }
      
//       const hasActiveSlots = Object.values(updated[day].timeSlots).some(slot => slot.available)
//       updated[day].active = hasActiveSlots
      
//       return updated
//     })
//   }

//   const markUnavailableRange = (days, timeSlots = ['morning', 'afternoon']) => {
//     console.log(`🔄 Marking ${days} days as unavailable for slots:`, timeSlots)
//     const dates = []
//     for (let i = 0; i < days; i++) {
//       const date = addDays(startOfDay(new Date()), i)
//       dates.push({
//         date: date.toISOString().split('T')[0],
//         timeSlots: timeSlots
//       })
//     }
    
//     setUnavailableDates((prev) => {
//       const combined = [...prev, ...dates]
//       const merged = combined.reduce((acc, current) => {
//         const existing = acc.find(item => item.date === current.date)
//         if (existing) {
//           const combinedSlots = [...new Set([...existing.timeSlots, ...current.timeSlots])]
//           existing.timeSlots = combinedSlots
//         } else {
//           acc.push(current)
//         }
//         return acc
//       }, [])
//       console.log('🔄 Updated unavailable dates:', merged)
//       return merged
//     })
//   }

//   const clearAllDates = () => {
//     console.log('🔄 Clearing all unavailable dates')
//     setUnavailableDates([])
//   }

//   const applyTemplate = (template) => {
//     console.log(`🔄 Applying template: ${template}`)
//     switch (template) {
//       case "business":
//         setWorkingHours({
//           Monday: getDefaultDaySchedule(true),
//           Tuesday: getDefaultDaySchedule(true), 
//           Wednesday: getDefaultDaySchedule(true),
//           Thursday: getDefaultDaySchedule(true),
//           Friday: getDefaultDaySchedule(true),
//           Saturday: getDefaultDaySchedule(false),
//           Sunday: getDefaultDaySchedule(false),
//         })
//         break
//       case "weekend":
//         setWorkingHours({
//           Monday: getDefaultDaySchedule(false),
//           Tuesday: getDefaultDaySchedule(false),
//           Wednesday: getDefaultDaySchedule(false),
//           Thursday: getDefaultDaySchedule(false),
//           Friday: getDefaultDaySchedule(false),
//           Saturday: {
//             active: true,
//             timeSlots: {
//               morning: { available: true, startTime: "10:00", endTime: "13:00" },
//               afternoon: { available: true, startTime: "13:00", endTime: "18:00" }
//             }
//           },
//           Sunday: {
//             active: true,
//             timeSlots: {
//               morning: { available: true, startTime: "10:00", endTime: "13:00" },
//               afternoon: { available: true, startTime: "13:00", endTime: "18:00" }
//             }
//           },
//         })
//         break
//       case "flexible":
//         setWorkingHours({
//           Monday: {
//             active: true,
//             timeSlots: {
//               morning: { available: true, startTime: "08:00", endTime: "13:00" },
//               afternoon: { available: true, startTime: "13:00", endTime: "20:00" }
//             }
//           },
//           Tuesday: {
//             active: true,
//             timeSlots: {
//               morning: { available: true, startTime: "08:00", endTime: "13:00" },
//               afternoon: { available: true, startTime: "13:00", endTime: "20:00" }
//             }
//           },
//           Wednesday: {
//             active: true,
//             timeSlots: {
//               morning: { available: true, startTime: "08:00", endTime: "13:00" },
//               afternoon: { available: true, startTime: "13:00", endTime: "20:00" }
//             }
//           },
//           Thursday: {
//             active: true,
//             timeSlots: {
//               morning: { available: true, startTime: "08:00", endTime: "13:00" },
//               afternoon: { available: true, startTime: "13:00", endTime: "20:00" }
//             }
//           },
//           Friday: {
//             active: true,
//             timeSlots: {
//               morning: { available: true, startTime: "08:00", endTime: "13:00" },
//               afternoon: { available: true, startTime: "13:00", endTime: "20:00" }
//             }
//           },
//           Saturday: {
//             active: true,
//             timeSlots: {
//               morning: { available: true, startTime: "08:00", endTime: "13:00" },
//               afternoon: { available: true, startTime: "13:00", endTime: "20:00" }
//             }
//           },
//           Sunday: {
//             active: true,
//             timeSlots: {
//               morning: { available: true, startTime: "10:00", endTime: "13:00" },
//               afternoon: { available: true, startTime: "13:00", endTime: "18:00" }
//             }
//           },
//         })
//         break
//       default:
//         break
//     }
//   }

//   const removeTimeSlotFromDate = (dateIndex, timeSlot) => {
//     console.log(`🔄 Removing ${timeSlot} from date at index ${dateIndex}`)
//     setUnavailableDates(prev => {
//       const updated = [...prev]
//       const item = updated[dateIndex]
      
//       if (item.timeSlots.length === 1) {
//         updated.splice(dateIndex, 1)
//       } else {
//         item.timeSlots = item.timeSlots.filter(slot => slot !== timeSlot)
//       }
      
//       console.log('🔄 Updated unavailable dates after removal:', updated)
//       return updated
//     })
//   }

//   return (
//     <div className="min-h-screen bg-primary-50">
//       <div className="max-w-7xl mx-auto">
//         {saveSuccess && (
//           <div className="p-4">
//             <Alert className="border-emerald-200 bg-emerald-50 shadow-lg animate-in slide-in-from-top-2 duration-300">
//               <Check className="h-5 w-5 text-emerald-600" />
//               <AlertDescription className="text-emerald-800 font-medium">
//                 Time slot availability settings saved successfully across all businesses!
//               </AlertDescription>
//             </Alert>
//           </div>
//         )}

//         <div className="p-4 sm:p-6">
//           <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
//             <div className="space-y-1">
//               <h2 className="md:text-2xl text-5xl lg:text-4xl font-black text-gray-900 leading-tight">
//                 Time Slot Availability Settings
//               </h2>
//               <p className="text-sm sm:text-base text-gray-600">
//                 Set morning and afternoon availability for each day • Applies to all {businesses?.length || 0} businesses
//               </p>
//               <div className="flex items-center gap-2 mt-2">
//                 <Badge variant="secondary" className="bg-blue-100 text-blue-800">
//                   <Clock className="w-3 h-3 mr-1" />
//                   Time Slot Management v2.0
//                 </Badge>
//               </div>
//             </div>
//             <div className="absolute right-10 top-1">
//               <GlobalSaveButton 
//                 position="responsive"
//                 onSave={handleSave}
//                 isLoading={saving}
//               />
//             </div>
//           </div>
//         </div>

//         <Tabs defaultValue="hours" className="w-full">
//           <div className="px-4 sm:px-6 pb-0">
//             <TabsList className="w-full grid grid-cols-3 p-1 rounded-lg h-auto bg-white border border-gray-200">
//               <TabsTrigger
//                 value="hours"
//                 className="flex flex-col items-center justify-center h-16 sm:h-20 p-2 gap-1 sm:gap-2 data-[state=active]:bg-[hsl(var(--primary-400))] data-[state=active]:text-white rounded-md text-xs sm:text-sm font-medium"
//               >
//                 <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
//                 <span className="hidden sm:inline">Time Slots</span>
//                 <span className="sm:hidden">Slots</span>
//               </TabsTrigger>
//               <TabsTrigger
//                 value="calendar"
//                 className="flex flex-col items-center justify-center h-16 sm:h-20 p-2 gap-1 sm:gap-2 data-[state=active]:bg-[hsl(var(--primary-400))] data-[state=active]:text-white rounded-md text-xs sm:text-sm font-medium"
//               >
//                 <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
//                 <span className="hidden sm:inline">Block Dates</span>
//                 <span className="sm:hidden">Dates</span>
//               </TabsTrigger>
//               <TabsTrigger
//                 value="settings"
//                 className="flex flex-col items-center justify-center h-16 sm:h-20 p-2 gap-1 sm:gap-2 data-[state=active]:bg-[hsl(var(--primary-400))] data-[state=active]:text-white rounded-md text-xs sm:text-sm font-medium"
//               >
//                 <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
//                 <span className="hidden sm:inline">Rules</span>
//                 <span className="sm:hidden">Rules</span>
//               </TabsTrigger>
//             </TabsList>
//           </div>

//           <TabsContent value="hours" className="p-4 sm:p-6 space-y-6">
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Weekly Time Slot Schedule</h3>
//                 <p className="text-sm sm:text-base text-gray-600 mb-4">
//                   Configure morning (9am-1pm) and afternoon (1pm-5pm) availability for each day
//                 </p>

//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
//                   <Button
//                     variant="outline"
//                     onClick={() => applyTemplate("business")}
//                     className="border-gray-300 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-200))] text-xs sm:text-sm p-3 h-auto"
//                   >
//                     Business Hours
//                     <span className="block text-xs text-gray-500">(9am-5pm, Mon-Fri)</span>
//                   </Button>
//                   <Button
//                     variant="outline"
//                     onClick={() => applyTemplate("weekend")}
//                     className="border-gray-300 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-200))] text-xs sm:text-sm p-3 h-auto"
//                   >
//                     Weekends Only
//                     <span className="block text-xs text-gray-500">(Sat-Sun Only)</span>
//                   </Button>
//                   <Button
//                     variant="outline"
//                     onClick={() => applyTemplate("flexible")}
//                     className="border-gray-300 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-200))] text-xs sm:text-sm p-3 h-auto"
//                   >
//                     Flexible Hours
//                     <span className="block text-xs text-gray-500">(8am-8pm, All Days)</span>
//                   </Button>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 {Object.entries(workingHours).map(([day, dayData]) => {
//                   const IconComponent = dayData.active ? Check : Clock
                  
//                   return (
//                     <div
//                       key={day}
//                       className={`p-6 rounded-lg border transition-all ${
//                         dayData.active ? "bg-white border-[hsl(var(--primary-200))] shadow-sm" : "bg-gray-50 border-gray-200"
//                       }`}
//                     >
//                       <div className="flex items-center gap-3 mb-4">
//                         <Checkbox
//                           id={`day-${day}`}
//                           checked={dayData.active}
//                           onCheckedChange={(checked) => handleWorkingHoursChange(day, "active", !!checked)}
//                           className="data-[state=checked]:bg-[hsl(var(--primary-600))] data-[state=checked]:border-[hsl(var(--primary-600))] w-5 h-5"
//                         />
//                         <div className="flex items-center gap-2 flex-1">
//                           <IconComponent className={`w-5 h-5 ${dayData.active ? 'text-green-600' : 'text-gray-400'}`} />
//                           <div>
//                             <Label htmlFor={`day-${day}`} className="text-lg font-semibold cursor-pointer text-gray-900">
//                               {day}
//                             </Label>
//                             {!dayData.active && <p className="text-sm text-gray-500">Closed all day</p>}
//                             {dayData.active && (
//                               <p className="text-sm text-gray-600">
//                                 {Object.values(dayData.timeSlots).filter(slot => slot.available).length} of 2 time slots available
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       </div>

//                       {dayData.active && (
//                         <div className="ml-8 space-y-3">
//                           {/* FIXED: Ensure correct order and mapping */}
//                           {['morning', 'afternoon'].map((slotId) => {
//                             const slotConfig = TIME_SLOTS[slotId]
//                             const SlotIcon = slotConfig.icon
//                             const slotData = dayData.timeSlots[slotId]
                            
//                             return (
//                               <div key={slotId} className={`p-4 rounded-lg border transition-all ${
//                                 slotData?.available 
//                                   ? 'bg-green-50 border-green-200' 
//                                   : 'bg-gray-50 border-gray-200'
//                               }`}>
//                                 <div className="flex items-center justify-between">
//                                   <div className="flex items-center gap-3">
//                                     <Checkbox
//                                       id={`${day}-${slotId}`}
//                                       checked={slotData?.available || false}
//                                       onCheckedChange={(checked) => {
//                                         console.log(`🔄 User toggled ${day} ${slotId} to ${checked}`)
//                                         handleTimeSlotChange(day, slotId, "available", !!checked)
//                                       }}
//                                       className="data-[state=checked]:bg-[hsl(var(--primary-600))] data-[state=checked]:border-[hsl(var(--primary-600))]"
//                                     />
//                                     <SlotIcon className={`w-5 h-5 ${slotData?.available ? 'text-amber-500' : 'text-gray-400'}`} />
//                                     <div>
//                                       <Label htmlFor={`${day}-${slotId}`} className="font-medium cursor-pointer">
//                                         {slotConfig.label}
//                                       </Label>
//                                       <p className="text-sm text-gray-600">{slotConfig.displayTime}</p>
//                                     </div>
//                                   </div>

//                                   {slotData?.available && (
//                                     <div className="flex items-center gap-3">
//                                       <div className="flex items-center gap-2">
//                                         <Label className="text-sm text-gray-600 min-w-[3rem]">Start</Label>
//                                         <Input
//                                           type="time"
//                                           value={slotData?.startTime || slotConfig.defaultStart}
//                                           onChange={(e) => handleTimeSlotChange(day, slotId, "startTime", e.target.value)}
//                                           className="w-24 border-gray-300 focus:ring-[hsl(var(--primary-200))] focus:border-[hsl(var(--primary-500))] text-sm"
//                                         />
//                                       </div>
//                                       <div className="flex items-center gap-2">
//                                         <Label className="text-sm text-gray-600 min-w-[2.5rem]">End</Label>
//                                         <Input
//                                           type="time"
//                                           value={slotData?.endTime || slotConfig.defaultEnd}
//                                           onChange={(e) => handleTimeSlotChange(day, slotId, "endTime", e.target.value)}
//                                           className="w-24 border-gray-300 focus:ring-[hsl(var(--primary-200))] focus:border-[hsl(var(--primary-500))] text-sm"
//                                         />
//                                       </div>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             )
//                           })}
//                         </div>
//                       )}
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
//           </TabsContent>

//           <TabsContent value="calendar" className="p-4 sm:p-6">
//             <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//               <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
//                 <div className="mb-6">
//                   <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Block Specific Time Slots</h3>
//                   <p className="text-sm sm:text-base text-gray-600 mb-4">
//                     Click on dates to select time slots to block across all businesses
//                   </p>

//                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => markUnavailableRange(7, ['morning', 'afternoon'])}
//                       className="border-gray-300 hover:bg-[hsl(var(--primary-50))] text-xs p-2 h-auto"
//                     >
//                       Block Next 7 Days
//                       <span className="block text-xs text-gray-500">(All day)</span>
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => markUnavailableRange(7, ['morning'])}
//                       className="border-gray-300 hover:bg-[hsl(var(--primary-50))] text-xs p-2 h-auto"
//                     >
//                       Block Mornings
//                       <span className="block text-xs text-gray-500">(Next 7 days)</span>
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => markUnavailableRange(7, ['afternoon'])}
//                       className="border-gray-300 hover:bg-[hsl(var(--primary-50))] text-xs p-2 h-auto"
//                     >
//                       Block Afternoons
//                       <span className="block text-xs text-gray-500">(Next 7 days)</span>
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={clearAllDates}
//                       className="border-gray-300 hover:bg-[hsl(var(--primary-50))] text-xs p-2 h-auto bg-transparent"
//                     >
//                       Clear All
//                       <span className="block text-xs text-gray-500">(Remove blocks)</span>
//                     </Button>
//                   </div>
//                 </div>

//                 <TimeSlotCalendar
//                   currentMonth={currentMonth}
//                   setCurrentMonth={setCurrentMonth}
//                   unavailableDates={unavailableDates}
//                   setUnavailableDates={setUnavailableDates}
//                 />
//               </div>

//               <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h4 className="font-semibold text-gray-900">Blocked Time Slots</h4>
//                   <Badge variant="secondary" className="bg-red-100 text-red-700">
//                     {unavailableDates.reduce((acc, item) => acc + item.timeSlots.length, 0)} slots blocked
//                   </Badge>
//                 </div>

//                 {unavailableDates.length === 0 ? (
//                   <div className="text-center py-8 text-gray-500">
//                     <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
//                     <p className="text-sm">No blocked time slots</p>
//                     <p className="text-xs text-gray-400 mt-1">Click calendar dates to block specific time slots</p>
//                   </div>
//                 ) : (
//                   <ScrollArea className="h-64 sm:h-96">
//                     <div className="space-y-3">
//                       {unavailableDates
//                         .sort((a, b) => new Date(a.date) - new Date(b.date))
//                         .map((item, index) => {
//                           console.log(`🔍 Rendering blocked date ${item.date} with slots:`, item.timeSlots)
//                           return (
//                             <div
//                               key={index}
//                               className="bg-red-50 border border-red-200 rounded-lg p-4"
//                             >
//                               <div className="flex items-start justify-between">
//                                 <div className="flex-1">
//                                   <div className="font-medium text-red-900 mb-2">
//                                     {new Date(item.date).toLocaleDateString('en-US', { 
//                                       weekday: 'long', 
//                                       year: 'numeric', 
//                                       month: 'long', 
//                                       day: 'numeric' 
//                                     })}
//                                   </div>
//                                   <div className="flex flex-wrap gap-2">
//                                     {/* FIXED: Ensure correct mapping of time slots */}
//                                     {item.timeSlots.map(slot => {
//                                       const slotConfig = TIME_SLOTS[slot]
//                                       const SlotIcon = slotConfig?.icon || Clock
                                      
//                                       console.log(`🔍 Rendering slot badge for ${slot}:`, slotConfig)
                                      
//                                       return (
//                                         <div key={slot} className="flex items-center gap-1">
//                                           <Badge 
//                                             variant="secondary" 
//                                             className="bg-red-100 text-red-800 text-xs flex items-center gap-1"
//                                           >
//                                             <SlotIcon className="w-3 h-3" />
//                                             {slotConfig?.label || slot}
//                                             <button
//                                               onClick={() => {
//                                                 console.log(`🔄 Removing ${slot} from date at index ${index}`)
//                                                 removeTimeSlotFromDate(index, slot)
//                                               }}
//                                               className="ml-1 hover:bg-red-200 rounded-full p-0.5"
//                                               title={`Remove ${slotConfig?.label || slot} block`}
//                                             >
//                                               <Trash2 className="w-2.5 h-2.5" />
//                                             </button>
//                                           </Badge>
//                                         </div>
//                                       )
//                                     })}
//                                   </div>
//                                 </div>
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   onClick={() => {
//                                     console.log(`🔄 Removing entire date at index ${index}`)
//                                     setUnavailableDates(prev => prev.filter((_, i) => i !== index))
//                                   }}
//                                   className="hover:bg-red-100 hover:text-red-600 p-2 h-8 w-8 ml-2"
//                                   title="Remove entire date"
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               </div>
//                             </div>
//                           )
//                         })}
//                     </div>
//                   </ScrollArea>
//                 )}
//               </div>
//             </div>
//           </TabsContent>

//           <TabsContent value="settings" className="p-4 sm:p-6">
//             <div className="max-w-2xl bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
//               <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Time Slot Booking Rules</h3>
//               <p className="text-sm sm:text-base text-gray-600 mb-6">
//                 Configure how customers can book your morning and afternoon time slots
//               </p>

//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                   <div>
//                     <Label htmlFor="advance-booking" className="text-sm font-medium text-gray-900">
//                       Minimum advance booking (days)
//                     </Label>
//                     <Input
//                       id="advance-booking"
//                       type="number"
//                       min="0"
//                       max="30"
//                       value={advanceBookingDays}
//                       onChange={(e) => setAdvanceBookingDays(Number.parseInt(e.target.value) || 0)}
//                       className="mt-1 border-gray-300 focus:ring-[hsl(var(--primary-200))] focus:border-[hsl(var(--primary-500))]"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">Applies to both morning and afternoon slots</p>
//                   </div>

//                   <div>
//                     <Label htmlFor="max-booking" className="text-sm font-medium text-gray-900">
//                       Maximum advance booking (days)
//                     </Label>
//                     <Input
//                       id="max-booking"
//                       type="number"
//                       min="1"
//                       max="730"
//                       value={maxBookingDays}
//                       onChange={(e) => setMaxBookingDays(Number.parseInt(e.target.value) || 365)}
//                       className="mt-1 border-gray-300 focus:ring-[hsl(var(--primary-200))] focus:border-[hsl(var(--primary-500))]"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">How far ahead customers can book</p>
//                   </div>
//                 </div>

//                 <div>
//                   <Label htmlFor="availability-notes" className="text-sm font-medium text-gray-900">
//                     Time slot availability notes
//                   </Label>
//                   <textarea
//                     id="availability-notes"
//                     value={availabilityNotes}
//                     onChange={(e) => setAvailabilityNotes(e.target.value)}
//                     placeholder="e.g., 'Morning slots are perfect for younger children. Afternoon slots work better for school-age kids.' Add any special information about your time slots..."
//                     className="w-full mt-1 p-3 border border-gray-300 rounded-md text-sm h-32 resize-none focus:ring-[hsl(var(--primary-200))] focus:border-[hsl(var(--primary-500))]"
//                   />
//                   <p className="text-xs text-gray-500 mt-1">Help customers choose the best time slot for their party</p>
//                 </div>

//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                   <div className="flex items-start gap-3">
//                     <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <h4 className="font-medium text-blue-900 mb-1">Time Slot Guidelines</h4>
//                       <ul className="text-sm text-blue-800 space-y-1">
//                         <li>• Morning slots (9am-1pm) work well for younger children</li>
//                         <li>• Afternoon slots (1pm-5pm) are popular for school-age kids</li>
//                         <li>• Consider meal timing when setting availability</li>
//                         <li>• Weekend slots tend to book faster than weekdays</li>
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   )
// }

// export default AvailabilityContent

// In your existing AvailabilityContent.jsx file
"use client"

import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierDashboard } from "@/utils/mockBackend"
import { useBusiness } from "@/contexts/BusinessContext"
import AvailabilityContent from "./AvailabilityContent" // or wherever this is

export default function AvailabilityPage() {
  // Use the same hooks as your profile page
  const { supplier, supplierData, setSupplierData, loading, error, refresh, currentBusiness } = useSupplier()
  const { saving, updateProfile } = useSupplierDashboard()
  const { currentBusiness: businessFromContext, getPrimaryBusiness, businesses } = useBusiness()

  const primaryBusiness = getPrimaryBusiness()

  return (
    <AvailabilityContent 
      supplier={supplier}
      supplierData={supplierData}
      setSupplierData={setSupplierData}
      loading={loading}
      error={error}
      refresh={refresh}
      currentBusiness={currentBusiness || businessFromContext}
      primaryBusiness={primaryBusiness}
      businesses={businesses}
    />
  )
}
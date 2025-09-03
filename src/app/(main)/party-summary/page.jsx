"use client"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePartyData } from "../dashboard/hooks/usePartyData"
import { usePartyPhase } from "../dashboard/hooks/usePartyPhase"
import { useRouter } from "next/navigation"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { ChevronDown, ChevronRight, Gift, Edit, Trash2, Building, Users, DollarSign, CreditCard, Calendar, Clock, MapPin, User } from "lucide-react"
import { useState } from "react"
import SupplierChatTabs from '@/components/SupplierChatTabs'
import SnappyLoader from "@/components/ui/SnappyLoader"

// Party Details Card Component
const PartyDetailsCard = ({ partyDetails, currentParty, dataSource }) => {
  // Utility functions for formatting
  const formatDateForDisplay = (dateInput) => {
    if (!dateInput) return null;
    
    let date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      if (dateInput.includes('th ') || dateInput.includes('st ') || dateInput.includes('nd ') || dateInput.includes('rd ')) {
        return dateInput;
      }
      
      if (dateInput.includes('•')) {
        const datePart = dateInput.split('•')[0].trim();
        date = new Date(datePart);
      } else {
        date = new Date(dateInput);
      }
    } else {
      return null;
    }
    
    if (isNaN(date.getTime())) {
      return null;
    }
    
    const day = date.getDate();
    const suffix = getDaySuffix(day);
    const month = date.toLocaleDateString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    
    return `${day}${suffix} ${month}, ${year}`;
  };

  const getDaySuffix = (day) => {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const formatTimeForDisplay = (timeInput) => {
    if (!timeInput) return null;
    
    try {
      if (typeof timeInput === 'string' && timeInput.includes(':')) {
        const [hours, minutes] = timeInput.split(':');
        const timeObj = new Date();
        timeObj.setHours(parseInt(hours), parseInt(minutes || 0));
        
        return timeObj.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: minutes && minutes !== '00' ? '2-digit' : undefined,
          hour12: true,
        });
      }
      
      const timeObj = new Date(`2000-01-01T${timeInput}`);
      return timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',  
        hour12: true,
      });
    } catch (error) {
      return timeInput;
    }
  };

  const calculateEndTime = (startTime, duration = 2) => {
    if (!startTime) return null;
    
    try {
      const [hours, minutes] = startTime.split(':');
      const startDate = new Date();
      startDate.setHours(parseInt(hours), parseInt(minutes || 0));
      
      const endDate = new Date(startDate.getTime() + (duration * 60 * 60 * 1000));
      
      return endDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: endDate.getMinutes() > 0 ? '2-digit' : undefined,
        hour12: true,
      });
    } catch (error) {
      return null;
    }
  };

  const formatTimeRangeFromDatabase = (startTime, endTime, fallbackDuration = 2) => {
    if (startTime && endTime) {
      const formattedStart = formatTimeForDisplay(startTime);
      const formattedEnd = formatTimeForDisplay(endTime);
      
      if (formattedStart && formattedEnd) {
        return `${formattedStart} - ${formattedEnd}`;
      }
    }
    
    if (startTime) {
      const formattedStart = formatTimeForDisplay(startTime);
      const calculatedEnd = calculateEndTime(startTime, fallbackDuration);
      
      if (formattedStart && calculatedEnd) {
        return `${formattedStart} - ${calculatedEnd}`;
      }
    }
    
    return "2pm - 4pm";
  };

  // Helper functions
  const getFullName = () => {
    if (dataSource === 'database' && currentParty?.child_name) {
      return currentParty.child_name;
    }
    
    if (partyDetails?.firstName || partyDetails?.lastName) {
      return `${partyDetails?.firstName || ''} ${partyDetails?.lastName || ''}`.trim();
    }
    
    if (partyDetails?.childName) {
      return partyDetails.childName;
    }
    
    return "Emma";
  };

  const getDisplayDate = () => {
    if (dataSource === 'database' && currentParty?.party_date) {
      return formatDateForDisplay(currentParty.party_date);
    }
    
    return partyDetails?.displayDate || 
           formatDateForDisplay(partyDetails?.date) || 
           "14th June, 2025";
  };

  const getDisplayTimeRange = () => {
    if (dataSource === 'database' && currentParty) {
      return formatTimeRangeFromDatabase(
        currentParty.start_time, 
        currentParty.end_time, 
        currentParty.duration || 2
      );
    }
    
    return partyDetails?.displayTimeRange || 
           formatTimeRangeFromDatabase(partyDetails?.startTime, null, partyDetails?.duration) || 
           "2pm - 4pm";
  };

  const getChildAge = () => {
    if (dataSource === 'database' && currentParty?.child_age) {
      return `${currentParty.child_age} years old`;
    }
    
    return `${partyDetails?.childAge || 6} years old`;
  };

  const formatGuestCount = (count) => {
    if (!count) return "Not specified";
    return `${count} guests`;
  };

  const getGuestCount = () => {
    if (dataSource === 'database' && currentParty?.guest_count) {
      return formatGuestCount(currentParty.guest_count);
    }
    
    return formatGuestCount(partyDetails?.guestCount);
  };

  const getLocation = () => {
    if (dataSource === 'database' && currentParty?.location) {
      return currentParty.location;
    }
    
    return partyDetails?.location || "W1A 1AA";
  };

  const getTheme = () => {
    if (dataSource === 'database' && currentParty?.theme) {
      return currentParty.theme.charAt(0).toUpperCase() + currentParty.theme.slice(1);
    }
    
    return partyDetails?.theme ? 
      partyDetails.theme.charAt(0).toUpperCase() + partyDetails.theme.slice(1) : 
      "Superhero";
  };

  return (
    <Card className="bg-white shadow-lg border-0 rounded-2xl mb-8">
      <CardContent className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Party Details</h2>
        
        {/* Mobile: 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4 md:hidden mb-6">
          {/* Child Name */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-600">Child</span>
            </div>
            <p className="font-semibold text-gray-900">{getFullName()}</p>
            <p className="text-sm text-gray-500">{getChildAge()}</p>
          </div>

          {/* Date */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-600">Date</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{getDisplayDate()}</p>
          </div>

          {/* Time */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-600">Time</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">{getDisplayTimeRange()}</p>
          </div>

          {/* Guests */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-600">Guests</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">{getGuestCount()}</p>
          </div>
        </div>

        {/* Location - Full width on mobile */}
        <div className="md:hidden mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-600">Location</span>
            </div>
            <p className="font-semibold text-gray-900">{getLocation()}</p>
          </div>
        </div>

        {/* Theme - Full width on mobile */}
        <div className="md:hidden">
          <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Theme</span>
            </div>
            <p className="font-semibold text-primary-900">{getTheme()} Party</p>
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Child Name */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-medium text-gray-600">Child</span>
            </div>
            <p className="font-bold text-xl text-gray-900 mb-1">{getFullName()}</p>
            <p className="text-gray-500">{getChildAge()}</p>
          </div>

          {/* Date */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-medium text-gray-600">Date</span>
            </div>
            <p className="font-bold text-lg text-gray-900">{getDisplayDate()}</p>
          </div>

          {/* Time */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <Clock className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-medium text-gray-600">Time</span>
            </div>
            <p className="font-bold text-lg text-gray-900">{getDisplayTimeRange()}</p>
          </div>

          {/* Guests */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-medium text-gray-600">Guests</span>
            </div>
            <p className="font-bold text-lg text-gray-900">{getGuestCount()}</p>
          </div>

          {/* Location - spans 2 columns on desktop */}
          <div className="bg-gray-50 rounded-xl p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-medium text-gray-600">Location</span>
            </div>
            <p className="font-bold text-lg text-gray-900">{getLocation()}</p>
          </div>

          {/* Theme - spans 2 columns on desktop */}
          <div className="bg-primary-50 rounded-xl p-6 lg:col-span-2 border border-primary-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary-200 rounded-full">
                <Gift className="w-5 h-5 text-primary-700" />
              </div>
              <span className="font-medium text-primary-700">Party Theme</span>
            </div>
            <p className="font-bold text-xl text-primary-900">{getTheme()} Party</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mobile Party Service Card Component
const PartyServiceCard = ({ service, onAction }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "paid":
        return { badge: "bg-teal-500 text-white", label: "Paid" }
      case "confirmed":
        return { badge: "bg-[hsl(var(--primary-500))] text-white", label: "Confirmed" }
      case "process":
        return { badge: "bg-orange-100 text-orange-800", label: "Pending" }
      case "declined":
        return { badge: "bg-red-100 text-red-800", label: "Declined" }
      default:
        return { badge: "bg-gray-100 text-gray-800", label: "Planned" }
    }
  }

  const statusConfig = getStatusConfig(service.status)
  const hasAddons = service.addons && service.addons.length > 0
  const hasPendingPayment = service.price - service.amountPaid > 0

  return (
    <Card className={`shadow-sm border hover:shadow-md transition-all duration-300 ${
      hasPendingPayment 
        ? 'border-orange-300 shadow-orange-100 animate-pulse bg-gradient-to-br from-orange-50 to-white' 
        : 'border-gray-200'
    }`}>
      <CardContent className="p-4">
        {/* Header - Service name and status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg truncate pr-2">
              {service.serviceName}
            </h3>
            <div className="text-sm text-gray-500 mt-1">
              {service.vendorName} • {service.category}
            </div>
          </div>
          <Badge className={`${statusConfig.badge} font-medium px-3 py-1 rounded-full flex-shrink-0 ${
            hasPendingPayment ? 'animate-pulse' : ''
          }`}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Price summary - simplified */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              £{service.price}
              {hasAddons && (
                <span className="text-sm font-normal text-[hsl(var(--primary-600))] ml-2">
                  +{service.addons.length} extras
                </span>
              )}
            </div>
            {service.amountPaid > 0 && (
              <div className="text-sm text-teal-600 font-medium">
                £{service.amountPaid} paid
              </div>
            )}
          </div>
          
          {hasPendingPayment && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Remaining</div>
              <div className={`text-lg font-semibold text-orange-600 ${
                hasPendingPayment ? 'animate-pulse' : ''
              }`}>
                £{service.price - service.amountPaid}
              </div>
            </div>
          )}
        </div>

        {/* Pending payment alert */}
        {hasPendingPayment && (
          <div className="mb-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">
                Payment Required: £{service.price - service.amountPaid}
              </span>
            </div>
          </div>
        )}

        {/* Actions - simplified */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction("edit", service)}
            className="flex-1 text-sm h-8"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction("remove", service)}
            className="flex-1 text-sm h-8 hover:text-red-600 hover:border-red-300"
          >
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Desktop Table Row Component
const PartyServiceTableRow = ({ service, onAction, expandedRows, toggleRowExpansion }) => {
  const isExpanded = expandedRows.has(service.id)

  return (
    <>
      <TableRow className="border-b border-gray-100 hover:bg-[hsl(var(--primary-50))] transition-colors">
        <TableCell className="px-3 md:px-8 py-3 md:py-6 font-medium text-gray-900 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            {service.addons && service.addons.length > 0 && (
              <button
                onClick={() => toggleRowExpansion(service.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            <span>{service.serviceName}</span>
            {service.addons && service.addons.length > 0 && (
              <div className="flex items-center gap-1">
                <Gift className="w-3 h-3 text-[hsl(var(--primary-500))]" />
                <span className="text-xs text-[hsl(var(--primary-500))] font-medium">
                  +{service.addons.length}
                </span>
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="px-3 md:px-8 py-3 md:py-6">
          <Badge
            className={`
              text-xs font-medium px-2 md:px-3 py-1 rounded-full
              ${
                service.status === "paid"
                  ? "bg-teal-500 text-white hover:bg-teal-600"
                  : service.status === "confirmed"
                    ? "bg-[hsl(var(--primary-500))] text-white hover:bg-[hsl(var(--primary-600))]"
                    : service.status === "process"
                      ? "bg-[hsl(var(--primary-200))] text-[hsl(var(--primary-800))] hover:bg-[hsl(var(--primary-300))]"
                      : service.status === "declined"
                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }
            `}
          >
            {service.status === "paid" && "Paid"}
            {service.status === "confirmed" && "Confirmed"}
            {service.status === "planned" && "Planned"}
            {service.status === "process" && "Pending"}
            {service.status === "declined" && "Declined"}
          </Badge>
        </TableCell>
        <TableCell className="px-3 md:px-8 py-3 md:py-6 text-gray-600 text-xs md:text-sm">
          {service.vendorName}
        </TableCell>
        <TableCell className="px-3 md:px-8 py-3 md:py-6 text-gray-600 text-xs md:text-sm">
          {service.category}
        </TableCell>
        <TableCell className="px-3 md:px-8 py-3 md:py-6 font-medium text-gray-900 text-xs md:text-sm">
          <div>
            <div>£{service.price}</div>
            {service.addons && service.addons.length > 0 && (
              <div className="text-xs text-gray-500">
                Base: £{service.basePrice} + Add-ons: £{service.addonsPrice}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="px-3 md:px-8 py-3 md:py-6 font-medium text-gray-900 text-xs md:text-sm">
          £{service.amountPaid}
        </TableCell>
        <TableCell className="px-3 md:px-8 py-3 md:py-6 font-medium text-gray-900 text-xs md:text-sm">
          £{service.price - service.amountPaid}
        </TableCell>
        <TableCell className="px-3 md:px-8 py-3 md:py-6">
          <div className="flex gap-1 md:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs px-2 md:px-3 py-1 h-7 md:h-8 border-gray-300 hover:bg-gray-50 bg-transparent"
              onClick={() => onAction("remove", service)}
            >
              Remove
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs px-2 md:px-3 py-1 h-7 md:h-8 text-[hsl(var(--primary-600))] border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] bg-transparent"
              onClick={() => onAction("edit", service)}
            >
              Edit
            </Button>
          </div>
        </TableCell>
      </TableRow>
      
      {/* Addon Details Expansion Row */}
      {isExpanded && service.addons && service.addons.length > 0 && (
        <TableRow className="bg-[hsl(var(--primary-25))] border-b border-gray-100">
          <TableCell colSpan={8} className="px-3 md:px-8 py-4">
            <div className="ml-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4 text-[hsl(var(--primary-500))]" />
                Add-ons for {service.serviceName}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {service.addons.map((addon, addonIndex) => (
                  <div
                    key={addon.id || addonIndex}
                    className="bg-white border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-sm font-medium text-gray-900">
                        {addon.name}
                      </h5>
                      <span className="text-sm font-bold text-[hsl(var(--primary-600))]">
                        £{addon.price || 0}
                      </span>
                    </div>
                    {addon.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {addon.description}
                      </p>
                    )}
                    {addon.quantity && addon.quantity > 1 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Quantity: {addon.quantity}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default function PartyPlanSummary() {
  const router = useRouter()
  const [expandedRows, setExpandedRows] = useState(new Set())

  const {
    partyData,
    partyId,
    totalCost,
    addons,
    loading,
    user,
    suppliers,
    isSignedIn,
    partyDetails,
    currentParty,
    dataSource,
    handleDeleteSupplier: removeSupplier,
  } = usePartyData()

  const { enquiries, isPaymentConfirmed, currentPhase } = usePartyPhase(partyData, partyId)

  const toggleRowExpansion = (serviceId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId)
    } else {
      newExpanded.add(serviceId)
    }
    setExpandedRows(newExpanded)
  }

  const getTableData = () => {
    if (!suppliers) return []
  
    const supplierTypes = [
      "venue",
      "entertainment", 
      "catering",
      "facePainting",
      "activities",
      "partyBags",
      "decorations",
      "balloons",
      "cakes"
    ]
  
    return supplierTypes
      .filter((type) => suppliers[type])
      .map((type) => {
        const supplier = suppliers[type]
        const enquiry = enquiries.find((e) => e.supplier_category === type)
        
        let supplierAddons = []
        
        if (enquiry?.addon_details) {
          try {
            const enquiryAddons = JSON.parse(enquiry.addon_details)
            supplierAddons = Array.isArray(enquiryAddons) ? enquiryAddons : []
          } catch (error) {
            console.error(`Error parsing addon_details for ${type}:`, error)
          }
        }
        
        if (supplierAddons.length === 0) {
          supplierAddons = addons.filter((addon) => 
            addon.supplierId === supplier?.id || 
            addon.supplierType === type ||
            addon.attachedToSupplier === type
          )
        }
        
        if (supplierAddons.length === 0 && supplier?.selectedAddons) {
          supplierAddons = supplier.selectedAddons
        }

        const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
        const totalPrice = (supplier.price || 0) + addonsCost
  
        const isAccepted = enquiry?.status === "accepted"
        const isPaid = enquiry?.payment_status === "paid" || enquiry?.is_paid === true
        
        const amountPaid = (isAccepted && isPaid) ? totalPrice : 0
  
        return {
          id: supplier.id || `${type}-${Date.now()}`,
          type,
          serviceName: supplier.name,
          vendorName: supplier.originalSupplier?.owner?.name || supplier.owner?.name || "N/A",
          category: type.charAt(0).toUpperCase() + type.slice(1),
          price: totalPrice,
          basePrice: supplier.price || 0,
          addonsPrice: addonsCost,
          addons: supplierAddons,
          amountPaid: amountPaid,
          status: getSupplierStatus(enquiry?.status, isPaid),
          enquiryId: enquiry?.id,
          enquiryStatus: enquiry?.status,
          paymentStatus: enquiry?.payment_status || enquiry?.is_paid,
          supplier: supplier,
        }
      })
  }

  const getSupplierStatus = (enquiryStatus, isPaid) => {
    switch (enquiryStatus) {
      case "accepted":
        return isPaid ? "paid" : "confirmed"
      case "pending":
        return "process"
      case "declined":
        return "declined"
      default:
        return "planned"
    }
  }

  const getBudgetData = () => {
    const totalPaid = tableData.reduce((sum, service) => sum + service.amountPaid, 0)
    const totalSpent = totalCost
    const remainingToPay = totalSpent - totalPaid

    const userBudget = partyDetails?.budget || 1000
    const remainingBudget = userBudget - totalSpent

    return {
      total: userBudget,
      amountPaid: totalPaid,
      remainingToPay: remainingToPay,
      remainingBudget: Math.max(0, remainingBudget),
      totalSpent: totalSpent,
    }
  }

  const handleAction = async (action, supplierData) => {
    if (action === "remove") {
      const confirmed = window.confirm(`Remove ${supplierData.serviceName} from your party?`)
      if (confirmed) {
        await removeSupplier(supplierData.type)
      }
    } else if (action === "edit") {
      console.log("Edit supplier:", supplierData)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <SnappyLoader text="Loading your party..." />
      </div>
    )
  }

  const tableData = getTableData()
  const budgetData = getBudgetData()

  return (
    <div className="min-h-screen bg-[hsl(var(--primary-50))] px-2">
      <ContextualBreadcrumb currentPage="party-summary" />

      <div className="bg-[hsl(var(--primary-50))] px-7 pt-8 pb-5">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Party Summary</h1>
      </div>

      <div className="px-3 md:px-6 pb-8">
        {/* Party Details Section */}
        <PartyDetailsCard 
          partyDetails={partyDetails} 
          currentParty={currentParty}
          dataSource={dataSource}
        />

        {/* Services Section */}
        {tableData.length > 0 ? (
          <>
            {/* Mobile: Card Layout */}
            <div className="lg:hidden space-y-4 mb-8">
              {tableData.map((service) => (
                <PartyServiceCard 
                  key={service.id} 
                  service={service} 
                  onAction={handleAction}
                />
              ))}
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[120px]">
                        Service name
                      </TableHead>
                      <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[80px]">
                        Status
                      </TableHead>
                      <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[100px]">
                        Vendor name
                      </TableHead>
                      <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[80px]">
                        Category
                      </TableHead>
                      <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[70px]">
                        Price
                      </TableHead>
                      <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[80px]">
                        Amount paid
                      </TableHead>
                      <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[90px]">
                        Remaining amount
                      </TableHead>
                      <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[100px]">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((service) => (
                      <PartyServiceTableRow 
                        key={service.id} 
                        service={service}
                        onAction={handleAction}
                        expandedRows={expandedRows}
                        toggleRowExpansion={toggleRowExpansion}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        ) : (
          <Card className="bg-white shadow-lg border-0 rounded-2xl mb-8">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-[hsl(var(--primary-100))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-[hsl(var(--primary-500))]" />
              </div>
              <h3 className="text-xl font-semibold text-[hsl(var(--primary-900))] mb-2">No services added yet</h3>
              <p className="text-[hsl(var(--primary-600))]">
                Add suppliers to your party to see the summary here.
              </p>
            </CardContent>
          </Card>
        )}

        <div id="supplier-messages" className="bg-[hsl(var(--primary-50))] px-3 pt-8 pb-5">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Supplier Messages</h1>
        </div>
        <SupplierChatTabs 
          customerId={user?.id}
          partyId={partyId}
          suppliers={suppliers}
        />

        {/* Budget Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <div className="bg-[hsl(var(--primary-500))] rounded-lg p-4 md:p-8 text-white">
            <h3 className="text-xs md:text-sm font-medium text-white/80 mb-2 md:mb-3">Total Cost</h3>
            <p className="text-2xl md:text-4xl font-bold">£{budgetData.totalSpent}</p>
          </div>

          <div className="bg-[hsl(var(--primary-400))] rounded-lg p-4 md:p-8 text-white">
            <h3 className="text-xs md:text-sm font-medium text-white/80 mb-2 md:mb-3">Amount Paid</h3>
            <p className="text-2xl md:text-4xl font-bold">£{budgetData.amountPaid}</p>
          </div>

          <div className="bg-[hsl(var(--primary-300))] rounded-lg p-4 md:p-8 text-[hsl(var(--primary-900))]">
            <h3 className="text-xs md:text-sm font-medium text-[hsl(var(--primary-800))] mb-2 md:mb-3">Remaining</h3>
            <p className="text-2xl md:text-4xl font-bold">£{budgetData.remainingToPay}</p>
          </div>

          <div className="bg-[hsl(var(--primary-200))] rounded-lg p-4 md:p-8 text-[hsl(var(--primary-900))]">
            <h3 className="text-xs md:text-sm font-medium text-[hsl(var(--primary-800))] mb-2 md:mb-3">Budget Left</h3>
            <p className="text-2xl md:text-4xl font-bold">£{budgetData.remainingBudget}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
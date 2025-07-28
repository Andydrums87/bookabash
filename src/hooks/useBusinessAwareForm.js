// Business-aware form hook - automatically refreshes when business switches
import { useEffect, useState } from 'react'
import { useSupplier } from '@/hooks/useSupplier'

export function useBusinessAwareForm(initialData = {}) {
  const { supplier, supplierData, loading } = useSupplier()
  const [formData, setFormData] = useState(initialData)
  const [isFormLoading, setIsFormLoading] = useState(true)

  // Update form data whenever supplier data changes
  useEffect(() => {
    if (supplierData && !loading) {
      console.log('🔄 Form updating with new business data:', supplierData.name)
      
      // Reset form with the new business data
      setFormData({
        // Business info
        businessName: supplierData.name || '',
        businessDescription: supplierData.description || '',
        serviceType: supplierData.serviceType || '',
        postcode: supplierData.location || '',
        
        // Owner info (should be consistent across businesses)
        contactName: supplierData.owner?.name || '',
        email: supplierData.owner?.email || '',
        phone: supplierData.owner?.phone || '',
        
        // Service details
        serviceDetails: supplierData.serviceDetails || {},
        
        // Media
        portfolioImages: supplierData.portfolioImages || [],
        portfolioVideos: supplierData.portfolioVideos || [],
        coverPhoto: supplierData.coverPhoto || supplierData.image || '',
        
        // Packages
        packages: supplierData.packages || [],
        
        // Availability
        workingHours: supplierData.workingHours || {},
        unavailableDates: supplierData.unavailableDates || [],
        busyDates: supplierData.busyDates || [],
        availabilityNotes: supplierData.availabilityNotes || '',
        advanceBookingDays: supplierData.advanceBookingDays || 7,
        maxBookingDays: supplierData.maxBookingDays || 365,
        
        // Owner details
        owner: supplierData.owner || {},
        
        // Any other fields from your existing forms
        ...initialData
      })
      
      setIsFormLoading(false)
    }
  }, [supplierData, loading, initialData])

  // Listen for business switch events to immediately refresh form
  useEffect(() => {
    const handleBusinessSwitch = () => {
      console.log('🔄 Form detected business switch - refreshing...')
      setIsFormLoading(true)
    }

    const handleSupplierDataChange = (event) => {
      console.log('🔄 Form detected supplier data change - updating...')
      // The useEffect above will handle the actual update
    }

    window.addEventListener('businessSwitched', handleBusinessSwitch)
    window.addEventListener('supplierDataChanged', handleSupplierDataChange)
    
    return () => {
      window.removeEventListener('businessSwitched', handleBusinessSwitch)
      window.removeEventListener('supplierDataChanged', handleSupplierDataChange)
    }
  }, [])

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateNestedFormData = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = path.split('.')
      let current = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  return {
    formData,
    setFormData,
    updateFormData,
    updateNestedFormData,
    isFormLoading: isFormLoading || loading,
    supplier,
    supplierData,
    currentBusinessName: supplierData?.name,
    currentBusinessId: supplier?.id,
    isMultiBusiness: !!supplier?.business_type
  }
}

// Specific hook for profile forms
export function useProfileForm() {
  return useBusinessAwareForm({
    // Profile-specific initial data
    businessName: '',
    businessDescription: '',
    serviceType: '',
    postcode: '',
    contactName: '',
    email: '',
    phone: ''
  })
}

// Specific hook for service details forms  
export function useServiceDetailsForm() {
  return useBusinessAwareForm({
    // Service details specific initial data
    serviceDetails: {
      performerType: '',
      ageGroups: [],
      themes: [],
      travelRadius: 20,
      setupTime: 30,
      groupSizeMin: 5,
      groupSizeMax: 30,
      addOnServices: []
    }
  })
}

// Specific hook for packages forms
export function usePackagesForm() {
  return useBusinessAwareForm({
    packages: []
  })
}

// Specific hook for availability forms
export function useAvailabilityForm() {
  return useBusinessAwareForm({
    workingHours: {},
    unavailableDates: [],
    busyDates: [],
    availabilityNotes: '',
    advanceBookingDays: 7,
    maxBookingDays: 365
  })
}
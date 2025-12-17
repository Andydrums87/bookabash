// AvailabilityRouter.jsx
import React from 'react';
import TimeSlotAvailabilityContent from './availability/TimeSlotAvailability';
import LeadTimeAvailabilityContent from './availability/LeadTimeAvailability';
import CakeAvailabilityContent from './availability/CakeAvailability';
import { getAvailabilityType, AVAILABILITY_TYPES } from './utils/supplierTypes';

const AvailabilityRouter = ({ 
    supplier,
    supplierData,
    setSupplierData,
    loading,
    error,
    refresh,
    currentBusiness,
    primaryBusiness,
    businesses
  }) => {
    const getAvailabilityComponent = () => {
      // Use the same logic as ServiceRouter to determine category
      const category = (supplier?.category || 
                       supplierData?.category || 
                       supplierData?.serviceType ||
                       currentBusiness?.category ||
                       currentBusiness?.serviceType)?.toLowerCase();
      
      const availabilityType = getAvailabilityType(category);
      
      console.log('🔍 AvailabilityRouter detecting category:', category, 'type:', availabilityType, 'for business:', currentBusiness?.name);
      
      // Common props for both components
      const commonProps = {
        supplier,
        supplierData,
        setSupplierData,
        loading,
        error,
        refresh,
        currentBusiness,
        primaryBusiness,
        businesses
      };
  
      switch (availabilityType) {
        case AVAILABILITY_TYPES.CAKE_CALENDAR:
          return (
            <CakeAvailabilityContent
              {...commonProps}
              supplierCategory={category}
            />
          );

        case AVAILABILITY_TYPES.LEAD_TIME_BASED:
          return (
            <LeadTimeAvailabilityContent
              {...commonProps}
              supplierCategory={category}
            />
          );

        case AVAILABILITY_TYPES.TIME_SLOT_BASED:
        default:
          return (
            <TimeSlotAvailabilityContent
              {...commonProps}
              supplierCategory={category}
            />
          );
      }
    };
  
    return getAvailabilityComponent();
  };
  
  export default AvailabilityRouter;
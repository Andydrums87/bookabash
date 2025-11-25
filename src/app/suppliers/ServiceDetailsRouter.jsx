// ServiceDetailsRouter.jsx
import React from 'react';
import EntertainerServiceDetails from './profile/components/EntertainerServiceDetails';
import VenueServiceDetails from './profile/components/VenueServiceDetails';
import FacePaintingServiceDetails from './profile/components/FacePaintingServiceDetails';
import CateringServiceDetails from './profile/components/CateringServiceDetails';
import BouncyCastleServiceDetails from './profile/components/BouncyCastleServiceDetails';
import DecorationsServiceDetails from './profile/components/DecorationsServiceDetails';
import PartyBagsServiceDetails from './profile/components/PartyBagServiceDetails';


const ServiceDetailsRouter = ({
  serviceType,
  serviceDetails,
  supplierData,
  currentBusiness,
  onUpdate,
  saving,
  // Add these new props:
  setSupplierData,
  updateProfile,
  supplier,
  selectedSection,
  onSectionChange
}) => {
  const getServiceComponent = () => {
    const type = (serviceType || supplierData?.category || supplierData?.serviceType)?.toLowerCase();

    console.log('🔍 ServiceRouter detecting type:', type, 'for business:', currentBusiness?.name);

    // Common props that all components need
    const commonProps = {
      serviceDetails,
      onUpdate,
      saving,
      supplierData,
      currentBusiness,
      setSupplierData,
      updateProfile,
      supplier,
      selectedSection,
      onSectionChange
    };
    
    switch (type) {
      case 'entertainment':
      case 'entertainer':
        return <EntertainerServiceDetails {...commonProps} />;
        
      case 'party bags':
      case 'partybags':
      case 'party_bags':
        return <PartyBagsServiceDetails {...commonProps} />;
        
      case 'venues':
      case 'venue':
        return <VenueServiceDetails {...commonProps} />;
        
      // Add for all other cases...
      case 'catering':
      case 'caterer':
        return <CateringServiceDetails {...commonProps} />;
        
      default:
        return <EntertainerServiceDetails {...commonProps} serviceType={serviceType} />;
    }
  };

  return getServiceComponent();
};

export default ServiceDetailsRouter;
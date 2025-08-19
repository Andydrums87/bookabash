// ServiceDetailsRouter.jsx
import React from 'react';
import EntertainerServiceDetails from './profile/components/EntertainerServiceDetails';
import VenueServiceDetails from './profile/components/VenueServiceDetails';
import FacePaintingServiceDetails from './profile/components/FacePaintingServiceDetails';
import CateringServiceDetails from './profile/components/CateringServiceDetails';
import BouncyCastleServiceDetails from './profile/components/BouncyCastleServiceDetails';
import DecorationsServiceDetails from './profile/components/DecorationsServiceDetails';


const ServiceDetailsRouter = ({ 
  serviceType, 
  serviceDetails, 
  supplierData, 
  currentBusiness, 
  onUpdate, 
  saving 
}) => {
  const getServiceComponent = () => {
    const type = (serviceType || supplierData?.category || supplierData?.serviceType)?.toLowerCase();
    
    console.log('🔍 ServiceRouter detecting type:', type, 'for business:', currentBusiness?.name);
    
    switch (type) {
      case 'entertainment':
      case 'entertainer':
        return (
          <EntertainerServiceDetails
            serviceDetails={serviceDetails}
            onUpdate={onUpdate}
            saving={saving}
            supplierData={supplierData}
            currentBusiness={currentBusiness}
          />
        );
      
      case 'venues':
      case 'venue':
        return (
          <VenueServiceDetails
            serviceDetails={serviceDetails}
            onUpdate={onUpdate}
            saving={saving}
            supplierData={supplierData}
            currentBusiness={currentBusiness}
          />
        );
        case 'face_painting':
          case 'face painting':
          case 'facepainting':
          case 'face_painter': // Face painters often listed under decorations
            return (
              <FacePaintingServiceDetails
                serviceDetails={serviceDetails}
                onUpdate={onUpdate}
                saving={saving}
                supplierData={supplierData}
                currentBusiness={currentBusiness}
              />
            );
            case 'catering':
              case 'caterer':
                return (
                  <CateringServiceDetails
                    serviceDetails={serviceDetails}
                    onUpdate={onUpdate}
                    saving={saving}
                    supplierData={supplierData}
                    currentBusiness={currentBusiness}
                  />
                );
                case 'decorations':
                  case 'decoration':
                  case 'party decorations':
                  case 'balloon arch':
                  case 'balloon arches':
                  case 'event styling':
                  case 'party styling':
                  case 'balloon artist':
                  case 'balloon designer':
                    return (
                      <DecorationsServiceDetails
                        serviceDetails={serviceDetails}
                        onUpdate={onUpdate}
                        saving={saving}
                        supplierData={supplierData}
                        currentBusiness={currentBusiness}
                      />
                    );
                case 'activities':
                  case 'bouncy_castle':
                  case 'bouncy castle hire':
                  case 'inflatable hire':
                  case 'soft play':
                  case 'party equipment':
                    return (
                      <BouncyCastleServiceDetails
                        serviceDetails={serviceDetails}
                        onUpdate={onUpdate}
                        saving={saving}
                        supplierData={supplierData}
                        currentBusiness={currentBusiness}
                      />
                    );
      
      // case 'activities':
      // case 'bouncy_castle':
      // case 'bouncy castle hire':
      //   return (
      //     <BouncyCastleServiceDetails
      //       serviceDetails={serviceDetails}
      //       onUpdate={onUpdate}
      //       saving={saving}
      //       supplierData={supplierData}
      //       currentBusiness={currentBusiness}
      //     />
      //   );
      
      // case 'catering':
      // case 'caterer':
      //   return (
      //     <CateringServiceDetails
      //       serviceDetails={serviceDetails}
      //       onUpdate={onUpdate}
      //       saving={saving}
      //       supplierData={supplierData}
      //       currentBusiness={currentBusiness}
      //     />
      //   );
      
      default:
        return (
          <EntertainerServiceDetails
            serviceDetails={serviceDetails}
            onUpdate={onUpdate}
            saving={saving}
            supplierData={supplierData}
            currentBusiness={currentBusiness}
            serviceType={serviceType}
          />
        );
    }
  };

  return getServiceComponent();
};

export default ServiceDetailsRouter;
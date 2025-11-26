// hooks/useSectionManager.js
import { useState, useEffect, useCallback } from 'react';

export const useSectionManager = (supplierData, updateProfile, supplier) => {
  const [sections, setSections] = useState({});

  // Initialize or update original values when data loads
  useEffect(() => {
    if (supplierData?.serviceDetails) {
      setSections(prev => {
        const newSections = { ...prev };
        const serviceDetails = supplierData.serviceDetails;
        
        // Define all sections with their original values
        const sectionConfigs = {
          aboutUs: {
            originalValue: serviceDetails.aboutUs || '',
          },
          basicInfo: {
            originalValue: {
              travelRadius: serviceDetails.travelRadius || 20,
              serviceArea: serviceDetails.serviceArea || {},
            }
          },
          pricing: {
            originalValue: {
              groupSizeMin: serviceDetails.groupSizeMin || 1,
              groupSizeMax: serviceDetails.groupSizeMax || 30,
              additionalEntertainerPrice: serviceDetails.additionalEntertainerPrice || 150,
              extraHourRate: serviceDetails.extraHourRate || 0,
              hourlyRate: serviceDetails.hourlyRate || 0,
            }
          },
          listingName: {
            originalValue: supplierData?.data?.name || '',
          },
          ageGroups: {
            originalValue: serviceDetails.ageGroups || [],
          },
          performanceStyles: {
            originalValue: serviceDetails.performanceStyle || [],
          },
          themes: {
            originalValue: serviceDetails.themes || [],
          },
          equipment: {
            originalValue: {
              equipment: serviceDetails.equipment || '',
              specialSkills: serviceDetails.specialSkills || '',
            }
          },
          personalBio: {
            originalValue: serviceDetails.personalBio || {
              yearsExperience: '',
              inspiration: '',
              favoriteEvent: '',
              dreamClient: '',
              personalStory: '',
            }
          },
          addOnServices: {
            originalValue: serviceDetails.addOnServices || [],
          },
          
          // Venue-specific sections
          venueAddress: {
            originalValue: serviceDetails.venueAddress || {
              businessName: '',
              addressLine1: '',
              addressLine2: '',
              city: '',
              postcode: '',
              country: 'United Kingdom'
            },
          },
          venueDetails: {
            originalValue: serviceDetails.venueDetails || {
              parkingInfo: '',
              accessInstructions: '',
              nearestStation: '',
              landmarks: '',
            }
          },
          venueBasicInfo: {
            originalValue: {
              venueType: serviceDetails.venueType || '',
              capacity: serviceDetails.capacity || { min: 10, max: 100, seated: 50, standing: 80 },
              minimumBookingHours: serviceDetails.availability?.minimumBookingHours || 3,
            }
          },
          venuePricing: {
            originalValue: serviceDetails.pricing || {
              hourlyRate: 0,
              cleaningFee: 0,
              securityDeposit: 0,
              minimumSpend: 0,
              setupTime: 60,
              cleanupTime: 60,
              weekendSurcharge: 0,
              peakSeasonSurcharge: 0,
            }
          },
          venueAddOns: {
            originalValue: serviceDetails.addOnServices || [],
          },
          venueItemsPolicy: {
            originalValue: {
              allowedItems: serviceDetails.allowedItems || [],
              restrictedItems: serviceDetails.restrictedItems || [],
            }
          },
          venueHouseRules: {
            originalValue: serviceDetails.houseRules || [],
          },
          venueFacilities: {
            originalValue: {
              facilities: serviceDetails.facilities || [],
              equipment: serviceDetails.equipment || {
                tables: 0,
                chairs: 0,
                soundSystem: false,
                projector: false,
                kitchen: false,
                bar: false,
              }
            }
          },
          venuePolicies: {
            originalValue: {
              policies: serviceDetails.policies || {
                ownFood: true,
                ownDecorations: true,
                alcohol: false,
                smoking: false,
                music: true,
                endTime: "22:00",
                childSupervision: true,
                depositRequired: true,
                cancellationPolicy: "48_hours",
              },
              bookingTerms: serviceDetails.bookingTerms || '',
            }
          }
        };

        // Initialize sections that don't exist yet
        Object.keys(sectionConfigs).forEach(sectionKey => {
          if (!newSections[sectionKey]?.originalValue) {
            newSections[sectionKey] = {
              originalValue: sectionConfigs[sectionKey].originalValue,
              hasChanges: false,
              saving: false,
              lastSaved: null,
              error: null
            };
          }
        });
        
        return newSections;
      });
    }
  }, [supplierData?.serviceDetails]);

  // Helper function to deep compare arrays and objects
  const deepEqual = useCallback((a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, index) => deepEqual(val, b[index]));
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => deepEqual(a[key], b[key]));
    }
    return false;
  }, []);

  // Check for changes when current values change
  const checkChanges = useCallback((sectionKey, currentValue) => {
    setSections(prev => {
      const section = prev[sectionKey];
      if (!section) return prev;
      
      const hasChanges = !deepEqual(currentValue, section.originalValue);
      
      return {
        ...prev,
        [sectionKey]: {
          ...section,
          hasChanges
        }
      };
    });
  }, [deepEqual]);

  // Save function for any section
  const saveSection = useCallback(async (sectionKey, currentValue, updatePayload) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        saving: true,
        error: null
      }
    }));

    try {
      const result = await updateProfile(updatePayload, null, supplier.id);
      
      if (result.success) {
        setSections(prev => ({
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            originalValue: currentValue,
            hasChanges: false,
            saving: false,
            lastSaved: new Date(),
            error: null
          }
        }));
      } else {
        setSections(prev => ({
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            saving: false,
            error: result.error || 'Save failed'
          }
        }));
      }
    } catch (error) {
      setSections(prev => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          saving: false,
          error: error.message
        }
      }));
    }
  }, [updateProfile, supplier.id]);

  // Helper function to get section state
  const getSectionState = useCallback((sectionKey) => {
    return sections[sectionKey] || {
      originalValue: null,
      hasChanges: false,
      saving: false,
      lastSaved: null,
      error: null
    };
  }, [sections]);

  return {
    getSectionState,
    checkChanges,
    saveSection
  };
};
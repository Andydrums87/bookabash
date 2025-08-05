"use client"

import { Button } from "@/components/ui/button"
import { Heart, CheckCircle } from "lucide-react"
import SupplierAvailabilityCalendar from "@/components/supplier/supplier-availability-calendar" // Import the calendar
import { useFavorites } from "@/app/(main)/favorites/hooks/useFavoritesHook"

export default function SupplierSidebar({
  supplier,
  packages,
  selectedPackageId,
  // setSelectedPackageId, // Add if we want to change package from sidebar
  handleAddToPlan,
  getAddToPartyButtonState,
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  credentials,
  isFromDashboard = false,
  partyDate = null,
}) {

  const { toggleFavorite, isFavorite } = useFavorites()
  const isSupplierFavorite = supplier ? isFavorite(supplier.id) : false

  const handleToggleFavorite = () => {
    if (supplier) {
      toggleFavorite(supplier)
    }
  }

  const selectedPkgDetails = packages?.find((pkg) => pkg.id === selectedPackageId)

  const addToPlanButtonState = getAddToPartyButtonState(selectedPackageId)

  // Added credentials prop
  // Use the passed credentials prop if available, otherwise fallback to supplier.serviceDetails
  const verificationDocs =
    credentials?.map((cred) => ({ name: cred.title, verified: cred.verified })) ||
    [
      { name: "DBS Certificate", verified: supplier?.serviceDetails?.certifications?.dbsCertificate },
      { name: "Public Liability Insurance", verified: supplier?.serviceDetails?.certifications?.publicLiability },
      { name: "First Aid Certified", verified: supplier?.serviceDetails?.certifications?.firstAid },
      { name: "ID Verified", verified: supplier?.verified },
    ].filter((doc) => doc.verified !== undefined)

  return (
    <div className="space-y-6 sticky top-8">

      {/* Select Package / Add to Plan Section */}
      {selectedPkgDetails && (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-1">Selected Package</h3>
          <p className="text-md text-gray-800 font-semibold mb-1">{selectedPkgDetails.name}</p>
          <p className="text-lg text-primary-600 font-bold mb-4">£{selectedPkgDetails.price}</p>
          <Button
            className={`w-full py-3 text-base ${addToPlanButtonState.className}`}
            onClick={() => handleAddToPlan()} // handleAddToPlan might not need packageId if it uses selectedPackageId from page
            disabled={addToPlanButtonState.disabled}
          >
            {addToPlanButtonState.text}
          </Button>
        </div>
      )}
      {/* Availability Calendar Section */}
      {supplier && (
        <SupplierAvailabilityCalendar
          supplier={supplier}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isFromDashboard={isFromDashboard}
          partyDate={partyDate}
          readOnly={isFromDashboard}
        />
      )}

      {/* Verification Documents Section */}
      {verificationDocs && verificationDocs.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-4">Verification documents</h3>
          <ul className="space-y-3">
            {verificationDocs.map((doc) => (
              <li key={doc.name} className="flex items-center">
                <CheckCircle
                  className={`w-5 h-5 mr-3 ${doc.verified ? "text-green-500" : "text-gray-300"}`}
                  fill={doc.verified ? "currentColor" : "none"}
                />
                <span className={`${doc.verified ? "text-gray-700" : "text-gray-400"}`}>{doc.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}


      {/* Add to Favorites Button */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <Button 
          variant="outline" 
          className={`w-full py-3 text-base transition-all duration-200 ${
            isSupplierFavorite 
              ? 'border-primary-300 bg-pink-50 text-primary-700 hover:bg-[hsl(var(--primary-50))]' 
              : 'border-gray-300 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))]'
          }`}
          onClick={handleToggleFavorite}
        >
          <Heart 
            className={`w-5 h-5 mr-2 transition-all duration-200 ${
              isSupplierFavorite 
                ? 'fill-[hsl(vaR(--primary-500))] text-primary-500' 
                : 'text-gray-500'
            }`} 
          />
          {isSupplierFavorite ? 'Remove from favorites' : 'Add to favorites'}
        </Button>
      </div>
    
    </div>
  )
}

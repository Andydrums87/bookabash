import { PoundSterling } from "lucide-react"

const PartySummarySection = ({ 
  partyDetails, 
  suppliers, 
  totalCost
}) => {
  // Get booked suppliers
  const bookedSuppliers = Object.entries(suppliers)
    .filter(([type, supplier]) => supplier !== null)
    .map(([type, supplier]) => ({
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1'),
      supplier
    }))

  if (bookedSuppliers.length === 0) {
    return null
  }

  const childName = partyDetails.childName || partyDetails.firstName || "Your child"
  
  return (
    <div className="relative rounded-xl bg-primary-500 p-6 mb-8 overflow-hidden md:hidden" data-tour="party-summary">
      {/* Background decorative images */}
      <img src="/Union.png" alt="" className="absolute top-0 right-0 h-30 opacity-60" />
      <img src="/circles-top.png" alt="" className="absolute bottom-[-10px] left-0 h-12 opacity-60" />
      
      {/* Header - moved down and removed Snappy */}
      <div className="relative z-10 mb-8 mt-6">
        <h3 className="text-4xl font-bold text-white leading-tight mb-3 drop-shadow-lg">
          Meet {childName}'s<br />Party Team!
        </h3>
        <p className="text-white/90 text-lg drop-shadow">Here are your chosen suppliers</p>
      </div>

      {/* Suppliers List */}
      <div className="relative z-10 space-y-3 mb-6">
        {bookedSuppliers.map(({ type, name, supplier }) => (
          <div key={type} className="flex items-center justify-between p-4 bg-white/15 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
            <div>
              <div className="font-bold text-white text-lg drop-shadow">{name}</div>
              <div className="text-white/80 drop-shadow">{supplier.name}</div>
            </div>
            <div className="text-white font-bold text-xl drop-shadow">
              £{supplier.price}
            </div>
          </div>
        ))}
      </div>

      {/* Total Cost */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/40 shadow-lg">
          <div className="flex items-center gap-2">
            <PoundSterling className="w-6 h-6 text-white drop-shadow" />
            <span className="text-xl font-bold text-white drop-shadow">Total Party Cost</span>
          </div>
          <div className="text-3xl font-bold text-white drop-shadow">
            £{totalCost.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Bottom message */}
      <div className="relative z-10">
        <p className="text-center text-white/90 font-semibold text-lg drop-shadow">
          Your dream team is ready to make this party amazing!
        </p>
      </div>
    </div>
  )
}

export default PartySummarySection

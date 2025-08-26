import { useState, useEffect } from "react"
import { ArrowRight, Sparkles, Star, X } from "lucide-react"
import Image from "next/image"

const PartyTeamShowcase = ({ 
  currentStepData, 
  suppliers = {}, 
  partyDetails = {}, 
  totalCost = 0, 
  onContinue, 
  onClose 
}) => {
  const [currentSupplier, setCurrentSupplier] = useState(0)
  const [showingSuppliers, setShowingSuppliers] = useState(false)
  
  // Get only the suppliers that are actually booked
  const bookedSuppliers = Object.entries(suppliers)
    .filter(([type, supplier]) => supplier !== null)
    .map(([type, supplier]) => ({
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1'),
      supplier
    }))

  const hasSuppliers = bookedSuppliers.length > 0
  const childName = partyDetails.childName || partyDetails.firstName || "your child"

  // Auto-progress through suppliers
  useEffect(() => {
    if (!showingSuppliers || bookedSuppliers.length === 0) return

    const timer = setTimeout(() => {
      if (currentSupplier < bookedSuppliers.length - 1) {
        setCurrentSupplier(currentSupplier + 1)
      } else {
        // Finished showing all suppliers, move to summary
        setTimeout(() => {
          setShowingSuppliers(false)
        }, 2000)
      }
    }, 2500) // Show each supplier for 2.5 seconds

    return () => clearTimeout(timer)
  }, [currentSupplier, showingSuppliers, bookedSuppliers.length])

  const startShowcase = () => {
    setShowingSuppliers(true)
    setCurrentSupplier(0)
  }

  if (!hasSuppliers) {
    // No suppliers yet - show encouraging message
    return (
      <>
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600">
          <div className="absolute inset-0 overflow-hidden">
            <Sparkles className="absolute top-20 left-10 w-6 h-6 text-white opacity-30 animate-pulse" />
            <Star className="absolute top-32 right-20 w-4 h-4 text-yellow-300 opacity-50 animate-bounce" />
            <Sparkles className="absolute bottom-40 left-1/4 w-5 h-5 text-pink-300 opacity-40 animate-pulse" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center text-white">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755719830/bs2klexzuin8ygfndexc.png"
                  alt="Snappy waving"
                  width={80}
                  height={80}
                />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {childName}'s Party is Starting to Take Shape!
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Your party is looking good, but let's add some suppliers to make it truly amazing!
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
              <p className="text-lg mb-4">Ready to build your dream party team?</p>
              <p className="text-white/80">I'll help you find the perfect suppliers for an unforgettable celebration!</p>
            </div>

            <button
              onClick={onContinue}
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/90 transition-all duration-200 flex items-center gap-2"
            >
              Let's Build This Party!
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600">
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <Sparkles className="absolute top-20 left-10 w-6 h-6 text-white opacity-30 animate-pulse" />
          <Star className="absolute top-32 right-20 w-4 h-4 text-yellow-300 opacity-50 animate-bounce" />
          <Sparkles className="absolute bottom-40 left-1/4 w-5 h-5 text-pink-300 opacity-40 animate-pulse" />
          <Star className="absolute bottom-60 right-1/3 w-3 h-3 text-white opacity-30 animate-ping" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center text-white">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          {!showingSuppliers ? (
            // Opening screen
            <div className="animate-fade-in">
              <div className="mb-8">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image
                    src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755719830/bs2klexzuin8ygfndexc.png"
                    alt="Snappy excited"
                    width={80}
                    height={80}
                  />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Ladies and Gentlemen...
                </h1>
                <p className="text-xl text-white/90 mb-8">
                  Presenting {childName}'s incredible party dream team!
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
                <p className="text-lg mb-2">{bookedSuppliers.length} amazing supplier{bookedSuppliers.length !== 1 ? 's' : ''} ready to make magic happen</p>
                <p className="text-2xl font-bold text-yellow-300">£{totalCost} total</p>
              </div>

              <button
                onClick={startShowcase}
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/90 transition-all duration-200 flex items-center gap-2"
              >
                Meet Your Team!
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          ) : currentSupplier < bookedSuppliers.length ? (
            // Showing individual suppliers
            <div className="animate-fade-in" key={currentSupplier}>
              <div className="mb-6">
                <div className="text-lg text-white/80 mb-2">
                  {currentSupplier + 1} of {bookedSuppliers.length}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {bookedSuppliers[currentSupplier].name}
                </h2>
              </div>

              <div className="bg-white rounded-2xl p-6 mb-6 max-w-sm mx-auto shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-2xl">🎉</div>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">
                  {bookedSuppliers[currentSupplier].supplier.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {bookedSuppliers[currentSupplier].supplier.shortDescription || 
                   `Your ${bookedSuppliers[currentSupplier].name.toLowerCase()} specialist`}
                </p>
                <div className="text-2xl font-bold text-teal-600">
                  £{bookedSuppliers[currentSupplier].supplier.price}
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                {bookedSuppliers.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index <= currentSupplier ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Final summary
            <div className="animate-fade-in">
              <div className="mb-8">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-6xl">🎊</div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {childName}'s party is going to be AMAZING!
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  With {bookedSuppliers.length} incredible supplier{bookedSuppliers.length !== 1 ? 's' : ''} on your team, this celebration will be unforgettable!
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
                <div className="text-3xl font-bold text-yellow-300 mb-2">£{totalCost}</div>
                <p className="text-white/80">Total investment in pure party magic</p>
              </div>

              <button
                onClick={onContinue}
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/90 transition-all duration-200 flex items-center gap-2"
              >
                Show Me My Dashboard!
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </>
  )
}

export default PartyTeamShowcase
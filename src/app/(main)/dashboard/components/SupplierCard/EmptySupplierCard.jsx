"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Lightbulb, Sparkles, Star, Heart, Smile, Gift, Camera, Music, Search, Info } from "lucide-react"
import { calculateFinalPrice } from '@/utils/unifiedPricing'

// Generic category images mapping
const CATEGORY_IMAGES = {
  venue: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1759827489/axdrlu8nswmpbrdgra6c.jpg",
  entertainment: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460635/edson-junior-YlgnX_ISPLo-unsplash_wlsz60.jpg",
  cakes: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753224729/hpvtz7jiktglaxcivftv.jpg",
  catering: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1760617877/iStock-530205524_tjmnq7.jpg",
  facePainting: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1755590150/howzjwfgpd9swhvcwqke.jpg",
  activities: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386709/bouncy-castle-3587770_640_dhjv02.webp",
  partyBags: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386272/iStock-2212524051_v1njlh.jpg",
  decorations: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1760617929/iStock-1463458517_vqltq9.jpg",
  balloons: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381160/iStock-1564856102_abqkpd.jpg"
}

// Snappy's expert tips for each category
const CATEGORY_TIPS = {
  venue: {
    title: "Snappy's Venue Wisdom",
    intro: "After organizing thousands of parties, I've learned that choosing the right venue is one of the most important decisions you'll make.",
    tips: [
      "A dedicated party venue handles setup and cleanup, allowing you to focus on enjoying the celebration with your child",
      "Indoor venues eliminate weather concerns, ensuring your party runs smoothly regardless of conditions",
      "Many venues come equipped with entertainment areas, saving you time and money on additional equipment",
      "Professional venues provide excellent photo opportunities with purpose-built party spaces",
      "Venues with catering facilities streamline food service and reduce logistical stress"
    ],
    conclusion: "In my experience, parents who book professional venues report significantly less stress and more enjoyment on party day."
  },
  entertainment: {
    title: "Snappy's Entertainment Insight",
    intro: "Professional entertainment is the difference between a good party and an unforgettable one.",
    tips: [
      "Skilled entertainers manage transitions and maintain energy throughout the event",
      "Professional performers engage even the shyest children through proven interactive techniques",
      "Entertainment provides structure to your party timeline, eliminating awkward gaps",
      "Quality entertainment creates memorable moments that children discuss for weeks afterward",
      "Having a professional entertainer allows you to be present as a parent rather than managing activities"
    ],
    conclusion: "Investment in professional entertainment consistently delivers the highest satisfaction ratings from both parents and children."
  },
  cakes: {
    title: "Snappy's Cake Expertise",
    intro: "The birthday cake represents the emotional centerpiece of your celebration and deserves careful consideration.",
    tips: [
      "The cake cutting ceremony creates the most photographed moment of any party",
      "Custom-designed cakes make your child feel uniquely celebrated on their special day",
      "Professional bakers ensure exceptional taste alongside visual appeal",
      "A themed cake reinforces your party concept and creates cohesive memories",
      "Quality cakes accommodate dietary requirements while maintaining design integrity"
    ],
    conclusion: "A professionally crafted cake transforms a simple dessert into a meaningful memory that your child will treasure."
  },
  catering: {
    title: "Snappy's Catering Recommendation",
    intro: "Professional catering eliminates one of the most stressful aspects of party planning while elevating the experience.",
    tips: [
      "Catering removes the burden of shopping, preparation, and cooking from your schedule",
      "Professional caterers expertly manage dietary requirements and allergies",
      "Quality presentation makes a positive impression on attending parents",
      "Timed food service ensures hot dishes arrive at optimal temperature",
      "Many caterers include cleanup and waste management in their service"
    ],
    conclusion: "Parents who invest in catering consistently report a 70% reduction in party-day stress levels."
  },
  facePainting: {
    title: "Snappy's Face Painting Analysis",
    intro: "Face painting serves multiple strategic purposes at children's parties beyond simple decoration.",
    tips: [
      "Children become emotionally invested in the party through character transformation",
      "Face painting naturally manages early arrival staggering, preventing crowd congestion",
      "Professional face painters use safe, tested materials and maintain hygiene standards",
      "Painted faces encourage imaginative play and interaction between children",
      "The face painting station can entertain groups for extended periods, typically 60-90 minutes"
    ],
    conclusion: "Face painting represents excellent value, providing both entertainment and photographic opportunities throughout your event."
  },
  activities: {
    title: "Snappy's Activities Strategy",
    intro: "Structured activities are essential for maintaining engagement and preventing chaos at children's parties.",
    tips: [
      "Planned activities provide purpose during natural energy transitions throughout the event",
      "Age-appropriate games facilitate social interaction between children who may not know each other",
      "Structured entertainment reduces screen time temptation and keeps children present",
      "Craft activities can double as party favors, adding value to your investment",
      "Professional activity coordination allows you to supervise rather than constantly direct"
    ],
    conclusion: "Research shows parties with structured activities receive 90% higher satisfaction ratings from parents."
  },
  partyBags: {
    title: "Snappy's Party Bag Philosophy",
    intro: "Party bags represent your last impression and significantly influence how guests remember your celebration.",
    tips: [
      "Quality party bags extend the party experience into children's homes for days afterward",
      "Thoughtful bags create positive impressions with attending parents, reflecting your attention to detail",
      "Well-curated bags offer healthier alternatives to standard candy-filled options",
      "Themed bag contents reinforce your party concept and create cohesive memories",
      "Children often keep favored party bag items for months, creating lasting associations with your event"
    ],
    conclusion: "85% of children retain party bag items for extended periods, making this investment in memory creation worthwhile."
  },
  decorations: {
    title: "Snappy's Decoration Perspective",
    intro: "Strategic decoration transforms ordinary spaces into immersive party environments that captivate young imaginations.",
    tips: [
      "Professional decorations create photo-worthy backgrounds that enhance your memory collection",
      "Immediate visual impact upon arrival sets the celebratory tone for the entire event",
      "Themed decorations help children mentally transition into party mode",
      "Quality decorations photograph exceptionally well, improving your event documentation",
      "Many decoration elements can be repurposed as bedroom decor, extending their value"
    ],
    conclusion: "Studies indicate children rate decorated parties as more enjoyable, even when other elements remain constant."
  },
  balloons: {
    title: "Snappy's Balloon Assessment",
    intro: "Balloons create instant festive atmosphere while serving multiple practical purposes at parties.",
    tips: [
      "Balloon installations like arches make entrances feel special and indicate the party location",
      "Balloons provide versatile photo booth backgrounds at minimal cost",
      "Helium balloons can serve double duty as both decoration and take-home favors",
      "Color schemes reinforce your theme while adding visual interest to any space",
      "Balloons appeal universally across age groups, from toddlers to pre-teens"
    ],
    conclusion: "Balloons offer exceptional value as decorative elements, creating significant visual impact relative to investment."
  }
}

// Tips Modal Component
function SupplierTipsModal({ isOpen, onClose, category }) {
  if (!isOpen || !category) return null

  const tips = CATEGORY_TIPS[category] || CATEGORY_TIPS.venue

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">{tips.title}</h2>
          <p className="text-white/90 leading-relaxed">{tips.intro}</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-280px)]">
          {/* Single box with all tips */}
          <div className="bg-white rounded-xl p-5 ">
            <ul className="space-y-4">
              {tips.tips.map((tip, idx) => (
                <li key={idx} className="text-gray-700 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary-500 before:font-bold">
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Conclusion */}
          <div className="mt-6 bg-primary-50 border border-[hsl(var(--primary-200))] rounded-xl p-5">
            <p className="text-gray-800 leading-relaxed italic">
              {tips.conclusion}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            className="w-full bg-primary-500 hover:from-[hsl(var(--primary-600)] hover:to-[hsl(var(--primary-700)] text-white font-semibold py-3 rounded-xl"
          >
            Thanks Snappy!
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function EmptySupplierCard({
  type,
  recommendedSupplier,
  partyDetails,
  openSupplierModal,
  onAddSupplier,
  getSupplierDisplayName,
  currentPhase = "planning",
  isSignedIn = false,
  isCompact = false,
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [showTipsModal, setShowTipsModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleAddToParty = async (e) => {
    e.stopPropagation()
    if (!recommendedSupplier || isAdding) return
    
    console.log('🎯 [EmptySupplierCard] Starting to add supplier...', recommendedSupplier.name)
    setIsAdding(true)
    
    try {
      console.log('📞 [EmptySupplierCard] Calling onAddSupplier...')
      await onAddSupplier(type, recommendedSupplier)
      console.log('✅ [EmptySupplierCard] onAddSupplier completed!')
    } catch (error) {
      console.error('❌ [EmptySupplierCard] Error adding supplier:', error)
      setIsAdding(false)
    }
  }

  const getDisplayName = (supplierType) => {
    if (getSupplierDisplayName) {
      return getSupplierDisplayName(supplierType)
    }
    const displayNames = {
      venue: "Venue",
      entertainment: "Entertainment", 
      catering: "Catering",
      facePainting: "Face Painting",
      activities: "Activities",
      decorations: "Decorations",
      balloons: "Balloons",
      cakes: "Cakes",
      partyBags: "Party Bags",
    }
    return displayNames[supplierType] || supplierType.charAt(0).toUpperCase() + supplierType.slice(1)
  }

  // Calculate pricing for the recommended supplier
  const pricing = useMemo(() => {
    if (!recommendedSupplier) return { finalPrice: 0 }
    return calculateFinalPrice(recommendedSupplier, partyDetails, [])
  }, [recommendedSupplier, partyDetails])

  // Get generic image for this category
  const genericImage = CATEGORY_IMAGES[type] || `/placeholder.svg`
  const categoryDisplayName = getDisplayName(type)

  // Compact skeleton
  if (!isMounted || !recommendedSupplier) {
    return (
      <Card className={`overflow-hidden rounded-2xl border-2 border-white shadow-xl ${
        isCompact ? 'h-48' : 'h-80'
      }`}>
        <div className={`relative w-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ${
          isCompact ? 'h-32' : 'h-64'
        }`} />
        <div className={`bg-white ${isCompact ? 'p-3' : 'p-6'}`}>
          <div className={`bg-gray-200 rounded animate-pulse ${
            isCompact ? 'h-8' : 'h-12'
          }`} />
        </div>
      </Card>
    )
  }

  // Compact mode - shorter card
  if (isCompact) {
    return (
      <>
        <Card 
          className="overflow-hidden bg-gray-300 rounded-xl border-2 border-gray-300 shadow-lg transition-all duration-300 relative group hover:shadow-xl hover:border-primary-400 opacity-75 hover:opacity-90 h-56"
        >
          <div className="relative h-36 w-full">
            {/* Generic Category Image */}
            <div className="absolute inset-0">
              <Image
                src={genericImage}
                alt={categoryDisplayName}
                fill
                className="object-cover grayscale-[30%] opacity-70 group-hover:grayscale-[30%] group-hover:opacity-60 transition-all"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/80" />

                        {/* Info icon for tips */}
                        <button
              onClick={(e) => {
                e.stopPropagation()
                setShowTipsModal(true)
              }}
              className="absolute top-2 right-2 z-10 w-8 h-8 bg-primary-500 hover:bg-primary-600 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
              title="Why add this?"
            >
              <Info className="w-4 h-4 text-white" />
            </button>


            {/* Category badge */}
            {/* <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-gray-900 text-white text-xs shadow-lg">
                {categoryDisplayName}
              </Badge>
            </div> */}

            {/* Category name and pricing */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              <h3 className="text-3xl font-bold text-white/90 truncate drop-shadow-lg">
                {categoryDisplayName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {/* <span className="text-lg font-black text-white/90 drop-shadow-lg">
                  £{pricing.finalPrice}
                </span> */}
              </div>
            </div>
          </div>

          {/* Compact button */}
          <div className="p-3">
            <Button
              className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white text-sm py-2 shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleAddToParty}
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <div className="relative w-4 h-4 mr-2">
                    <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="animate-pulse text-xs">Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">Click to Add</span>
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Tips Modal */}
        <SupplierTipsModal
          isOpen={showTipsModal}
          onClose={() => setShowTipsModal(false)}
          category={type}
        />
      </>
    )
  }

  // Full size mode - taller image
  return (
    <>
      <Card 
        className="overflow-hidden bg-gray-300 rounded-2xl border-2 border-gray-300 shadow-lg transition-all duration-300 relative group hover:shadow-xl hover:border-primary-400 opacity-75 hover:opacity-90"
      >
        <div className="relative h-70 w-full">
          {/* Generic Category Image */}
          <div className="absolute inset-0">
            <Image
              src={genericImage}
              alt={categoryDisplayName}
              fill
              className="object-cover grayscale-[30%] opacity-70 group-hover:grayscale-[30%] group-hover:opacity-60 transition-all"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          </div>

          {/* Darker overlay for greyed effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/80" />

           {/* Info icon for tips */}
           <button
              onClick={(e) => {
                e.stopPropagation()
                setShowTipsModal(true)
              }}
              className="absolute top-2 cursor-pointer right-2 z-10 w-8 h-8  hover:bg-primary-600 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
              title="Why add this?"
            >
              <Info className="w-6 h-6 text-white" />
            </button>

          {/* Category badge */}
          {/* <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-gray-900 text-white shadow-lg backdrop-blur-sm">
              {categoryDisplayName}
            </Badge>
          </div> */}

          {/* Category name and pricing */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <div className="text-white/90">
              <h3 className="text-4xl font-bold mb-2 drop-shadow-lg text-white/80">
                {categoryDisplayName}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="text-white/80">
                  <div className="flex items-center gap-2">
                    {/* Price removed as per your original code */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section with single CTA */}
        <div className="p-6">
          <Button
            className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            size="lg"
            onClick={handleAddToParty}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <div className="relative w-5 h-5 mr-2">
                  <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <span className="animate-pulse">Adding to your party...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Click to Add
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Tips Modal */}
      <SupplierTipsModal
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        category={type}
      />
    </>
  )
}
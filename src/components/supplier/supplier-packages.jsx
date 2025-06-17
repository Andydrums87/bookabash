"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

const PackageCard = ({ pkg, isSelected, onSelect }) => {
  return (
    <div
      className={`bg-white rounded-3xl p-4 pt-0 flex flex-col text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden ${
        isSelected ? "ring-2 ring-[#ff795b]" : ""
      }`}
      onClick={() => onSelect(pkg.id)}
    >
      {/* SVG Clip Path defined locally for this card */}
      <svg
        width="0"
        height="0"
        style={{
          position: "absolute",
          overflow: "hidden",
          top: "-9999px",
          left: "-9999px",
        }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`funCloudClip-${pkg.id}`} clipPathUnits="objectBoundingBox">
            <circle cx="0.5" cy="0.5" r="0.35" />
            <circle cx="0.5" cy="0.2" r="0.2" />
            <circle cx="0.75" cy="0.35" r="0.22" />
            <circle cx="0.7" cy="0.65" r="0.2" />
            <circle cx="0.5" cy="0.8" r="0.22" />
            <circle cx="0.25" cy="0.65" r="0.2" />
            <circle cx="0.3" cy="0.35" r="0.22" />
          </clipPath>
        </defs>
      </svg>

      {/* Image container with clip path */}
      <div className="relative w-full h-56 md:h-70 mx-auto mb-4 -mt-px">
        <div
          className="absolute inset-5"
          style={{
            clipPath: `url(#funCloudClip-${pkg.id})`,
            WebkitClipPath: `url(#funCloudClip-${pkg.id})`,
          }}
        >
          <Image
            src={pkg.image || pkg.imageUrl || `/placeholder.svg?height=256&width=256&query=${pkg.name.replace(/\s+/g, "+")}+package`}
            alt={pkg.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </div>
      
      <h3 className="font-bold text-xl text-gray-800 truncate mb-1 px-2">{pkg.name}</h3>
      <p className="text-md text-gray-500 mb-3">From £{pkg.price}</p>


      
      <div className="flex flex-wrap justify-center items-center gap-2 mb-4 px-2 min-h-[44px]">
        {pkg.features.slice(0, 3).map((feature, i) => (
          <span key={i} className="bg-[#fff0ee] text-gray-900 text-xs font-medium px-2.5 py-1 rounded-full">
            {feature}
          </span>
        ))}
      </div>
      
      <Button
        variant="default"
        className="mt-auto w-full bg-primary text-white hover:bg-[#db4a28] py-3 rounded-xl text-base font-semibold"
        onClick={(e) => {
          e.stopPropagation()
          onSelect(pkg.id)
        }}
      >
        View more
      </Button>
      
      {isSelected && (
        <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-1.5 shadow-md">
          <CheckCircle size={18} />
        </div>
      )}
    </div>
  )
}

export default function SupplierPackages({ packages, selectedPackageId, setSelectedPackageId }) {
  if (!packages || packages.length === 0) {
    return null
  }

  console.log('Raw packages data:', packages) // Debug log to see original data
  
  // Use packages as-is, don't modify the image property
  const packagesData = packages

  return (
    <div className="px-4 md:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Package</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
        {packagesData.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            isSelected={pkg.id === selectedPackageId}
            onSelect={setSelectedPackageId}
          />
        ))}
      </div>
    </div>
  )
}
// app/browse/page.js - Server Component (Pure JavaScript)
import { Suspense } from 'react'
import { getSuppliers } from '@/lib/suppliers-api'
import BrowseSuppliersClient from './browse-suppliers-client'
import { Skeleton } from "@/components/ui/skeleton"

// Enable ISR - page will be statically generated and revalidated
export const revalidate = 3600 // Revalidate every hour

export default async function BrowsePage() {
  // This runs at build time and periodically when revalidating
  const initialSuppliers = await getSuppliers()
  
  return (
    <>
      {/* SEO-friendly structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Browse Party Suppliers",
            "description": `Find ${initialSuppliers.length} trusted party suppliers`,
            "provider": {
              "@type": "Organization",
              "name": "PartySnap",
              "url": "https://partysnap.co.uk"
            },
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": initialSuppliers.length,
              "itemListElement": initialSuppliers.slice(0, 10).map((supplier, index) => ({
                "@type": "Service",
                "position": index + 1,
                "name": supplier.name,
                "description": supplier.description,
                "provider": {
                  "@type": "Organization", 
                  "name": supplier.name
                },
                "offers": {
                  "@type": "Offer",
                  "price": supplier.priceFrom,
                  "priceCurrency": "GBP"
                }
              }))
            }
          })
        }}
      />
      
      <Suspense fallback={<MinimalFallback />}>
        <BrowseSuppliersClient initialSuppliers={initialSuppliers} />
      </Suspense>
    </>
  )
}

function MinimalFallback() {
  return (
    <div className="min-h-screen bg-[#fef7f7]">
    
           {/* Hero Section - Mobile Optimized Heights */}
           <div 
        className="relative w-full h-[36vh] md:h-[50vh]  overflow-hidden"
      >      
     <div  style={{
        backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px, cover',
        backgroundPosition: 'center',
      }} className="w-full h-full absolute bg-gradient-to-br from-[hsl(var(--primary-300))] to-[hsl(var(--primary-400))]">

  </div>
        {/* Strong dark overlay */}
        <div className="absolute inset-0 bg-black/1"></div>

        {/* Hero Content Overlay */}
        <div className="relative h-full flex justify-center px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="mt-5 md:mt-10 md:text-6xl text-4xl font-extrabold mb-3 md:mb-6 drop-shadow-2xl text-shadow-lg">
              Find trusted
              <span className="text-white block drop-shadow-2xl"><span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">Party</span> Suppliers</span>
            </h1>
            <p className="md:text-xl py-5 mb-4 md:mb-8  md:w-[70%] mx-auto leading-relaxed drop-shadow-2xl font-semibold text-shadow-md">
              Create magical moments. Everything you need for the perfect party, all in one place.
            </p>
          </div>
        </div>

        {/* Bottom fade for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-6 md:h-12 bg-gradient-to-t from-white to-transparent" />

      </div>
    </div>
  )
}

// Generate metadata with real data
export async function generateMetadata() {
  const suppliers = await getSuppliers()
  const categories = [...new Set(suppliers.map(s => s.category))]
  
  return {
    title: `Browse ${suppliers.length} Party Suppliers | PartySnap`,
    description: `Find trusted party suppliers in ${categories.join(', ')}. ${suppliers.length} verified suppliers including entertainers, venues, catering and decorations.`,
    keywords: `party suppliers, ${categories.join(', ')}, party planning, entertainment, venues`,
    openGraph: {
      title: `${suppliers.length} Party Suppliers Ready to Party!`,
      description: `Browse verified party suppliers across ${categories.length} categories`,
      images: ['/og-browse-suppliers.jpg'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Browse ${suppliers.length} Party Suppliers`,
      description: `Find trusted party suppliers in your area`,
    }
  }
}
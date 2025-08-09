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
      
  
        <BrowseSuppliersClient initialSuppliers={initialSuppliers} />

    </>
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
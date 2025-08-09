// app/supplier/[id]/page.js - Server Component (Pure JavaScript)
import { notFound } from 'next/navigation'
import { getSupplierById, getRelatedSuppliers } from '@/lib/suppliers-api'
import SupplierPageClient from './supplier-page-client'

// This runs on the server and generates the page with full content
export default async function SupplierPage({ params, searchParams }) {

  const resolvedSearchParams = await searchParams
  try {
    // Fetch supplier data on the server
    const supplier = await getSupplierById(params.id)
    
    if (!supplier) {
      notFound()
    }

    // Fetch related suppliers for recommendations
    const relatedSuppliers = await getRelatedSuppliers(supplier.category, supplier.id)

    return (
      <>
        {/* Critical: Add structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": supplier.name,
              "description": supplier.description,
              "image": supplier.image,
              "address": {
                "@type": "PostalAddress",
                "addressLocality": supplier.location,
                "addressCountry": "GB"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": supplier.rating,
                "reviewCount": supplier.reviewCount,
                "bestRating": "5",
                "worstRating": "1"
              },
              "offers": {
                "@type": "Offer",
                "price": supplier.priceFrom,
                "priceCurrency": "GBP",
                "description": `Starting from £${supplier.priceFrom} ${supplier.priceUnit}`
              },
              "serviceType": supplier.category,
              "areaServed": supplier.location,
              "url": `https://partysnap.co.uk/supplier/${supplier.id}`
            })
          }}
        />
        
        <SupplierPageClient 
        backendSupplier={supplier}
        relatedSuppliers={relatedSuppliers}
        navigationContext={resolvedSearchParams.from || 'direct'}  // ✅ Fixed
      />
      </>
    )
  } catch (error) {
    console.error('Error loading supplier:', error)
    notFound()
  }
}

// Generate metadata for SEO - this is crucial!
export async function generateMetadata({ params }) {
  try {
    const supplier = await getSupplierById(params.id)
    
    if (!supplier) {
      return {
        title: 'Supplier Not Found | PartySnap'
      }
    }

    const title = `${supplier.name} - ${supplier.category} | PartySnap`
    const description = `${supplier.description} Located in ${supplier.location}. Starting from £${supplier.priceFrom}. Rated ${supplier.rating}/5 by ${supplier.reviewCount} customers.`

    return {
      title,
      description,
      keywords: [
        supplier.name,
        supplier.category,
        supplier.location,
        ...supplier.themes,
        'party supplier',
        'birthday party',
        supplier.subcategory
      ].filter(Boolean).join(', '),
      
      openGraph: {
        title,
        description,
        images: [
          {
            url: supplier.image,
            width: 800,
            height: 600,
            alt: supplier.name,
          }
        ],
        type: 'website',
        siteName: 'PartySnap',
      },
      
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [supplier.image],
      }
    }
  } catch (error) {
    return {
      title: 'Supplier | PartySnap'
    }
  }
}

// Generate static paths for popular suppliers (optional but good for performance)
export async function generateStaticParams() {
  try {
    // Get your most popular suppliers for pre-generation
    const popularSuppliers = await getPopularSuppliers(50) // Top 50 suppliers
    
    return popularSuppliers.map((supplier) => ({
      id: supplier.id,
    }))
  } catch (error) {
    return []
  }
}

// Enable ISR for this page
export const revalidate = 3600 // Revalidate every hour
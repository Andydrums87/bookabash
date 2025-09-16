// app/preview/supplier/[id]/hooks/useSupplierData.js
"use client"

import { useState, useEffect, useMemo } from "react"

export function useSupplierData(backendSupplier) {
  const [isLoading, setIsLoading] = useState(true)
  
  // Process the supplier data
  const supplier = useMemo(() => {
    if (!backendSupplier) return null

    return {
      ...backendSupplier,
      // Ensure we have default values for preview
      rating: backendSupplier.rating || 4.8,
      reviewCount: backendSupplier.reviewCount || 23,
      responseTime: backendSupplier.responseTime || "within 2 hours",
      bookingSuccess: backendSupplier.bookingSuccess || 95,
      yearsExperience: backendSupplier.yearsExperience || 5,
    }
  }, [backendSupplier])

  // Process packages
  const packages = useMemo(() => {
    if (!backendSupplier?.packages) return []
    
    return backendSupplier.packages.map(pkg => ({
      ...pkg,
      // Ensure packages have required fields for preview
      id: pkg.id || `preview-${Math.random()}`,
      name: pkg.name || 'Standard Package',
      price: pkg.price || 150,
      priceUnit: pkg.priceUnit || 'per party',
      duration: pkg.duration || '2 hours',
      description: pkg.description || 'Our most popular package with everything you need for an amazing party!',
      features: pkg.features || [
        'Professional entertainment',
        'Age-appropriate activities',
        'Party music playlist',
        'Setup and cleanup'
      ]
    }))
  }, [backendSupplier?.packages])

  // Process portfolio images
  const portfolioImages = useMemo(() => {
    if (!backendSupplier?.portfolioImages) return []
    return backendSupplier.portfolioImages.slice(0, 12) // Limit for performance
  }, [backendSupplier?.portfolioImages])

  // Process credentials
  const credentials = useMemo(() => {
    return backendSupplier?.credentials || [
      { type: 'insurance', name: 'Public Liability Insurance', verified: true },
      { type: 'dbs', name: 'Enhanced DBS Check', verified: true },
    ]
  }, [backendSupplier?.credentials])

  // Process reviews
  const reviews = useMemo(() => {
    return backendSupplier?.reviews || [
      {
        id: 'preview-1',
        rating: 5,
        comment: 'Absolutely fantastic! The kids had the best time and the entertainer was professional and engaging.',
        author: 'Sarah M.',
        date: '2024-12-15',
        verified: true
      },
      {
        id: 'preview-2',
        rating: 5,
        comment: 'Highly recommend! Great value for money and excellent communication throughout.',
        author: 'Mike T.',
        date: '2024-12-10',
        verified: true
      },
      {
        id: 'preview-3',
        rating: 4,
        comment: 'Really good entertainment, kids were engaged throughout the whole party.',
        author: 'Emma L.',
        date: '2024-12-05',
        verified: true
      }
    ].slice(0, 10) // Limit reviews for performance
  }, [backendSupplier?.reviews])

  // Check if cake supplier
  const isCakeSupplier = useMemo(() => {
    return backendSupplier?.category?.toLowerCase().includes('cake') || 
           backendSupplier?.subcategory?.toLowerCase().includes('cake') ||
           backendSupplier?.services?.some(service => 
             service.toLowerCase().includes('cake')
           ) || false
  }, [backendSupplier])

  useEffect(() => {
    if (backendSupplier) {
      setIsLoading(false)
    }
  }, [backendSupplier])

  return {
    supplier,
    packages,
    portfolioImages,
    credentials,
    reviews,
    isCakeSupplier,
    isLoading,
    error: null
  }
}
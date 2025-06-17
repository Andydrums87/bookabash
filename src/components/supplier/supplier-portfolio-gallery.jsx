"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ChevronLeft, ChevronRight, Grid3X3, XIcon } from "lucide-react"

export default function SupplierPortfolioGallery({ portfolioImages }) {
  const [showGallerySheet, setShowGallerySheet] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [visibleImageCount, setVisibleImageCount] = useState(6)

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeImageModal()
        setShowGallerySheet(false)
      }
    }
    
    if (selectedImage || showGallerySheet) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [selectedImage, showGallerySheet])

  useEffect(( ) => {
    console.log(selectedImage + "hello")
  }, [])

  const openImageModal = (image, index) => {
    setSelectedImage(image)
    setSelectedImageIndex(index)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  const navigateImage = (direction) => {
    let newIndex = selectedImageIndex
    if (direction === "next") {
      newIndex = (selectedImageIndex + 1) % portfolioImages.length
    } else {
      newIndex = (selectedImageIndex - 1 + portfolioImages.length) % portfolioImages.length
    }
    setSelectedImageIndex(newIndex)
    setSelectedImage(portfolioImages[newIndex])
  }

  const loadMoreImages = () => setVisibleImageCount((prev) => Math.min(prev + 6, portfolioImages.length))
  const showLessImages = () => setVisibleImageCount(6)

  if (!portfolioImages || portfolioImages.length === 0) {
    return (
      <Card className="border-gray-300">
        <CardContent className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Portfolio Gallery</h2>
          <div className="text-center py-8 md:py-12 text-gray-500">
            <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-md font-medium text-gray-700">No portfolio images yet.</p>
            <p className="text-sm">Check back soon to see examples of this supplier's work!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-300">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Portfolio Gallery ({portfolioImages.length})</h2>
          <Sheet open={showGallerySheet} onOpenChange={setShowGallerySheet}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <Grid3X3 className="w-4 h-4 mr-2" /> View All
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b flex flex-row items-center justify-between">
                <SheetTitle>Portfolio Gallery</SheetTitle>
                {/* Close button for mobile sheet */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowGallerySheet(false)}
                  className="h-8 w-8"
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolioImages.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => {
                        openImageModal(item, index)
                        setShowGallerySheet(false)
                      }}
                    >
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.alt || item.title || `Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile grid */}
        <div className="grid grid-cols-2 md:hidden gap-3">
          {portfolioImages.slice(0, 4).map((item, index) => (
            <div
              key={item.id || index}
              className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => {
                openImageModal(item, index)
              }}
            >
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.alt || item.title || `Image ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform"
              />
              {index === 3 && portfolioImages.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-medium">+{portfolioImages.length - 4} more</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {portfolioImages.slice(0, visibleImageCount).map((item, index) => (
            <div
              key={item.id || index}
              className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden group cursor-pointer"
              onClick={() => openImageModal(item, index)}
            >
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.alt || item.title || `Image ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 rounded-full p-3">
                    <Grid3X3 className="w-6 h-6 text-gray-800" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load more/less buttons */}
        {portfolioImages.length > 6 && (
          <div className="hidden md:flex gap-2 justify-center mt-4">
            {visibleImageCount < portfolioImages.length && (
              <Button variant="outline" onClick={loadMoreImages} className="flex-1 max-w-xs">
                Load More ({portfolioImages.length - visibleImageCount} remaining)
              </Button>
            )}
            {visibleImageCount > 6 && (
              <Button variant="ghost" onClick={showLessImages} className="flex-1 max-w-xs">
                Show Less
              </Button>
            )}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeImageModal} // Click overlay to close
          >
            <div 
              className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full flex flex-col"
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking modal content
            >
              {/* Modal Header with improved close button */}
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold truncate pr-4">
                  {selectedImage.title || "Portfolio Image"}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closeImageModal}
                  className="h-8 w-8 hover:bg-gray-100 flex-shrink-0"
                >
                  <XIcon className="w-5 h-5" />
                </Button>
              </div>

              {/* Image Container */}
              <div className="flex-1 p-2 sm:p-4 overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-full max-h-[75vh]">
                  <Image
                    src={selectedImage.image || "/placeholder.jpg"}
                    alt={selectedImage.alt || selectedImage.title || "Selected image"}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Navigation Footer */}
              {portfolioImages.length > 1 && (
                <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                  <Button
                    variant="outline"
                    onClick={() => navigateImage("prev")}
                    disabled={portfolioImages.length <= 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                    {selectedImageIndex + 1} of {portfolioImages.length}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigateImage("next")}
                    disabled={portfolioImages.length <= 1}
                    className="flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Additional close button in corner for mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeImageModal}
                className="absolute top-2 right-2 md:hidden h-10 w-10 bg-black/20 hover:bg-black/40 text-white border-0"
              >
                <XIcon className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
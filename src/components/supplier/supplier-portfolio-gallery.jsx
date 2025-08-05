"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ChevronLeft, ChevronRight, Grid3X3, XIcon, Play, Video } from "lucide-react"


// Helper function to extract video ID and determine platform
const getVideoInfo = (url) => {
  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  
  if (youtubeMatch) {
    return {
      platform: 'youtube',
      id: youtubeMatch[1],
      thumbnail: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }
  }
  
  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  
  if (vimeoMatch) {
    return {
      platform: 'vimeo',
      id: vimeoMatch[1],
      thumbnail: `https://vumbnail.com/${vimeoMatch[1]}.jpg`,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }
  }
  
  return null
}

export default function SupplierPortfolioGallery({ portfolioImages = [], portfolioVideos = [] }) {
  const [showGallerySheet, setShowGallerySheet] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  const [visibleImageCount, setVisibleImageCount] = useState(6)
  const [visibleVideoCount, setVisibleVideoCount] = useState(6)

  // Combine images and videos into a single media array for modal navigation
  const allMedia = [
    ...portfolioImages.map(img => ({ ...img, type: 'image', src: img.src || img.image })),
    ...portfolioVideos.map(video => ({ ...video, type: 'video', videoInfo: getVideoInfo(video.url) }))
  ]

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeMediaModal()
        setShowGallerySheet(false)
      }
    }
    
    if (selectedMedia || showGallerySheet) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [selectedMedia, showGallerySheet])

  const openMediaModal = (media, index) => {
    setSelectedMedia(media)
    setSelectedMediaIndex(index)
  }

  const closeMediaModal = () => {
    setSelectedMedia(null)
  }

  const navigateMedia = (direction) => {
    let newIndex = selectedMediaIndex
    if (direction === "next") {
      newIndex = (selectedMediaIndex + 1) % allMedia.length
    } else {
      newIndex = (selectedMediaIndex - 1 + allMedia.length) % allMedia.length
    }
    setSelectedMediaIndex(newIndex)
    setSelectedMedia(allMedia[newIndex])
  }

  const loadMoreImages = () => setVisibleImageCount((prev) => Math.min(prev + 6, portfolioImages.length))
  const showLessImages = () => setVisibleImageCount(6)
  
  const loadMoreVideos = () => setVisibleVideoCount((prev) => Math.min(prev + 6, portfolioVideos.length))
  const showLessVideos = () => setVisibleVideoCount(6)

  const hasContent = portfolioImages.length > 0 || portfolioVideos.length > 0

  if (!hasContent) {
    return (
      <Card className="border-gray-300">
        <CardContent className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Portfolio Gallery</h2>
          <div className="text-center py-8 md:py-12 text-gray-500">
            <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-md font-medium text-gray-700">No portfolio content yet.</p>
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
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Portfolio Gallery ({portfolioImages.length + portfolioVideos.length})
          </h2>
          <Sheet open={showGallerySheet} onOpenChange={setShowGallerySheet}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <Grid3X3 className="w-4 h-4 mr-2" /> View All
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b flex flex-row items-center justify-between">
                <SheetTitle>Portfolio Gallery</SheetTitle>
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
                  {allMedia.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => {
                        openMediaModal(item, index)
                        setShowGallerySheet(false)
                      }}
                    >
                      {item.type === 'image' ? (
                        <Image
                          src={item.src || "/placeholder.svg"}
                          alt={item.alt || item.title || `Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src={item.videoInfo?.thumbnail || "/placeholder.png"}
                            alt={item.title || `Video ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="bg-white/90 rounded-full p-3">
                              <Play className="w-6 h-6 text-gray-800 ml-1" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Images Section */}
        {portfolioImages.length > 0 && (
          <div className="mb-8">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Photos ({portfolioImages.length})</h3>
            
            {/* Mobile grid */}
            <div className="grid grid-cols-2 md:hidden gap-3 mb-4">
              {portfolioImages.slice(0, 4).map((item, index) => (
                <div
                  key={item.id || index}
                  className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => openMediaModal({ ...item, type: 'image', src: item.src || item.image }, index)}
                >
                  <Image
                    src={item.src || item.image || "/placeholder.png"}
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
                  onClick={() => openMediaModal({ ...item, type: 'image', src: item.src || item.image }, index)}
                >
                  <Image
                    src={item.src || item.image || "/placeholder.png"}
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

            {/* Load more/less buttons for images */}
            {portfolioImages.length > 6 && (
              <div className="hidden md:flex gap-2 justify-center mb-4">
                {visibleImageCount < portfolioImages.length && (
                  <Button variant="outline" onClick={loadMoreImages} className="flex-1 max-w-xs">
                    Load More Photos ({portfolioImages.length - visibleImageCount} remaining)
                  </Button>
                )}
                {visibleImageCount > 6 && (
                  <Button variant="ghost" onClick={showLessImages} className="flex-1 max-w-xs">
                    Show Less Photos
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Videos Section */}
        {portfolioVideos.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4">Videos ({portfolioVideos.length})</h3>
            
            {/* Mobile grid */}
            <div className="grid grid-cols-2 md:hidden gap-3 mb-4">
              {portfolioVideos.slice(0, 4).map((video, index) => {
                const videoInfo = getVideoInfo(video.url)
                const mediaIndex = portfolioImages.length + index
                
                return (
                  <div
                    key={video.id || index}
                    className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => openMediaModal({ ...video, type: 'video', videoInfo }, mediaIndex)}
                  >
                    {videoInfo?.thumbnail ? (
                      <Image
                        src={videoInfo.thumbnail}
                        alt={video.title || `Video ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-3">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    </div>
                    {index === 3 && portfolioVideos.length > 4 && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-white font-medium">+{portfolioVideos.length - 4} more</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {portfolioVideos.slice(0, visibleVideoCount).map((video, index) => {
                const videoInfo = getVideoInfo(video.url)
                const mediaIndex = portfolioImages.length + index
                
                return (
                  <div
                    key={video.id || index}
                    className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden group cursor-pointer"
                    onClick={() => openMediaModal({ ...video, type: 'video', videoInfo }, mediaIndex)}
                  >
                    {videoInfo?.thumbnail ? (
                      <Image
                        src={videoInfo.thumbnail}
                        alt={video.title || `Video ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center group-hover:bg-gray-400 transition-colors">
                        <Video className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-3 group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Load more/less buttons for videos */}
            {portfolioVideos.length > 6 && (
              <div className="hidden md:flex gap-2 justify-center">
                {visibleVideoCount < portfolioVideos.length && (
                  <Button variant="outline" onClick={loadMoreVideos} className="flex-1 max-w-xs">
                    Load More Videos ({portfolioVideos.length - visibleVideoCount} remaining)
                  </Button>
                )}
                {visibleVideoCount > 6 && (
                  <Button variant="ghost" onClick={showLessVideos} className="flex-1 max-w-xs">
                    Show Less Videos
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Media Modal */}
        {selectedMedia && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeMediaModal}
          >
            <div 
              className="relative bg-white rounded-lg shadow-xl max-w-4xl md:h-[90vh] h-[50vh] w-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold truncate pr-4">
                  {selectedMedia.title || (selectedMedia.type === 'video' ? 'Portfolio Video' : 'Portfolio Image')}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closeMediaModal}
                  className="h-8 w-8 hover:bg-gray-100 flex-shrink-0"
                >
                  <XIcon className="w-5 h-5" />
                </Button>
              </div>

              {/* Media Container */}
              <div className="flex-1 p-2 sm:p-4 overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-full max-h-[75vh]">
                  {selectedMedia.type === 'image' ? (
                    <Image
                      src={selectedMedia.src || "/placeholder.jpg"}
                      alt={selectedMedia.alt || selectedMedia.title || "Selected image"}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full">
                      {selectedMedia.videoInfo?.embedUrl ? (
                        <iframe
                          src={selectedMedia.videoInfo.embedUrl}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                          title={selectedMedia.title || "Portfolio Video"}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                          <p className="text-gray-600">Unable to load video</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Footer */}
              {allMedia.length > 1 && (
                <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                  <Button
                    variant="outline"
                    onClick={() => navigateMedia("prev")}
                    disabled={allMedia.length <= 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                    {selectedMediaIndex + 1} of {allMedia.length}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigateMedia("next")}
                    disabled={allMedia.length <= 1}
                    className="flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Mobile close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMediaModal}
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
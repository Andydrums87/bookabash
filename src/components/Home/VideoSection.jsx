"use client"

import { Play } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)

  // Replace this with your actual video URL when ready
  const videoUrl = null // e.g., "https://www.youtube.com/embed/YOUR_VIDEO_ID"
  const thumbnailUrl = "/userdashboard2.png" // Placeholder - use a nice preview image

  return (
    <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            See how it works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plan your perfect party in under 2 minutes
          </p>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
          {isPlaying && videoUrl ? (
            <iframe
              src={`${videoUrl}?autoplay=1`}
              title="PartySnap Demo"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              {/* Thumbnail */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600">
                <Image
                  src={thumbnailUrl}
                  alt="PartySnap demo video thumbnail"
                  fill
                  className="object-cover opacity-90"
                  sizes="(max-width: 768px) 100vw, 1024px"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
              </div>

              {/* Play Button */}
              <button
                onClick={() => videoUrl && setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                aria-label="Play video"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-600 ml-1" fill="currentColor" />
                </div>
              </button>

              {/* Coming Soon Badge - remove when video is ready */}
              {!videoUrl && (
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium text-gray-700">Video coming soon</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Optional: Feature callouts below video */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mt-8 text-center">
          <div>
            <p className="text-2xl md:text-3xl font-bold text-primary-600">2 min</p>
            <p className="text-sm text-gray-600">to plan a party</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-primary-600">100+</p>
            <p className="text-sm text-gray-600">vetted suppliers</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-primary-600">4.9★</p>
            <p className="text-sm text-gray-600">parent rating</p>
          </div>
        </div>
      </div>
    </section>
  )
}

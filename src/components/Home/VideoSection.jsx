"use client"

import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { useState, useRef } from "react"
import Image from "next/image"

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef(null)
  const containerRef = useRef(null)

  // Use desktop video for all devices - mobile will show it in a contained view
  const videoUrl = "https://res.cloudinary.com/dghzq6xtd/video/upload/v1769608355/r_foe1fc.mp4"
  const thumbnailUrl = "https://res.cloudinary.com/dghzq6xtd/image/upload/v1769426689/homepage-hero-thumbnail_oxumhw.png"

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Try video element first (better for mobile)
        if (videoRef.current?.requestFullscreen) {
          await videoRef.current.requestFullscreen()
        } else if (videoRef.current?.webkitEnterFullscreen) {
          // iOS Safari
          await videoRef.current.webkitEnterFullscreen()
        } else if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        }
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.log("Fullscreen not supported:", err)
    }
  }

  // Listen for fullscreen changes
  if (typeof document !== "undefined") {
    document.onfullscreenchange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
  }

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

        {/* Video Container - aspect-video for all, full width on mobile */}
        <div
          ref={containerRef}
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 aspect-video bg-black"
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            src={videoUrl}
            className={`absolute inset-0 w-full h-full object-contain ${isPlaying ? 'block' : 'hidden'}`}
            muted={isMuted}
            volume={1}
            playsInline
            onEnded={() => setIsPlaying(false)}
          />

          {/* Thumbnail (shown when not playing) */}
          {!isPlaying && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600">
                <Image
                  src={thumbnailUrl}
                  alt="PartySnap demo video thumbnail"
                  fill
                  className="object-contain md:object-cover opacity-90"
                  sizes="(max-width: 768px) 100vw, 1024px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
              </div>

              {/* Play Button */}
              <button
                onClick={handlePlayPause}
                className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                aria-label="Play video"
              >
                <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-6 h-6 md:w-10 md:h-10 text-primary-600 ml-1" fill="currentColor" />
                </div>
              </button>
            </>
          )}

          {/* Video Controls (shown when playing) */}
          {isPlaying && (
            <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 flex justify-between items-center">
              <button
                onClick={handlePlayPause}
                className="w-9 h-9 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                aria-label="Pause video"
              >
                <Pause className="w-4 h-4 md:w-5 md:h-5 text-gray-800" fill="currentColor" />
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleMuteToggle}
                  className="w-9 h-9 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-gray-800" />
                  ) : (
                    <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-gray-800" />
                  )}
                </button>
                <button
                  onClick={handleFullscreen}
                  className="w-9 h-9 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4 md:w-5 md:h-5 text-gray-800" />
                  ) : (
                    <Maximize className="w-4 h-4 md:w-5 md:h-5 text-gray-800" />
                  )}
                </button>
              </div>
            </div>
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

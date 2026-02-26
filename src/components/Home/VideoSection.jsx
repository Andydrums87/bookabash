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
  const videoUrl = "https://res.cloudinary.com/dghzq6xtd/video/upload/v1769618757/Untitled_design_1_m9ejbg.mp4"
  const thumbnailUrl = "https://res.cloudinary.com/dghzq6xtd/image/upload/v1769426689/homepage-hero-thumbnail_oxumhw.png"

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        // Start playing
        videoRef.current.play()
        setIsPlaying(true)

        // Enter fullscreen
        try {
          if (videoRef.current.requestFullscreen) {
            await videoRef.current.requestFullscreen()
          } else if (videoRef.current.webkitEnterFullscreen) {
            // iOS Safari
            await videoRef.current.webkitEnterFullscreen()
          } else if (containerRef.current?.requestFullscreen) {
            await containerRef.current.requestFullscreen()
          }
          setIsFullscreen(true)
        } catch (err) {
          // Fullscreen may be blocked, video still plays
          console.log("Fullscreen not available:", err)
        }
      }
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
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-rose-50 to-amber-100">
                <Image
                  src={thumbnailUrl}
                  alt="PartySnap demo video thumbnail"
                  fill
                  className="object-contain md:object-cover"
                  sizes="(max-width: 768px) 100vw, 1024px"
                />
                {/* Warm peach overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/30 via-transparent to-rose-400/20" />
              </div>

              {/* Play Button - larger and more vibrant with contrast backdrop */}
              <button
                onClick={handlePlayPause}
                className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                aria-label="Play video"
              >
                {/* Contrast backdrop behind button - stronger white for better pop */}
                <div className="absolute w-40 h-40 md:w-52 md:h-52 bg-white/80 rounded-full blur-2xl" />
                <div className="absolute w-28 h-28 md:w-36 md:h-36 bg-white rounded-full opacity-90" />
                <div className="relative w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:shadow-primary-500/40 transition-all duration-300 ring-4 ring-white">
                  <Play className="w-8 h-8 md:w-12 md:h-12 text-white ml-1" fill="currentColor" />
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

        {/* Feature callouts below video */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8">
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-green-500 font-bold">✓</span>
            <span className="text-sm md:text-base font-medium">Founded in St Albans</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-green-500 font-bold">✓</span>
            <span className="text-sm md:text-base font-medium">100+ vetted suppliers</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-green-500 font-bold">✓</span>
            <span className="text-sm md:text-base font-medium">Personal confirmation on every booking</span>
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { useState, useRef } from "react"
import Image from "next/image"

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef(null)

  const videoUrl = "/videos/homepage-hero.mp4"
  const thumbnailUrl = "/videos/homepage-hero-thumbnail.png"

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
          {/* Video Element */}
          <video
            ref={videoRef}
            src={videoUrl}
            className={`absolute inset-0 w-full h-full object-cover ${isPlaying ? 'block' : 'hidden'}`}
            muted={isMuted}
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
                  className="object-cover opacity-90"
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
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-600 ml-1" fill="currentColor" />
                </div>
              </button>
            </>
          )}

          {/* Video Controls (shown when playing) */}
          {isPlaying && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                aria-label="Pause video"
              >
                <Pause className="w-5 h-5 text-gray-800" fill="currentColor" />
              </button>
              <button
                onClick={handleMuteToggle}
                className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-gray-800" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gray-800" />
                )}
              </button>
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

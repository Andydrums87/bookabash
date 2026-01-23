"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle, AlertCircle, Play, Pause, Volume2, VolumeX } from "lucide-react"
import Image from "next/image"

export default function ComingSoon() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef(null)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle") // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("")

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setStatus("error")
      setErrorMessage("Please enter a valid email address")
      return
    }

    setStatus("loading")
    setErrorMessage("")

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus("success")
        setEmail("")
      } else {
        const data = await res.json()
        setStatus("error")
        setErrorMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-48 h-24 relative">
            <Image
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578794/Transparent_With_Text_1_nfb1pi.png"
              alt="PartySnap Logo"
              fill
              className="object-contain"
              priority
              sizes="192px"
            />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Kids' parties.{" "}
            <span className="relative inline-block">
              Sorted.
              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-300 -skew-x-6 -z-10"></div>
            </span>
          </h1>

          {/* One-line explainer */}
          <p className="text-lg text-gray-600 max-w-sm mx-auto">
            We help parents book kids' parties without the stress of searching and organising.
          </p>
        </div>

        {/* Local signal */}
        <p className="text-primary-600 font-semibold text-sm tracking-wide uppercase">
          Launching soon in St Albans
        </p>

        {/* Video Section */}
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-gray-100">
          <video
            ref={videoRef}
            src="/videos/homepage-hero.mp4"
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
                  src="/videos/homepage-hero-thumbnail.png"
                  alt="PartySnap demo video"
                  fill
                  className="object-cover opacity-90"
                  sizes="(max-width: 768px) 100vw, 448px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
              </div>

              {/* Play Button */}
              <button
                onClick={handlePlayPause}
                className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                aria-label="Play video"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-6 h-6 md:w-8 md:h-8 text-primary-600 ml-1" fill="currentColor" />
                </div>
              </button>
            </>
          )}

          {/* Video Controls (shown when playing) */}
          {isPlaying && (
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                aria-label="Pause video"
              >
                <Pause className="w-4 h-4 text-gray-800" fill="currentColor" />
              </button>
              <button
                onClick={handleMuteToggle}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-gray-800" />
                ) : (
                  <Volume2 className="w-4 h-4 text-gray-800" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Email capture */}
        {status === "success" ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-2">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
            <p className="text-green-800 font-medium">You're on the list!</p>
            <p className="text-green-600 text-sm">We'll let you know when we launch.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === "error") setStatus("idle")
                }}
                disabled={status === "loading"}
                className="h-12 text-base flex-1 bg-white"
              />
              <Button
                type="submit"
                disabled={status === "loading"}
                className="h-12 px-6 bg-primary-500 hover:bg-primary-600 text-white font-semibold whitespace-nowrap"
              >
                {status === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Get early access"
                )}
              </Button>
            </div>

            <p className="text-gray-400 text-xs">
              No spam. Launch updates only.
            </p>

            {status === "error" && (
              <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>
        )}

        {/* Founder credits teaser */}
        <p className="text-gray-500 text-sm">
          Founder credits for early sign-ups
        </p>
      </div>
    </div>
  )
}

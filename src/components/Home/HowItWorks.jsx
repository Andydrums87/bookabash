"use client"

import Image from "next/image"
import { Shield, MessageCircle } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Tell us the details",
      description: "Share your party date, theme, number of kids, and location. It takes less than a minute.",
      bullets: [
        "Pick from popular themes or go custom",
        "We only need a few key details",
        "No account required to browse"
      ],
      // Only show first 2 bullets on mobile
      mobileBullets: [
        "Pick from popular themes",
        "Takes less than a minute"
      ],
      screenImage: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1772102943/IMG_6574_gwt1hj.png",
      imageAlt: "PartySnap form showing date, theme, and location fields",
      reverse: false,
      darkBg: true,
      trustSignals: [
        { icon: "shield", text: "Secure checkout via Stripe" },
        { icon: "chat", text: "Real human support" }
      ]
    },
    {
      number: 2,
      title: "We build your perfect party",
      description: "Our system matches you with vetted local suppliers based on your needs — all in one personalised dashboard.",
      bullets: [
        "Entertainment, venues, cakes & more",
        "Transparent pricing upfront",
        "Curated packages tailored to you"
      ],
      mobileBullets: [
        "Vetted local suppliers",
        "Transparent pricing"
      ],
      screenImage: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1772102954/IMG_6576_b3zd7h.png",
      imageAlt: "PartySnap dashboard showing matched suppliers",
      reverse: true,
      darkBg: false,
      trustSignals: null
    },
    {
      number: 3,
      title: "Secure your party",
      description: "Review your selections, pay securely, and receive full confirmation. We handle the coordination.",
      bullets: [
        "100% money-back guarantee",
        "Confirmation pack within 2 working days",
        "Personal support from our team"
      ],
      mobileBullets: [
        "100% money-back guarantee",
        "Personal support from our team"
      ],
      screenImage: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1772102928/IMG_6580_qofg58.png",
      imageAlt: "PartySnap checkout and confirmation screen",
      reverse: false,
      darkBg: true,
      trustSignals: null
    }
  ]

  // Phone Frame Component
  const PhoneFrame = ({ children, darkBg, small = false }) => (
    <div className="relative">
      {/* Shadow/glow behind phone */}
      {darkBg && (
        <div className={`absolute inset-4 bg-black/20 ${small ? 'rounded-[1.5rem]' : 'rounded-[2rem]'} blur-2xl`} />
      )}

      <div className={`relative z-10 ${small ? 'w-[140px] h-[280px]' : 'w-[180px] md:w-[260px] h-[360px] md:h-[520px]'} bg-gray-900 ${small ? 'rounded-[1.5rem]' : 'rounded-[2rem] md:rounded-[2.5rem]'} p-1.5 md:p-2 shadow-2xl`}>
        {/* Screen area */}
        <div className={`w-full h-full bg-white ${small ? 'rounded-[1.25rem]' : 'rounded-[1.5rem] md:rounded-[2rem]'} overflow-hidden relative`}>
          {/* Notch */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${small ? 'w-12 h-3' : 'w-16 md:w-24 h-4 md:h-5'} bg-gray-900 ${small ? 'rounded-b-md' : 'rounded-b-lg md:rounded-b-xl'} z-10`} />

          {/* Screen content */}
          {children}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {steps.map((step, index) => (
        <section
          key={step.number}
          className={`py-6 md:py-14 relative overflow-hidden ${
            step.darkBg
              ? 'bg-gradient-to-br from-[hsl(var(--primary-400))] via-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]'
              : 'bg-white'
          }`}
        >
          {/* Decorative elements for dark sections */}
          {step.darkBg && (
            <>
              {/* Large soft blobs */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-black/5 rounded-full blur-3xl" />

              {/* Floating dots - hidden on mobile */}
              <div className="hidden md:block absolute top-[20%] left-[15%] w-2 h-2 bg-white/30 rounded-full" />
              <div className="hidden md:block absolute top-[40%] right-[20%] w-3 h-3 bg-white/20 rounded-full" />
              <div className="hidden md:block absolute bottom-[30%] left-[25%] w-2 h-2 bg-white/25 rounded-full" />
              <div className="hidden md:block absolute top-[60%] right-[35%] w-1.5 h-1.5 bg-white/35 rounded-full" />
              <div className="hidden md:block absolute bottom-[15%] right-[15%] w-2 h-2 bg-white/20 rounded-full" />
            </>
          )}

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Show header only on first step */}
              {index === 0 && (
                <div className="text-center mb-6 md:mb-14">
                  <div className="mb-1 md:mb-2">
                    <span className="text-5xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-sm">3</span>
                  </div>
                  <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white/95 mb-1 md:mb-2">
                    simple steps
                  </h2>
                  <div className="w-12 md:w-16 h-1 bg-white/30 mx-auto mb-2 md:mb-3 rounded-full" />
                  <p className="text-sm md:text-lg text-white/80 max-w-md mx-auto">
                    From party idea → confirmed booking
                  </p>
                </div>
              )}

              {/* MOBILE LAYOUT - Phone first, then compact text */}
              <div className="md:hidden">
                {/* Phone centered at top */}
                <div className="flex justify-center mb-4">
                  <PhoneFrame darkBg={step.darkBg} small>
                    {step.screenImage ? (
                      <Image
                        src={step.screenImage}
                        alt={step.imageAlt}
                        fill
                        className="object-cover object-top"
                        sizes="140px"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${step.placeholderBg} flex flex-col items-center justify-center`}>
                        <span className="text-3xl mb-1">{step.placeholderIcon}</span>
                        <span className="text-gray-600 font-medium text-xs">Step {step.number}</span>
                      </div>
                    )}
                  </PhoneFrame>
                </div>

                {/* Text below phone */}
                <div className="text-center">
                  {/* Step Badge */}
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg mb-2 transform -rotate-3 ${
                    step.darkBg
                      ? 'bg-white text-[hsl(var(--primary-500))] shadow-lg shadow-black/20'
                      : 'bg-[hsl(var(--primary-500))] text-white shadow-lg shadow-primary-500/30'
                  }`}>
                    {step.number}
                  </div>

                  <h3 className={`text-xl font-bold mb-2 ${
                    step.darkBg ? 'text-white' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm mb-3 leading-relaxed ${
                    step.darkBg ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>

                  {/* Bullets */}
                  <ul className="space-y-2 mb-3">
                    {step.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-center gap-2 justify-center">
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.darkBg
                            ? 'bg-white text-green-600'
                            : 'bg-green-500 text-white'
                        }`}>
                          ✓
                        </span>
                        <span className={`text-sm font-medium ${
                          step.darkBg ? 'text-white' : 'text-gray-800'
                        }`}>
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Trust Signals on mobile - inline row */}
                  {step.trustSignals && (
                    <div className="flex gap-2 justify-center mt-3">
                      {step.trustSignals.map((signal, signalIndex) => (
                        <div
                          key={signalIndex}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] whitespace-nowrap ${
                            step.darkBg
                              ? 'bg-white/15 text-white/90'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {signal.icon === 'shield' && <Shield className="w-2.5 h-2.5" />}
                          {signal.icon === 'chat' && <MessageCircle className="w-2.5 h-2.5" />}
                          <span>{signal.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* DESKTOP LAYOUT - Original side by side */}
              <div className={`hidden md:flex flex-col ${step.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-6 md:gap-10 lg:gap-14`}>
                {/* Text Content */}
                <div className="flex-1 text-center lg:text-left">
                  {/* Step Badge - Premium styling */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl font-black text-2xl md:text-3xl mb-4 md:mb-5 transform -rotate-3 ${
                    step.darkBg
                      ? 'bg-white text-[hsl(var(--primary-500))] shadow-lg shadow-black/20'
                      : 'bg-[hsl(var(--primary-500))] text-white shadow-lg shadow-primary-500/30'
                  }`}>
                    {step.number}
                  </div>

                  <h3 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 ${
                    step.darkBg ? 'text-white' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </h3>

                  <p className={`text-base md:text-lg mb-5 md:mb-6 leading-relaxed ${
                    step.darkBg ? 'text-white/85' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>

                  {/* Bullet points - Enhanced */}
                  <ul className="space-y-3 md:space-y-4 mb-5">
                    {step.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-center gap-3 justify-center lg:justify-start">
                        <span className={`flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                          step.darkBg
                            ? 'bg-white text-green-600'
                            : 'bg-green-500 text-white'
                        }`}>
                          ✓
                        </span>
                        <span className={`text-base md:text-lg font-medium ${
                          step.darkBg ? 'text-white' : 'text-gray-800'
                        }`}>
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Trust Signals */}
                  {step.trustSignals && (
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-6">
                      {step.trustSignals.map((signal, signalIndex) => (
                        <div
                          key={signalIndex}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                            step.darkBg
                              ? 'bg-white/15 text-white/90'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {signal.icon === 'shield' && <Shield className="w-4 h-4" />}
                          {signal.icon === 'chat' && <MessageCircle className="w-4 h-4" />}
                          <span>{signal.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone Mockup */}
                <div className="flex-1 flex justify-center">
                  <PhoneFrame darkBg={step.darkBg}>
                    {step.screenImage ? (
                      <Image
                        src={step.screenImage}
                        alt={step.imageAlt}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 180px, 260px"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${step.placeholderBg} flex flex-col items-center justify-center`}>
                        <span className="text-4xl md:text-5xl mb-2 md:mb-3">{step.placeholderIcon}</span>
                        <span className="text-gray-600 font-medium text-xs md:text-sm">Step {step.number}</span>
                      </div>
                    )}
                  </PhoneFrame>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

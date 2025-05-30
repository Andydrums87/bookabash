"use client";

import { useState } from "react"
import Image from "next/image"

export default function HomePage() {
  const [category, setCategory] = useState("")
  const [postcode, setPostcode] = useState("")
  const [budget, setBudget] = useState(200)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [registerEmail, setRegisterEmail] = useState("")
  const [status, setStatus] = useState("")
  const [registered, setRegistered] = useState(false)
  const [activeTab, setActiveTab] = useState("supplier") 
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const testimonials = [
    {
      quote: "BookABash saved me so much time! I found an amazing magician and ordered the cake all in one go. My son's 7th birthday was a huge hit!",
      author: "Sophie, mum of two in North London",
      rating: 5
    },
    {
      quote: "I was panicking about my daughter's birthday until I found BookABash. Within an hour I had everything sorted. The face painter was incredible!",
      author: "James, dad of three in Manchester",
      rating: 5
    },
    {
      quote: "The transparent pricing was such a relief. No hidden costs and I could stick to my budget while still giving my twins an amazing 5th birthday party.",
      author: "Priya, mum of twins in Birmingham",
      rating: 5
    },
    {
      quote: "BookABash made planning my son's superhero party so easy. Found an amazing entertainer and venue in just one evening!",
      author: "Michael, dad in Leeds",
      rating: 5
    },
    {
      quote: "As a busy working mum, I don't have time to call dozens of providers. BookABash let me book everything in one evening!",
      author: "Emma, mum in Edinburgh",
      rating: 5
    }
  ]
  // const handleRegisterSubmit = async (e) => {
  //   e.preventDefault()
  //   // In a real implementation, this would send the email to a backend service
  //   try {
  //     const response = await fetch("/api/subscribe", {
  //       method: "POST",
  //       body: JSON.stringify({ email: registerEmail}),
  //       headers: { Accept: "application/json" },
  //     });

  //     if (response.ok) {
  //       setRegistered(true)
  //       console.log("Registered email:", registerEmail)
  //       setStatus("Thank you for signing up! Please check your email for confirmation.");
  //       setRegisterEmail("");
  //           // Reset form after 5 seconds
  //   setTimeout(() => {
  //     setRegistered(false)
  //     setRegisterEmail("")
  //   }, 5000)
  //     } else {
  //       setStatus("Oops! Something went wrong.");
  //     }
  //   } catch (error) {
  //     setStatus("Oops! Something went wrong.", error);
  //   }
  // }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true)
  console.log("Registering email:", registerEmail);
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: registerEmail }),
    });
  
    const data = await res.json();
  
    if (res.ok) {
      setIsSubmitting(false)
     setShowSuccessModal(true)
      setRegisterEmail("");

    } else {
      alert(data.error || "Something went wrong");
    }
  };


  return (
    <div className="min-h-screen bg-[#FDFDFB] overflow-hidden relative">
     
  {/* Hero Section */}
  <section className="relative py-12 md:py-16">
        {/* Hero Background */}
        <div className="absolute inset-0 overflow-hidden">
        <Image
    src="https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748522377/blog-hero_lhgb8b.png"
    alt="Colorful children's party with balloons and streamers"
    fill
    priority
    style={{ objectFit: 'cover' }}
    sizes="(max-width: 768px) 100vw, 1200px"
  />
        </div>

        {/* Semi-transparent overlay - slightly darker to make text pop more */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2F2F2F]/50 to-[#2F2F2F]/40 backdrop-blur-[2px] z-10"></div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-lg shadow-lg">
              {/* Eye-Catching Offer Badge - More compact on mobile */}
              <div className="flex justify-center mb-3 md:mb-4">
                <div className="relative">
                  <div className="bg-gradient-to-r from-[#FC6B57] to-[#e55c48] text-white px-3 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-lg font-bold inline-flex items-center gap-1 md:gap-2 shadow-lg animate-pulse">
                    <span className="text-lg md:text-2xl">🎉</span>
                    <span className="hidden md:inline">Limited Offer: First 100 Suppliers Get 3 Months Free!</span>
                    <span className="md:hidden">First 100 Get 3 Months Free!</span>
                  </div>
                  {/* Starburst decoration - smaller on mobile */}
                  <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-1 py-0.5 md:px-2 md:py-1 rounded-full transform rotate-12 shadow-md">
                    HOT!
                  </div>
                </div>
              </div>

              {/* Urgency Counter - More compact on mobile */}
              <div className="flex justify-center mb-3 md:mb-4">
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium">
                  ⏰ Only <span className="font-bold text-red-600">37 spots left</span>
                  <span className="hidden md:inline"> - Don&apos;t miss out!</span>
                </div>
              </div>

              <div className="text-center mb-4 md:mb-6">
                <h1 className="text-2xl md:text-5xl font-bold text-[#2F2F2F] mb-3 md:mb-4 leading-tight">
                  <span className="md:hidden">
                    Get{" "}
                    <span className="bg-gradient-to-r from-[#FC6B57] to-[#e55c48] bg-clip-text text-transparent">
                      3 Months Free
                    </span>{" "}
                    — First 100 Suppliers!
                  </span>
                  <span className="hidden md:block">
                    Get{" "}
                    <span className="bg-gradient-to-r from-[#FC6B57] to-[#e55c48] bg-clip-text text-transparent">
                      3 Months Commission-Free
                    </span>{" "}
                    — Be Among the First 100 Suppliers!
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-[#707070]">
                  <span className="md:hidden">Reach more customers and grow your business.</span>
                  <span className="hidden md:block">
                    Reach more customers and grow your party services with BookABash.
                  </span>
                </p>
              </div>

              {/* Supplier Form - More compact on mobile */}
              
                 <div className="max-w-lg mx-auto mb-6 md:mb-8">
                <div className="bg-[#2F2F2F]/5 p-4 md:p-6 rounded-lg">
                  <form onSubmit={handleRegisterSubmit}>
                    <div className="flex flex-col gap-2 md:gap-3">
                      <input
                        type="email"
                        placeholder="Your business email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="p-3 md:p-4 dark:text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FC6B57] text-base md:text-lg"
                        required
                        disabled={isSubmitting}
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-[#FC6B57] to-[#e55c48] text-white px-4 py-3 md:py-4 rounded-md hover:from-[#e55c48] hover:to-[#d54a37] transition-all duration-300 font-bold text-base md:text-lg shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span className="md:hidden">Claiming...</span>
                            <span className="hidden md:block">Claiming Your Spot...</span>
                          </span>
                        ) : (
                          <>
                            <span className="md:hidden">🚀 Claim Your Spot!</span>
                            <span className="hidden md:block">🚀 Claim Your Spot Now - Limited Time!</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                  <p className="text-[#707070] text-xs md:text-sm mt-2 md:mt-3 text-center">
                    <span className="md:hidden">No commission for 3 months if you&apos;re in the first 100.</span>
                    <span className="hidden md:block">
                      No commission fees for your first 3 months if you&apos;re in the first 100 suppliers to sign up.
                    </span>
                  </p>
                </div>
              </div>

              {/* Key Benefits for Suppliers - Simplified on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="flex items-start">
                  <div className="bg-[#FC6B57]/10 p-2 rounded-full mr-3 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5 text-[#FC6B57]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2F2F2F] text-sm md:text-base">
                      <span className="md:hidden">Reach local customers</span>
                      <span className="hidden md:block">Reach thousands of local customers</span>
                    </h3>
                    <p className="text-xs md:text-sm text-[#707070] hidden md:block">
                      Connect with parents looking for your exact services
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#FC6B57]/10 p-2 rounded-full mr-3 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5 text-[#FC6B57]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2F2F2F] text-sm md:text-base">
                      <span className="md:hidden">Easy booking system</span>
                      <span className="hidden md:block">Easy online booking system</span>
                    </h3>
                    <p className="text-xs md:text-sm text-[#707070] hidden md:block">
                      Manage your calendar and bookings in one place
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#FC6B57]/10 p-2 rounded-full mr-3 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5 text-[#FC6B57]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2F2F2F] text-sm md:text-base">
                      <span className="md:hidden">Secure payments</span>
                      <span className="hidden md:block">Secure payments and support</span>
                    </h3>
                    <p className="text-xs md:text-sm text-[#707070] hidden md:block">
                      Get paid on time with our secure payment system
                    </p>
                  </div>
                </div>
              </div>

              {/* Supplier Testimonial - Simplified on mobile */}
              {/* <div className="bg-gradient-to-r from-[#FC6B57]/10 to-[#e55c48]/10 p-4 md:p-6 rounded-lg mb-6 md:mb-8 border border-[#FC6B57]/20">
                <div className="flex items-center justify-center mb-3 md:mb-4">
                  <div className="flex text-yellow-400 text-base md:text-lg">★★★★★</div>
                </div>
                <blockquote className="text-center">
                  <p className="text-base md:text-lg text-[#2F2F2F] italic mb-3 md:mb-4">
                    <span className="md:hidden">"Game-changer! 15 parties booked this month."</span>
                    <span className="hidden md:block">
                      "This platform is a game-changer for party providers! I've already booked 15 parties this month
                      through early access."
                    </span>
                  </p>
                  <footer className="text-[#707070] text-sm md:text-base">— Sarah M., Face Painter, London</footer>
                </blockquote>
              </div> */}

              {/* Secondary Customer Option - More compact on mobile */}
              <div className="border-t border-gray-200 pt-4 md:pt-6 text-center">
                <p className="text-[#707070] mb-2 md:mb-3 text-sm md:text-base">
                  <span className="md:hidden">Looking for party services?</span>
                  <span className="hidden md:block">Looking for party services for your child?</span>
                </p>
                <button
                  onClick={() => setActiveTab("customer")}
                  className="text-[#FC6B57] font-medium hover:underline inline-flex items-center text-sm md:text-base"
                >
                  Get notified when we launch
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 md:h-4 md:w-4 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Customer Registration Form - Hidden by default, shown when activeTab is "customer" */}
              {activeTab === "customer" && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="bg-[#FFF8F7] p-6 rounded-lg max-w-lg mx-auto">
                    <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-[#FC6B57]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      For Customers
                    </h3>
                    <p className="text-[#707070] mb-4">
                      Be the first to know when we launch and find amazing party providers in your area.
                    </p>
                    {!registered ? (
                      <form onSubmit={handleRegisterSubmit}>
                        <div className="flex flex-col gap-3">
                          <input
                            type="email"
                            placeholder="Your email address"
                            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FC6B57]"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            required
                          />
                          <button
                            type="submit"
                            className="bg-[#FC6B57] text-white px-4 py-3 rounded-md hover:bg-[#e55c48] transition-colors font-medium"
                          >
                            Register Interest
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-600 mx-auto mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-green-700 text-sm">Thank you! We&apos;ll notify you when BookABash launches.</p>
                      </div>
                    )}
                    <button
                      onClick={() => setActiveTab("")}
                      className="text-[#707070] text-sm mt-4 hover:text-[#FC6B57] transition-colors flex items-center mx-auto"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-[#FFF8F7] z-0"></div>
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#FC6B57]/5 z-0"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[#FC6B57]/5 z-0"></div>
        <div className="absolute top-1/4 right-1/3 w-16 h-16 rounded-full bg-[#FC6B57]/5 z-0"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2F2F2F] mb-4 relative inline-block">
              Booking a party should feel like magic
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#FC6B57] rounded-full"></div>
            </h2>
            <p className="text-[#707070] max-w-2xl mx-auto mt-6">
              Our simple three-step process takes the stress out of planning your child&apos;s perfect celebration
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-[#FC6B57]/20 via-[#FC6B57] to-[#FC6B57]/20 transform -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="relative bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl z-10 h-full">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#FC6B57] w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  1
                </div>
                <div className="mt-8 text-center">
                  <div className="bg-[#FFF8F7] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-[#FC6B57]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Browse local party providers</h3>
                  <p className="text-[#707070]">
                    Find the perfect entertainers, venues, and more in your area with our verified local listings.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl z-10 h-full">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#FC6B57] w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  2
                </div>
                <div className="mt-8 text-center">
                  <div className="bg-[#FFF8F7] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-[#FC6B57]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Book instantly — no endless calls</h3>
                  <p className="text-[#707070]">
                    Secure your booking online in minutes, not days. Real-time availability and instant confirmation.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl z-10 h-full">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#FC6B57] w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  3
                </div>
                <div className="mt-8 text-center">
                  <div className="bg-[#FFF8F7] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-[#FC6B57]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Relax and enjoy the big day</h3>
                  <p className="text-[#707070]">
                    We handle the details so you can focus on the celebration. Our support team is available if you need
                    anything.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <a href="#" className="inline-flex items-center text-[#FC6B57] font-medium hover:underline">
              Learn more about our booking process
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FFF8F7] to-[#FDFDFB] z-0"></div>
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#FC6B57]/5 z-0"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[#FC6B57]/5 z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2F2F2F] mb-4 relative inline-block">
              Parents love BookABash because it&apos;s…
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#FC6B57] rounded-full"></div>
            </h2>
            <p className="text-[#707070] max-w-2xl mx-auto mt-6">
              We&apos;ve designed our platform with busy parents in mind, making party planning a breeze
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
              <div className="text-[#FC6B57] mb-6 transform transition-transform duration-300 group-hover:scale-110">
                <div className="bg-[#FFF8F7] w-16 h-16 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Fast and stress-free</h3>
              <p className="text-[#707070]">Book everything you need in minutes, not hours. Our streamlined process saves you valuable time.</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-[#FC6B57] font-medium">Average booking time: 15 minutes</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
              <div className="text-[#FC6B57] mb-6 transform transition-transform duration-300 group-hover:scale-110">
                <div className="bg-[#FFF8F7] w-16 h-16 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Trusted, vetted providers</h3>
              <p className="text-[#707070]">Every provider is verified and reviewed by real parents. We only work with the best in the business.</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-[#FC6B57] font-medium">500+ verified providers nationwide</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
              <div className="text-[#FC6B57] mb-6 transform transition-transform duration-300 group-hover:scale-110">
                <div className="bg-[#FFF8F7] w-16 h-16 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Transparent pricing</h3>
              <p className="text-[#707070]">No hidden fees or surprises — see exactly what you&apos;ll pay. Compare options easily to stay within budget.</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-[#FC6B57] font-medium">Average savings of £75 per booking</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
              <div className="text-[#FC6B57] mb-6 transform transition-transform duration-300 group-hover:scale-110">
                <div className="bg-[#FFF8F7] w-16 h-16 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Built just for kids&apos; parties</h3>
              <p className="text-[#707070]">Specialized for children&apos;s events, not generic bookings. We understand what makes a great kids&apos; party.</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-[#FC6B57] font-medium">10,000+ successful parties</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 bg-white relative">
  <div className="absolute top-0 left-0 w-full h-64 bg-[#FFF8F7]/50 z-0"></div>

  <div className="container mx-auto px-4 relative z-10">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-[#2F2F2F] mb-4 relative inline-block">
        Popular Categories
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#FC6B57] rounded-full"></div>
      </h2>
      <p className="text-[#707070] max-w-2xl mx-auto mt-6">
        Find everything you need for the perfect party
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
      {[
        { src: "https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748594938/face-painter_kdiqia.png", alt: "Face painter with child", title: "Face Painters", price: "From £85" },
        { src: "https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748594952/bouncy-castle_gaq0z4.png", alt: "Bouncy castle", title: "Bouncy Castles", price: "From £120" },
        { src: "https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748594968/party-host_omxpqr.jpg", alt: "Party host", title: "Party Hosts", price: "From £150" },
        { src: "https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748594980/birthday-cake_f8wr1u.png", alt: "Birthday cake", title: "Cakes & Catering", price: "From £65" },
        { src: "https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748594997/balloons_r2wbfh.png", alt: "Party decorations", title: "Decor & Extras", price: "From £45" },
      ].map((item, idx) => (
        <div key={idx} className="relative group overflow-hidden rounded-xl shadow-md w-full h-64">
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/70 to-transparent z-10"></div>
          <Image 
            src={item.src}
            alt={item.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={idx < 2}
          />
          <div className="absolute bottom-0 left-0 w-full p-4 z-20">
            <div className="text-white mb-2 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white text-center">{item.title}</h3>
            <div className="mt-2 flex justify-center">
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                {item.price}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-12 text-center">
      <a
        href="#"
        className="inline-flex items-center justify-center bg-[#FC6B57] text-white px-6 py-3 rounded-full hover:bg-[#e55c48] transition-colors"
      >
        View All Categories
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </a>
    </div>
  </div>
</section>


      {/* Testimonials */}
      <section className="py-20 bg-[#FFF8F7] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#FC6B57]/5"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[#FC6B57]/5"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-[#FC6B57]/5"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2F2F2F] mb-4 relative inline-block">
              What Parents Say
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#FC6B57] rounded-full"></div>
            </h2>
            <p className="text-[#707070] max-w-2xl mx-auto mt-6">
              Don&apos;t just take our word for it — hear from parents who&apos;ve used BookABash
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white p-8 md:p-12 rounded-2xl shadow-xl">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[#FC6B57] text-7xl">&quot;</div>
              
              <div className="mt-6 text-center">
                <p className="text-xl md:text-2xl text-[#2F2F2F] italic mb-8">
                  {testimonials[activeTestimonial].quote}
                </p>
                
                <div className="flex items-center justify-center mb-4">
                  <div className="text-[#FC6B57] text-xl">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <span key={i} className="inline-block">★</span>
                    ))}
                  </div>
                </div>
                
                <p className="font-semibold text-[#2F2F2F] text-lg">
                  {testimonials[activeTestimonial].author}
                </p>
              </div>
              
              <div className="mt-10 flex justify-center space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      activeTestimonial === index ? 'bg-[#FC6B57]' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
              
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <button
                  onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                  className="bg-white rounded-full p-2 shadow-md hover:bg-[#FFF8F7] transition-colors"
                  aria-label="Previous testimonial"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FC6B57]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <button
                  onClick={() => setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                  className="bg-white rounded-full p-2 shadow-md hover:bg-[#FFF8F7] transition-colors"
                  aria-label="Next testimonial"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FC6B57]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <a href="#" className="text-[#FC6B57] font-medium hover:underline inline-flex items-center">
              Read more reviews
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F7] to-white z-0"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FC6B57]/5 rounded-bl-full z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FC6B57]/5 rounded-tr-full z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#2F2F2F] mb-6">
                  Ready to plan your next bash?
                </h2>
                <p className="text-[#707070] mb-8">
                  Join thousands of happy parents who&apos;ve made party planning a breeze with BookABash. Your perfect party is just a few clicks away.
                </p>
                <div className="space-y-4">
                  <a
                    href="#"
                    className="block w-full bg-[#FC6B57] text-white px-6 py-4 rounded-full hover:bg-[#e55c48] transition-colors text-center text-lg font-medium"
                  >
                    Start Booking Now
                  </a>
                  <a
                    href="#"
                    className="block w-full border border-[#FC6B57] text-[#FC6B57] px-6 py-4 rounded-full hover:bg-[#FC6B57] hover:text-white transition-colors text-center text-lg font-medium"
                  >
                    Browse Top Categories
                  </a>
                </div>
              </div>
              <div className="md:w-1/2 relative min-h-[300px]">
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748595066/party_uam87x.png"
                alt="Happy children celebrating at a birthday party"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              </div>
            </div>
            <div className="bg-[#FFF8F7] p-6 text-center">
              <p className="text-[#2F2F2F] font-medium">
                Have questions? <a href="#" className="text-[#FC6B57] hover:underline">Chat with our team</a> or call us at <span className="text-[#FC6B57]">0800 123 4567</span>
              </p>
            </div>
          </div>
        </div>
      </section>
{/* Success Modal */}
{showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-8 text-center">
              {/* Success Icon */}
              <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-[#2F2F2F] mb-4">🎉 Welcome to BookABash!</h3>

              {/* Message */}
              <p className="text-[#707070] mb-6 leading-relaxed">
                Thanks for signing up! We&apos;ve sent you a confirmation email with next steps to get your business listed.
              </p>

              {/* Email reminder */}
              <div className="bg-[#FFF8F7] border border-[#FC6B57]/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#FC6B57] mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-[#2F2F2F]">Check your email</span>
                </div>
                <p className="text-xs text-[#707070]">
                  Don&apos;t forget to check your spam folder if you don&apos;t see it in your inbox!
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-[#FC6B57] text-white px-6 py-3 rounded-full hover:bg-[#e55c48] transition-colors font-medium"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
    
   

 
    </div >
  )
}

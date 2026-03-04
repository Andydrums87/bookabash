"use client"

import { useState } from "react"
import { ChevronRight, Search } from "lucide-react"
import Image from "next/image"

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openFAQs, setOpenFAQs] = useState(new Set())

  const toggleFAQ = (id) => {
    const newOpenFAQs = new Set(openFAQs)
    if (newOpenFAQs.has(id)) {
      newOpenFAQs.delete(id)
    } else {
      newOpenFAQs.add(id)
    }
    setOpenFAQs(newOpenFAQs)
  }

  const faqs = [
    {
      id: 1,
      question: "How does PartySnap work?",
      answer: "Pick a theme, and we'll build a complete party plan for you — venue, entertainment, cakes, decorations, and more. You can customise everything from your dashboard, then book it all in one go. We handle everything so you don't have to."
    },
    {
      id: 2,
      question: "How does the booking process work?",
      answer: "Once you've secured your party, our team gets to work sourcing and arranging everything with our partners. Within 2 working days, you'll receive a full confirmation email with all the details locked in. Everything is subject to availability — if anything isn't available, we'll contact you with a great alternative or give you a full refund. You're never left in the dark."
    },
    {
      id: 3,
      question: "How much does it cost?",
      answer: "Every party is different. Your total depends on which categories and options you choose. You'll see the full price breakdown before you pay — no hidden fees."
    },
    {
      id: 4,
      question: "What areas do you cover?",
      answer: "We currently cover St Albans and surrounding areas in Hertfordshire. We're expanding soon — if you're outside our area, get in touch and we'll see what we can do."
    },
    {
      id: 5,
      question: "How far in advance should I book?",
      answer: "We recommend at least 3-4 weeks before your party date. The earlier you book, the more availability you'll have — especially for popular dates like weekends in summer."
    },
    {
      id: 6,
      question: "Can I change my party plan after booking?",
      answer: "Yes. Your dashboard stays live after booking. You can add extras, swap options, or update details anytime."
    },
    {
      id: 7,
      question: "Can I cancel my booking?",
      answer: "Yes — free cancellation is available. Check our terms and conditions for the full cancellation policy and timeframes."
    },
    {
      id: 8,
      question: "What if a partner doesn't show up?",
      answer: "We vet every partner on our platform. In the rare event something goes wrong, we'll arrange an alternative or refund you. You'll also receive partner contact details 48 hours before your party."
    },
    {
      id: 9,
      question: "How do you choose your partners?",
      answer: "Every partner is vetted before they join the platform. We check reviews, experience, insurance, and reliability. Only the best make it into Snappy's squad."
    },
    {
      id: 10,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards through Stripe. Your payment is fully secure."
    },
    {
      id: 11,
      question: "Can I add more to my party later?",
      answer: "Absolutely. After booking, you can add categories you skipped — balloons, face painting, photography, and more — directly from your dashboard."
    },
    {
      id: 12,
      question: "How do invitations work?",
      answer: "Once your venue is confirmed, you can create and send digital invitations from your dashboard. Share them via WhatsApp, email, or our built-in invite builder."
    },
    {
      id: 13,
      question: "How do I contact you?",
      answer: "Reply to any of our emails or drop us a line at hello@partysnap.co.uk. Real humans, no bots."
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-[hsl(var(--primary-400))] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752828017/iStock-1149320278_srn8ti-removebg-preview_njfbhn.png"
            alt="Help Center"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              How can we help you?
            </h1>
            <p className="text-white/90 text-base md:text-lg mb-8">
              Welcome to our Help Center! Here, you'll find answers to frequently asked questions, helpful guides, and useful tips to assist you in getting the most out of our platform.
            </p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder:text-gray-400 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
              {/* Left Side - Title */}
              <div className="lg:col-span-1">
                <p className="text-sm font-medium text-gray-500 mb-2">Support</p>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">FAQs</h2>
                <p className="text-gray-600 leading-relaxed">
                  Have questions? We've got answers! Check out our Frequently Asked Questions (FAQs) to find quick solutions to common queries. Save time and get the information you need right here.
                </p>
              </div>

              {/* Right Side - FAQ List */}
              <div className="lg:col-span-2">
                <div className="divide-y divide-gray-200">
                  {filteredFAQs.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No results found. Try a different search term.</p>
                    </div>
                  ) : (
                    filteredFAQs.map(faq => (
                      <div key={faq.id} className="py-5">
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full text-left flex items-center justify-between group"
                        >
                          <h3 className="text-base md:text-lg font-medium text-gray-900 pr-4 group-hover:text-primary-600 transition-colors">
                            {faq.question}
                          </h3>
                          <ChevronRight
                            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                              openFAQs.has(faq.id) ? 'rotate-90' : ''
                            }`}
                          />
                        </button>

                        {openFAQs.has(faq.id) && (
                          <div className="mt-3 pr-10">
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

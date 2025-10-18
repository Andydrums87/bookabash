"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Sparkles,
  CheckCircle,
  Circle,
  ChevronRight,
  Calendar,
  Clock,
  PartyPopper,
  AlertCircle,
  TrendingUp,
  X
} from "lucide-react"

// Category images mapping (same as EmptySupplierCard)
const CATEGORY_IMAGES = {
  venue: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1759827489/axdrlu8nswmpbrdgra6c.jpg",
  entertainment: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460635/edson-junior-YlgnX_ISPLo-unsplash_wlsz60.jpg",
  cakes: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753224729/hpvtz7jiktglaxcivftv.jpg",
  catering: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1760617877/iStock-530205524_tjmnq7.jpg",
  facePainting: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1755590150/howzjwfgpd9swhvcwqke.jpg",
  activities: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386709/bouncy-castle-3587770_640_dhjv02.webp",
  partyBags: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386272/iStock-2212524051_v1njlh.jpg",
  decorations: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1760617929/iStock-1463458517_vqltq9.jpg",
  balloons: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381160/iStock-1564856102_abqkpd.jpg"
}

// Snappy's image
const SNAPPY_IMAGE = "https://res.cloudinary.com/dghzq6xtd/image/upload/v1755719830/bs2klexzuin8ygfndexc.png"

// Calculate timeline phase based on days until party
const getTimelinePhase = (daysUntil) => {
  if (daysUntil > 90) return "planning"
  if (daysUntil > 60) return "organizing"
  if (daysUntil > 30) return "booking"
  if (daysUntil > 14) return "confirming"
  if (daysUntil > 7) return "finalizing"
  if (daysUntil > 0) return "final-week"
  return "party-day"
}

// Get phase info
const getPhaseInfo = (phase) => {
  const phases = {
    planning: {
      title: "Let's Get Started!",
      color: "blue",
      message: "Loads of time! Let's lock in the venue and get the fun stuff sorted."
    },
    organizing: {
      title: "Building Your Dream Party",
      color: "indigo",
      message: "Time to grab those entertainers and sort the food - the exciting part!"
    },
    booking: {
      title: "Nearly There!",
      color: "purple",
      message: "Just need to add the final touches - balloons, decorations, all the fun bits!"
    },
    confirming: {
      title: "Invites Time!",
      color: "teal",
      message: "Send those invites out and watch the RSVPs roll in!"
    },
    finalizing: {
      title: "Final Countdown",
      color: "orange",
      message: "Last bits and pieces - you're doing great!"
    },
    "final-week": {
      title: "It's Nearly Here!",
      color: "red",
      message: "One week to go! Time flies when you're party planning 🎈"
    },
    "party-day": {
      title: "IT'S PARTY TIME!",
      color: "green",
      message: "Have the BEST day ever! 🎉"
    }
  }
  return phases[phase] || phases.planning
}

// Generate checklist based on phase and completion status
const generateChecklist = (phase, suppliers, partyDetails, guestList, giftRegistry, einvites) => {
  const allChecklist = {
    planning: [
      {
        id: "venue",
        title: "Book a Venue",
        description: "Secure your party location first - this is where the magic happens!",
        action: "Browse Venues",
        category: "venue"
      },
      {
        id: "theme",
        title: "Choose Party Theme",
        description: "Pick a theme your little one will love",
        action: null
      },
      {
        id: "budget",
        title: "Set Your Budget",
        description: "Work out how much you want to spend overall",
        action: null
      }
    ],
    organizing: [
      {
        id: "entertainment",
        title: "Book Entertainment",
        description: "Get those entertainers booked - they disappear fast!",
        action: "Browse Entertainment",
        category: "entertainment"
      },
      {
        id: "catering",
        title: "Arrange Catering",
        description: "Sort out food and drinks for your guests",
        action: "Browse Catering",
        category: "catering"
      },
      {
        id: "cake",
        title: "Order the Cake",
        description: "Don't forget the birthday cake - the star of the show!",
        action: "Browse Cakes",
        category: "cakes"
      },
      {
        id: "guest-list",
        title: "Create Guest List",
        description: "Start building your list of who to invite",
        action: "Create List",
        href: `/rsvps/${partyDetails?.id}`
      }
    ],
    booking: [
      {
        id: "decorations",
        title: "Order Decorations",
        description: "Make your venue look absolutely amazing!",
        action: "Browse Decorations",
        category: "decorations"
      },
      {
        id: "balloons",
        title: "Arrange Balloons",
        description: "Add some color and fun to your party",
        action: "Browse Balloons",
        category: "balloons"
      },
      {
        id: "activities",
        title: "Plan Activities",
        description: "Keep the kids entertained throughout the party",
        action: "Browse Activities",
        category: "activities"
      },
      {
        id: "face-painting",
        title: "Book Face Painting",
        description: "Kids absolutely love face painting!",
        action: "Browse Face Painting",
        category: "facePainting"
      }
    ],
    confirming: [
      {
        id: "einvites",
        title: "Create E-Invites",
        description: "Design beautiful digital invitations for your guests",
        action: "Create Invites",
        href: "/e-invites/create"
      },
      {
        id: "send-invites",
        title: "Send Invitations",
        description: "Get those invites out - 3 weeks notice is perfect!",
        action: "Send Now",
        href: einvites ? `/e-invites/${einvites.inviteId}/manage` : "/e-invites/create"
      },
      {
        id: "gift-registry",
        title: "Set Up Gift Registry",
        description: "Help guests choose the perfect gifts for your little one",
        action: "Create Registry",
        href: "/gift-registry"
      },
      {
        id: "party-bags",
        title: "Order Party Bags",
        description: "Send guests home happy with lovely party bags",
        action: "Browse Party Bags",
        category: "partyBags"
      }
    ],
    finalizing: [
      {
        id: "confirm-numbers",
        title: "Confirm Final Numbers",
        description: "Check those RSVPs and get a final headcount",
        action: "View RSVPs",
        href: `/rsvps/${partyDetails?.id}`
      },
      {
        id: "confirm-suppliers",
        title: "Confirm All Suppliers",
        description: "Give all your suppliers a quick call to confirm everything"
      },
      {
        id: "dietary",
        title: "Check Dietary Requirements",
        description: "Make sure you've got allergies and special diets covered"
      },
      {
        id: "timeline",
        title: "Plan Your Day",
        description: "Work out a rough timeline for party day"
      }
    ],
    "final-week": [
      {
        id: "shopping",
        title: "Last-Minute Shopping",
        description: "Grab any final bits and bobs you might need"
      },
      {
        id: "prep-bags",
        title: "Fill Party Bags",
        description: "Do this NOW - you'll thank me later! Trust me on this one"
      },
      {
        id: "reminders",
        title: "Send Quick Reminders",
        description: "A quick text to everyone = fewer no-shows!"
      },
      {
        id: "setup-plan",
        title: "Think Through Setup",
        description: "Walk through how you'll set everything up on the day"
      }
    ],
    "party-day": [
      {
        id: "setup",
        title: "Get There Early",
        description: "Setup always takes longer than you think - give yourself time!"
      },
      {
        id: "relax",
        title: "Take a Deep Breath",
        description: "You've absolutely smashed it! Now enjoy watching your little one have the best day ever! 🌟"
      }
    ]
  }

  return allChecklist[phase] || []
}

// Get relevant blog posts for current phase
const getBlogRecommendations = (phase, suppliers, daysUntil) => {
  // Helper to slugify titles
  const slugify = (text) => text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")

  const allBlogPosts = [
    {
      id: 1,
      title: "The Ultimate Guide to Planning a Children's Party in London: 2025 Edition",
      slug: slugify("The Ultimate Guide to Planning a Children's Party in London: 2025"),
      excerpt: "Everything you need to know about planning the perfect children's party in London this year, from venues to entertainment.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595127/blog-post-1_lztnfr.png",
      category: "Planning",
      readTime: "8 min read",
      phases: ["planning", "organizing", "booking"]
    },
    {
      id: 2,
      title: "How Much Does a Children's Party Cost in London? A Complete Breakdown",
      slug: slugify("How Much Does a Children's Party Cost in London? A Complete Breakdown"),
      excerpt: "A detailed analysis of children's party costs in London, with budgeting tips and money-saving strategies for parents.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595130/blog-post-2_tjjp76.png",
      category: "Budget",
      readTime: "6 min read",
      phases: ["planning", "organizing"]
    },
    {
      id: 3,
      title: "15 Trending Children's Party Themes in London for 2025",
      slug: slugify("15 Trending Children's Party Themes in London for 2025"),
      excerpt: "Discover the hottest party themes that London kids are loving this year, from tech-inspired celebrations to eco-friendly gatherings.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595133/blog-post-3_ltyj0d.png",
      category: "Themes",
      readTime: "7 min read",
      phases: ["planning"]
    },
    {
      id: 4,
      title: "10 Outdoor Party Games That London Kids Can't Get Enough Of",
      slug: slugify("10 Outdoor Party Games That London Kids Can't Get Enough Of"),
      excerpt: "Get kids moving with these popular outdoor party games that are perfect for London parks and gardens.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595136/blog-post-4_d2bv5i.png",
      category: "Activities",
      readTime: "5 min read",
      phases: ["booking", "finalizing", "final-week"]
    },
    {
      id: 5,
      title: "DIY Party Decorations That Will Wow Your Guests",
      slug: slugify("DIY Party Decorations That Will Wow Your Guests"),
      excerpt: "Create stunning party decorations on a budget with these simple DIY ideas that anyone can master.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595139/blog-post-5_nvozyq.png",
      category: "Planning",
      readTime: "4 min read",
      phases: ["booking", "confirming", "finalizing"]
    },
    {
      id: 6,
      title: "Healthy Party Food Options That Kids Actually Love",
      slug: slugify("Healthy Party Food Options That Kids Actually Love"),
      excerpt: "Nutritious and delicious party food ideas that will keep both kids and parents happy at your next celebration.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595143/blog-post-6_jguagy.png",
      category: "Food",
      readTime: "5 min read",
      phases: ["organizing", "booking", "confirming"]
    },
  ]

  // Filter blog posts by phase
  const relevantPosts = allBlogPosts.filter(post => post.phases.includes(phase))

  // If no specific posts for this phase, return the planning guide
  if (relevantPosts.length === 0) {
    return [allBlogPosts[0]]
  }

  // Return up to 3 posts
  return relevantPosts.slice(0, 3)
}

const SnappyTimelineAssistant = ({
  partyDetails,
  suppliers = {},
  guestList = [],
  giftRegistry = null,
  einvites = null,
  onSupplierClick
}) => {
  const [isOpen, setIsOpen] = useState(false)

  // Calculate days until party
  const calculateDaysUntil = () => {
    if (!partyDetails?.date) return 60 // Default to 2 months
    const partyDate = new Date(partyDetails.date)
    const now = new Date()
    const diffInDays = Math.ceil((partyDate - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, diffInDays)
  }

  const daysUntil = calculateDaysUntil()
  const phase = getTimelinePhase(daysUntil)
  const phaseInfo = getPhaseInfo(phase)
  const checklist = generateChecklist(phase, suppliers, partyDetails, guestList, giftRegistry, einvites)
  const blogRecommendations = getBlogRecommendations(phase, suppliers, daysUntil)

  const handleItemClick = (item) => {
    if (item.href) {
      window.location.href = item.href
    } else if (item.category && onSupplierClick) {
      onSupplierClick(item.category)
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Trigger Card - Simple & Fun */}
      <Card
        className="bg-[hsl(var(--primary-400))] border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-shrink-0">
              <Image
                src={SNAPPY_IMAGE}
                alt="Snappy the crocodile"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div>
                  <h3 className="text-white font-bold">Snappy's Help</h3>
                  <p className="text-white/80 text-xs">{phaseInfo.title}</p>
                </div>
              </div>
              <p className="text-white/90 text-sm">
                {daysUntil} days to party time!
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Image
                      src={SNAPPY_IMAGE}
                      alt="Snappy the crocodile"
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Snappy's Help</h2>
                    <p className="text-white/90 text-sm">{phaseInfo.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Phase Info */}
              {/* <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{phaseInfo.title}</h3>
                    <p className="text-white/80 text-sm">{daysUntil} days to party time!</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 rounded-lg px-3 py-2">
                      <p className="text-2xl font-bold">{daysUntil}</p>
                      <p className="text-white/80 text-xs">days</p>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh] p-6">
              {/* Blog Recommendations */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Helpful Guides from Snapspiration</h3>
                <div className="space-y-3">
                  {blogRecommendations.map((post) => (
                    <a
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="block bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[hsl(var(--primary-300))] hover:shadow-md transition-all group"
                    >
                      <div className="flex gap-3">
                        {/* Blog Post Image */}
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="96px"
                          />
                        </div>

                        {/* Blog Post Content */}
                        <div className="flex-1 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-[hsl(var(--primary-100))] text-[hsl(var(--primary-700))] px-2 py-0.5 rounded-full font-medium">
                              {post.category}
                            </span>
                            <span className="text-xs text-gray-500">{post.readTime}</span>
                          </div>
                          <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-[hsl(var(--primary-600))]">
                            {post.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Recommended Actions</h3>
                <div className="space-y-3">
                  {checklist.map((item) => {
                    const categoryImage = item.category ? CATEGORY_IMAGES[item.category] : null

                    return (
                      <div
                        key={item.id}
                        className={`border rounded-lg overflow-hidden transition-all bg-white border-gray-200 hover:border-[hsl(var(--primary-300))] hover:shadow-sm ${
                          item.action || item.href ? 'cursor-pointer' : ''
                        }`}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="flex gap-3">
                          {/* Image if category exists */}
                          {categoryImage && (
                            <div className="relative w-24 h-24 flex-shrink-0">
                              <Image
                                src={categoryImage}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 p-4">
                            <h4 className="font-semibold mb-1 text-gray-900">
                              {item.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {item.description}
                            </p>
                            {(item.action || item.href) && (
                              <Button
                                size="sm"
                                className="bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleItemClick(item)
                                }}
                              >
                                {item.action || 'Go'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

export default SnappyTimelineAssistant

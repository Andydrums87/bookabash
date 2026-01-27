"use client"

import Link from "next/link"
import EmergencyContacts from '../EmergencyContacts'

export default function MoreTabContent({
  setShowChecklistModal,
  visibleSuppliers,
  enquiries,
  partyDetails,
}) {
  // Calculate days until party for blog filtering
  const calculateDaysUntil = () => {
    if (!partyDetails?.date) return 60
    const partyDate = new Date(partyDetails.date)
    const now = new Date()
    const diffInDays = Math.ceil((partyDate - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, diffInDays)
  }

  const daysUntil = calculateDaysUntil()

  // Determine phase
  const getTimelinePhase = (days) => {
    if (days > 90) return "planning"
    if (days > 60) return "organizing"
    if (days > 30) return "booking"
    if (days > 14) return "confirming"
    if (days > 7) return "finalizing"
    if (days > 0) return "final-week"
    return "party-day"
  }

  const phase = getTimelinePhase(daysUntil)

  // Blog posts
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
      excerpt: "Everything you need to know about planning the perfect children's party in London this year",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595127/blog-post-1_lztnfr.png",
      category: "Planning",
      readTime: "8 min read",
      phases: ["planning", "organizing", "booking"]
    },
    {
      id: 2,
      title: "How Much Does a Children's Party Cost in London?",
      slug: slugify("How Much Does a Children's Party Cost in London? A Complete Breakdown"),
      excerpt: "A detailed analysis of children's party costs in London, with budgeting tips and money-saving strategies",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595130/blog-post-2_tjjp76.png",
      category: "Budget",
      readTime: "6 min read",
      phases: ["planning", "organizing"]
    },
    {
      id: 3,
      title: "15 Trending Children's Party Themes in London for 2025",
      slug: slugify("15 Trending Children's Party Themes in London for 2025"),
      excerpt: "Discover the hottest party themes that London kids are loving this year",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595133/blog-post-3_ltyj0d.png",
      category: "Themes",
      readTime: "7 min read",
      phases: ["planning"]
    },
    {
      id: 4,
      title: "10 Outdoor Party Games That London Kids Can't Get Enough Of",
      slug: slugify("10 Outdoor Party Games That London Kids Can't Get Enough Of"),
      excerpt: "Get kids moving with these popular outdoor party games perfect for London parks",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595136/blog-post-4_d2bv5i.png",
      category: "Activities",
      readTime: "5 min read",
      phases: ["booking", "finalizing", "final-week"]
    },
    {
      id: 5,
      title: "DIY Party Decorations That Will Wow Your Guests",
      slug: slugify("DIY Party Decorations That Will Wow Your Guests"),
      excerpt: "Create stunning party decorations on a budget with these simple DIY ideas",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595139/blog-post-5_nvozyq.png",
      category: "Planning",
      readTime: "4 min read",
      phases: ["booking", "confirming", "finalizing"]
    },
    {
      id: 6,
      title: "Healthy Party Food Options That Kids Actually Love",
      slug: slugify("Healthy Party Food Options That Kids Actually Love"),
      excerpt: "Nutritious and delicious party food ideas that will keep both kids and parents happy",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595143/blog-post-6_jguagy.png",
      category: "Food",
      readTime: "5 min read",
      phases: ["organizing", "booking", "confirming"]
    }
  ]

  // Filter posts by phase
  const relevantPosts = allBlogPosts.filter(post => post.phases.includes(phase))
  const blogPosts = relevantPosts.length > 0 ? relevantPosts.slice(0, 3) : [allBlogPosts[0]]

  return (
    <div className="space-y-8 py-6 px-4">
      {/* Party Checklist - prominent button */}
      <div>
        <button
          onClick={() => setShowChecklistModal(true)}
          className="w-full bg-primary-50 border-2 border-[hsl(var(--primary-200))] rounded-lg p-6 hover:shadow-lg transition-all active:scale-[0.98] relative overflow-hidden text-left"
          style={{
            transform: 'rotate(-0.5deg)',
            boxShadow: '3px 3px 8px rgba(0,0,0,0.1)'
          }}
        >
          {/* Tape effect at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-6 bg-white/60 border border-[hsl(var(--primary-200))]/40 rotate-0"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
            }}
          />

          <div className="relative">
            <h3 className="text-primary-800 text-3xl mb-2" style={{ fontFamily: 'Indie Flower, cursive', fontWeight: 700 }}>
              Party Checklist ✓
            </h3>
            <p className="text-primary-700 text-xl leading-tight" style={{ fontFamily: 'Indie Flower, cursive' }}>
              Don't forget anything for the big day!
            </p>

            {/* Hand-drawn arrow */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-primary-400 text-4xl" style={{ fontFamily: 'Indie Flower, cursive', transform: 'translateY(-50%) rotate(-5deg)' }}>
              →
            </div>
          </div>
        </button>
      </div>

      {/* Emergency Contacts */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
            Emergency Contacts
            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
          </h2>
          <p className="text-sm text-gray-600 mt-3">Quick access to all your supplier contacts</p>
        </div>
        <EmergencyContacts
          suppliers={visibleSuppliers}
          enquiries={enquiries}
          partyDetails={partyDetails}
        />
      </div>

      {/* Snappy's Tips */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
            Snappy's Tips
            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
          </h2>
          <p className="text-sm text-gray-600 mt-3">Helpful guides & inspiration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="bg-white border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all active:scale-[0.98] overflow-hidden group"
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    {post.category}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full font-semibold">
                    {post.readTime}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-1 text-sm leading-tight line-clamp-2">{post.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}

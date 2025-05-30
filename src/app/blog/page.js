"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Planning", "Budget", "Themes", "Activities", "Food", "Venues"];

  const featuredPosts = [
    {
      id: 1,
      title: "The Ultimate Guide to Planning a Children's Party in London: 2025 Edition",
      excerpt: "Everything you need to know about planning the perfect children's party in London this year, from venues to entertainment.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595127/blog-post-1_lztnfr.png",
      category: "Planning",
      date: "May 15, 2025",
      readTime: "8 min read",
      featured: true,
    },
    {
      id: 2,
      title: "How Much Does a Children's Party Cost in London? A Complete Breakdown",
      excerpt: "A detailed analysis of children's party costs in London, with budgeting tips and money-saving strategies for parents.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595130/blog-post-2_tjjp76.png",
      category: "Budget",
      date: "May 10, 2025",
      readTime: "6 min read",
      featured: true,
    },
    {
      id: 3,
      title: "15 Trending Children's Party Themes in London for 2025",
      excerpt: "Discover the hottest party themes that London kids are loving this year, from tech-inspired celebrations to eco-friendly gatherings.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595133/blog-post-3_ltyj0d.png",
      category: "Themes",
      date: "May 5, 2025",
      readTime: "7 min read",
      featured: true,
    },
  ];

  const recentPosts = [
    {
      id: 4,
      title: "10 Outdoor Party Games That London Kids Can't Get Enough Of",
      excerpt: "Get kids moving with these popular outdoor party games that are perfect for London parks and gardens.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595136/blog-post-4_d2bv5i.png",
      category: "Activities",
      date: "April 28, 2025",
      readTime: "5 min read",
    },
    {
      id: 5,
      title: "DIY Party Decorations That Will Wow Your Guests",
      excerpt: "Create stunning party decorations on a budget with these simple DIY ideas that anyone can master.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595139/blog-post-5_nvozyq.png",
      category: "Planning",
      date: "April 22, 2025",
      readTime: "4 min read",
    },
    {
      id: 6,
      title: "Healthy Party Food Options That Kids Actually Love",
      excerpt: "Nutritious and delicious party food ideas that will keep both kids and parents happy at your next celebration.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595143/blog-post-6_jguagy.png",
      category: "Food",
      date: "April 15, 2025",
      readTime: "5 min read",
    },
  ];

  const allPosts = [...featuredPosts, ...recentPosts];

  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFDFB]">
      {/* Blog Hero */}
      <section className="relative py-12 md:py-20">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FC6B57]/40 to-[#FC6B57]/30 z-10"></div>
          <Image src="/blog-hero.png" alt="Children's party decorations and supplies" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-lg shadow-xl">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-[#2F2F2F] mb-4">The BookABash Blog</h1>
              <p className="text-xl text-[#707070] mb-8">Expert tips, ideas, and inspiration for planning the perfect children&apos;s party</p>
              <div className="relative max-w-2xl mx-auto">
                <input type="text" placeholder="Search articles..." className="w-full p-4 pl-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FC6B57] shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((category) => (
              <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? "bg-[#FC6B57] text-white" : "bg-gray-100 text-[#707070] hover:bg-gray-200"}`}>
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured & Recent Posts */}
      {["Featured Articles", "Recent Articles"].map((sectionTitle, index) => {
        const posts = sectionTitle === "Featured Articles" ? filteredPosts.filter(post => post.featured) : filteredPosts.filter(post => !post.featured || selectedCategory !== "All");
        return (
          <section key={sectionTitle} className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-[#2F2F2F] mb-8 relative inline-block">
                {sectionTitle}
                <div className="absolute -bottom-2 left-0 w-24 h-1 bg-[#FC6B57] rounded-full"></div>
              </h2>
              {posts.length > 0 ? (
                <div className={`grid ${sectionTitle === "Featured Articles" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-8`}>
                  {posts.map(post => (
                    <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg">
                      <div className="relative h-48">
                        <Image src={post.image || "/placeholder.svg"} alt={post.title} fill sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw" className="object-cover transition-transform duration-500 hover:scale-110" />
                        <div className="absolute top-4 left-4">
                          <span className="bg-[#FC6B57] text-white text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <span>{post.date}</span>
                          <span className="mx-2">•</span>
                          <span>{post.readTime}</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#2F2F2F] mb-2 line-clamp-2">{post.title}</h3>
                        <p className="text-[#707070] mb-4 line-clamp-3">{post.excerpt}</p>
                        <Link href={`/blog/${post.id}`} className="text-[#FC6B57] flex items-center hover:underline">
                          Read more
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-[#707070]">No articles found in this category.</p>
                  <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }} className="mt-4 bg-[#FC6B57] text-white px-4 py-2 rounded-full hover:bg-[#e55c48] transition-colors">
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

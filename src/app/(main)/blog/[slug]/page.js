"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { allPosts } from "@/content/blogPost"; // adjust path as needed
import NotFoundMessage from "@/components/NotFoundMessage";
import Head from "next/head";

export default function BlogDetailPage({ params }) {
  const { slug } = React.use(params);

  const post = allPosts.find((p) => p.slug === slug);
  if (!post) {
    return <NotFoundMessage />;
  }


  const related = allPosts.filter((p) => post.relatedPosts?.includes(p.id));

  return (
    <>
      <head>
        <title>{post.title}</title>
        <meta name="description" content={post.metaDescription || post.excerpt} />
        <link rel="canonical" href={`https://yourdomain.com/blog/${post.slug}`} />

        {/* Open Graph Meta */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription || post.excerpt} />
        <meta property="og:image" content={post.image} />
        <meta property="og:url" content={`https://yourdomain.com/blog/${post.slug}`} />
        <meta property="og:type" content="article" />

        {/* Twitter Meta */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.metaDescription || post.excerpt} />
        <meta name="twitter:image" content={post.image} />
      </head>
    <div className="min-h-screen bg-[#FDFDFB]">
  
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 relative z-20">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center text-sm text-[#707070]">
            <Link href="/" className="hover:text-[#FC6B57] transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-[#FC6B57] transition-colors">
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#FC6B57] font-medium truncate max-w-[200px] md:max-w-none">
              {post.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Blog Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <span className="bg-[#FC6B57] text-white text-xs font-bold px-3 py-1 rounded-full">
            {post.category}
          </span>
          <div className="flex items-center text-sm text-gray-500 mt-2 space-x-3">
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-[#2F2F2F] mb-6">{post.title}</h1>
        <p className="text-xl text-[#707070] mb-6 ">{post.excerpt}</p>

        <div className="flex items-center mb-10">
          <div className="relative w-12 h-12 mr-4 rounded-full overflow-hidden">
            <Image
              src={post.author?.image || "/placeholder.svg"}
              alt={post.author?.name || "Author"}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div>
            <h3 className="font-medium text-[#2F2F2F]">{post.author?.name}</h3>
            <p className="text-sm text-[#707070]">{post.author?.role}</p>
          </div>
        </div>

        <div className="relative w-full h-[400px] mb-10 rounded-xl shadow-lg overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* Social Sharing Buttons */}
        <div className="flex justify-center mb-10 space-x-4">
          {/* Example: Facebook */}
          <button
            className="bg-[#1877F2] text-white p-2 rounded-full hover:bg-opacity-90 transition-colors"
            aria-label="Share on Facebook"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {/* Add other social buttons similarly */}
        </div>

        <div
          className="prose prose-lg max-w-none mb-12 dark:text-[#707070]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-[#2F2F2F] mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-[#707070] px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Posts */}
      {related.length > 0 && (
        <div className="bg-[#FFF8F7] py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-bold text-[#2F2F2F] mb-8">You Might Also Like</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((r) => (
                <div key={r.id} className="bg-white p-4 rounded-xl shadow">
                  <div className="relative h-40 w-full mb-4 rounded-md overflow-hidden">
                    <Image
                      src={r.image}
                      alt={r.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    {r.date} • {r.readTime}
                  </div>
                  <h3 className="text-lg font-bold text-[#2F2F2F] mb-2">{r.title}</h3>
                  <p className="text-[#707070] mb-3">{r.excerpt}</p>
                  <Link href={`/blog/${r.id}`} className="text-[#FC6B57] font-medium hover:underline inline-flex items-center">
                    Read more →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Newsletter */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-2xl bg-[#FFF8F7] p-8 rounded-xl shadow">
          <h2 className="text-2xl font-bold text-[#2F2F2F] mb-4">Get more party planning tips</h2>
          <p className="text-[#707070] mb-6">
            Subscribe to our newsletter for the latest party trends, planning advice, and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FC6B57]"
              // value={email}
              // onChange={(e) => setEmail(e.target.value)}
            />
            <button className="bg-[#FC6B57] text-white px-6 py-3 rounded-md hover:bg-[#e55c48] transition-colors">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            By subscribing, you agree to our Privacy Policy. You can unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
    </>
  );
}

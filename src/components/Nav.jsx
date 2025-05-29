"use client";

import { useState } from "react";
import Link from 'next/link';

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="relative z-50 dark:bg-[#2F2F2F]">
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between relative">
        <div className="flex items-center">
          <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1748440622/logo-darker_jhviti.png" alt="BookABash Logo" className=" h-40 absolute py-10" />
        </div>

        {/* Desktop Menu */}
        
        <div className="hidden md:flex items-center space-x-6">
        <Link href="/" className="text-[#707070] hover:text-[#FC6B57] transition-colors">Browse</Link>
        <Link href="/how-it-works" className="text-[#707070] hover:text-[#FC6B57] transition-colors">How It Works</Link>
<Link href="/blog" className="text-[#707070] hover:text-[#FC6B57] transition-colors">Blog</Link>
<Link href="/login" className="text-[#707070] hover:text-[#FC6B57] transition-colors">Log In</Link>
<Link href="/get-started" className="bg-[#FC6B57] text-white px-4 py-2 rounded-full hover:bg-[#e55c48] transition-colors">
  Get Started
</Link>

        </div>

        {/* Hamburger Button */}
        <button onClick={toggleMenu} className="md:hidden text-[#3A3A3A] z-50 relative dark:text-white">
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      <div
        className={`fixed top-[72px] left-0 w-full bg-white shadow-lg rounded-b-lg z-40 py-4 px-6 md:hidden transition-all duration-300 ease-in-out transform ${
          menuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-5 opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col gap-10 py-2">

   
         <Link href="/"  onClick={closeMenu} className="text-[#707070] hover:text-[#FC6B57] transition-colors">Browse</Link>
       <Link href="/how-it-works" onClick={closeMenu} className="text-[#707070] hover:text-[#FC6B57] transition-colors">How It Works</Link>
<Link href="/blog" onClick={closeMenu} className="text-[#707070] hover:text-[#FC6B57] transition-colors">Blog</Link>
<Link href="/login" onClick={closeMenu} className="text-[#707070] hover:text-[#FC6B57] transition-colors">Log In</Link>
<Link href="/get-started" onClick={closeMenu} className="bg-[#FC6B57] text-white px-4 py-2 rounded-full hover:bg-[#e55c48] transition-colors">
  Get Started
</Link>
</nav>
      </div>
    </div>
  );
};

export default Nav;

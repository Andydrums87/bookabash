// Server Component - No "use client" directive
import Link from "next/link"
import Image from "next/image"
import { getServerUser } from "@/lib/auth-server"

// Import client components for interactive parts
import { AuthButtons } from "./AuthButtons"
import { CartIndicator } from "./CartIndicator"
import { DashboardDropdown } from "./DashboardDropdown"
import { SearchWidget } from "./SearchWidget"
import { MobileNavWrapper } from "./MobileNavWrapper"

export async function NavServer() {
  // Fetch user on server - this is cached
  const user = await getServerUser()

  return (
    <header className="bg-white border-b border-gray-200 relative z-50">
      {/* Main Navbar */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-27">
        <div className="flex justify-between items-center h-15 md:h-20">
          {/* Logo - Server rendered */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png"
                alt="PartySnap"
                width={150}
                height={32}
                className="h-auto w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation - Server rendered static links */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-900 hover:text-[hsl(var(--primary-500))] px-3 py-2 text-md font-medium">
              Home
            </Link>
            <Link href="/browse" className="text-gray-900 hover:text-[hsl(var(--primary-500))] px-3 py-2 text-md font-medium">
              Snap Suppliers
            </Link>
            {/* Client component for interactive dropdown */}
            <DashboardDropdown initialUser={user} />
            <Link href="/blog" className="text-gray-900 hover:text-[hsl(var(--primary-500))] px-3 py-2 text-md font-medium">
              Snapspiration
            </Link>
            <Link href="/favorites" className="text-gray-900 hover:text-[hsl(var(--primary-500))] px-3 py-2 text-md font-medium">
              My Favorites
            </Link>
          </nav>

          {/* Right side - Search + Auth */}
          <div className="flex items-center space-x-4">
            {/* Client component for search */}
            <SearchWidget />

            {/* Desktop CTAs - Client component */}
            <div className="hidden md:flex items-center space-x-2">
              <AuthButtons initialUser={user} />
              <CartIndicator />
            </div>

            {/* Mobile menu - Client component */}
            <MobileNavWrapper initialUser={user} />
          </div>
        </div>
      </div>
    </header>
  )
}

export default NavServer

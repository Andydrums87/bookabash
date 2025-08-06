import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, X, Search, Star, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSuppliers } from '@/utils/mockBackend' // Your existing supplier hook

// Main Navigation Component (add this to your main navbar)
export function NavbarSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef(null)
  const router = useRouter()
  
  const { suppliers } = useSuppliers()

  // Handle search
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        const filtered = suppliers?.filter(supplier => 
          supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          supplier.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          supplier.location.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5) // Limit to 5 results
        
        setSearchResults(filtered || [])
        setIsSearching(false)
      }, 300) // Debounce search

      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }, [searchQuery, suppliers])

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
        setSearchQuery("")
        setSearchResults([])
      }
    }

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isSearchOpen])

  const handleSearchClick = () => {
    setIsSearchOpen(true)
  }

  const handleSupplierClick = (supplierId) => {
    setIsSearchOpen(false)
    setSearchQuery("")
    setSearchResults([])
    router.push(`/supplier/${supplierId}`)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchOpen(false)
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setSearchResults([])
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleSearchClick}
        className="relative"
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Search suppliers</span>
      </Button>

      {/* Search Overlay */}
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 z-40" />
          
          {/* Search Modal */}
          <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4">
              {/* Search Input */}
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search suppliers, categories, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 placeholder:text-xs "
                    autoFocus
                  />
                </div>
              </form>

              {/* Search Results */}
              <div className="mt-4 max-h-80 overflow-y-auto">
                {isSearching && (
                  <div className="text-center py-4 text-gray-500">
                    <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Searching...
                  </div>
                )}

                {!isSearching && searchQuery.trim().length > 2 && searchResults.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No suppliers found for "{searchQuery}"
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Suppliers</h3>
                    {searchResults.map((supplier) => (
                      <button
                        key={supplier.id}
                        onClick={() => handleSupplierClick(supplier.id)}
                        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={supplier.image || "/placeholder.svg"}
                              alt={supplier.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {supplier.name}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1">{supplier.category}</p>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{supplier.rating}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{supplier.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-primary-500 font-medium">
                            £{supplier.priceFrom}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Actions */}
                {searchQuery.trim().length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-sm text-primary-600 font-medium"
                    >
                      See all results for "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
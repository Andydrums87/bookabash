"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SearchWidget() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true)
      const timer = setTimeout(async () => {
        try {
          // Fetch suppliers from API instead of importing hook
          const response = await fetch(`/api/suppliers/search?q=${encodeURIComponent(searchQuery)}&limit=6`)
          if (response.ok) {
            const data = await response.json()
            setSearchResults(data.suppliers || [])
          } else {
            setSearchResults([])
          }
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        }
        setIsSearching(false)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }, [searchQuery])

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen)
    if (!isSearchOpen) {
      setTimeout(() => {
        document.getElementById('navbar-search-input')?.focus()
      }, 100)
    } else {
      setSearchQuery("")
      setSearchResults([])
    }
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
    <>
      {/* Search Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSearchToggle}
        className={`relative ${isSearchOpen ? 'bg-primary-100 text-primary-600' : ''}`}
      >
        {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        <span className="sr-only">
          {isSearchOpen ? 'Close search' : 'Open search'}
        </span>
      </Button>

      {/* Expanded Search Section - Portal to body level */}
      <div className={`fixed left-0 right-0 top-[60px] md:top-[80px] overflow-hidden transition-all duration-300 ease-in-out z-40 ${
        isSearchOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 text-xs top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="navbar-search-input"
                  type="text"
                  placeholder="Search suppliers, categories, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 placeholder:text-sm"
                />
              </div>
            </form>

            {/* Search Results */}
            <div className="max-w-4xl mx-auto">
              {isSearching && (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  Searching suppliers...
                </div>
              )}

              {!isSearching && searchQuery.trim().length > 2 && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">No suppliers found for "{searchQuery}"</p>
                  <p className="text-sm">Try searching for different keywords or browse all suppliers</p>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Found {searchResults.length} suppliers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((supplier) => (
                      <button
                        key={supplier.id}
                        onClick={() => handleSupplierClick(supplier.id)}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={supplier.image || "/placeholder.svg"}
                              alt={supplier.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate mb-1">
                              {supplier.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">{supplier.category}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{supplier.rating}</span>
                              </div>
                              <div className="text-sm font-medium text-primary-600">
                                £{supplier.priceFrom}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="text-center mt-6">
                    <Button
                      onClick={handleSearchSubmit}
                      className="bg-primary-500 hover:bg-primary-600"
                    >
                      View all results for "{searchQuery}"
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SearchWidget

// app/preview/supplier/[id]/preview-components/PreviewContextualBreadcrumb.js
"use client"

import { ChevronRight } from "lucide-react"

export function PreviewContextualBreadcrumb({ currentPage, supplierName }) {
  // Mock breadcrumb structure that looks identical but is non-functional
  const breadcrumbItems = [
    { label: "Home", href: "/", disabled: true },
    { label: "Suppliers", href: "/suppliers", disabled: true },
    { label: supplierName || "Supplier", href: null, current: true }
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-3">
          <ol className="flex items-center space-x-2">
            {breadcrumbItems.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
                {item.current ? (
                  <span className="text-gray-900 font-medium text-sm truncate max-w-[200px]">
                    {item.label}
                  </span>
                ) : (
                  <span className="text-gray-500 hover:text-gray-700 text-sm cursor-not-allowed opacity-60">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
          
          {/* Preview indicator */}
          <div className="ml-auto">
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Preview Mode
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
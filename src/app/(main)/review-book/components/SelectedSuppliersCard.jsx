"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle } from "lucide-react"
import Image from "next/image"

// Helper function to get category-specific gradients
const getSupplierGradient = (category) => {
  const gradients = {
    'Entertainment': 'bg-gradient-to-br from-purple-400 to-pink-400',
    'Venue': 'bg-gradient-to-br from-blue-400 to-indigo-400', 
    'Catering': 'bg-gradient-to-br from-orange-400 to-red-400',
    'Decorations': 'bg-gradient-to-br from-green-400 to-emerald-400',
    'FacePainting': 'bg-gradient-to-br from-pink-400 to-rose-400',
    'Activities': 'bg-gradient-to-br from-cyan-400 to-blue-400',
    'PartyBags': 'bg-gradient-to-br from-yellow-400 to-orange-400',
    'Balloons': 'bg-gradient-to-br from-teal-400 to-cyan-400',
    'Einvites': 'bg-gradient-to-br from-violet-400 to-purple-400'
  }
  return gradients[category] || 'bg-gradient-to-br from-gray-400 to-slate-400'
}

export default function SelectedSuppliersCard({ selectedSuppliers = [] }) {
  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Selected Suppliers</h2>
              <p className="text-gray-600 text-sm">
                {selectedSuppliers.length} suppliers will receive your enquiry
              </p>
            </div>
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {selectedSuppliers.length}
          </div>
        </div>

        {/* Content */}
        {selectedSuppliers.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">No suppliers selected yet</p>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/dashboard"}
              className="border-primary-300 text-primary-600 hover:bg-primary-50"
            >
              Back to Dashboard
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop: Mini supplier cards */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-4">
              {selectedSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Image/Header Section */}
                  <div className="relative h-24 w-full overflow-hidden">
                    {supplier.image ? (
                      <Image
                        src={supplier.image}
                        alt={supplier.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    ) : (
                      <div className={`w-full h-full ${getSupplierGradient(supplier.category)}`} />
                    )}
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                    
                    {/* Category badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <div className="bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-sm">
                        {supplier.category}
                      </div>
                    </div>

                    {/* Checkmark */}
                    <div className="absolute top-2 right-2 z-10">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    {/* Supplier name and price */}
                    <div className="absolute bottom-2 left-2 right-2 z-10">
                      <h3 className="font-bold text-white text-sm drop-shadow-sm truncate">
                        {supplier.name}
                      </h3>
                      {supplier.price && (
                        <p className="text-white/90 text-xs font-semibold drop-shadow-sm">
                          £{supplier.price}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer Section */}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          {supplier.icon}
                        </div>
                        <span className="text-xs text-gray-600">Selected</span>
                      </div>
                      <div className="text-right">
                        {supplier.price && (
                          <div className="text-sm font-bold text-gray-900">£{supplier.price}</div>
                        )}
                        <div className="text-xs font-semibold text-green-600">
                          ✓ Ready to send
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: Compact cards */}
            <div className="sm:hidden">
              <div className="grid grid-cols-2 gap-3">
                {selectedSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                  >
                    {/* Mobile header */}
                    <div className="relative h-16 w-full overflow-hidden">
                      {supplier.image ? (
                        <Image
                          src={supplier.image}
                          alt={supplier.name}
                          fill
                          className="object-cover"
                          sizes="50vw"
                        />
                      ) : (
                        <div className={`w-full h-full ${getSupplierGradient(supplier.category)}`} />
                      )}
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />
                      
                      {/* Checkmark */}
                      <div className="absolute top-1 right-1 z-10">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      
                      {/* Name and price */}
                      <div className="absolute bottom-1 left-1 right-1 z-10">
                        <h3 className="font-semibold text-white text-xs drop-shadow-sm truncate">
                          {supplier.name}
                        </h3>
                        {supplier.price && (
                          <p className="text-white/90 text-xs font-medium drop-shadow-sm">
                            £{supplier.price}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Mobile footer */}
                    <div className="p-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            {supplier.icon}
                          </div>
                          <span className="text-xs text-gray-600 truncate">{supplier.category}</span>
                        </div>
                        <div className="text-xs font-semibold text-green-600">✓</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary for many suppliers */}
              {selectedSuppliers.length > 4 && (
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-700 font-medium">
                      All {selectedSuppliers.length} suppliers ready to receive your enquiry
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
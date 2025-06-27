"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle, Plus, X, Clock, Users, Star } from "lucide-react"
import { useState } from "react"

const PackageDetailsModal = ({ pkg, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="relative h-64">
          <Image
            src={pkg.image || pkg.imageUrl || '/placeholder.jpg'}
            alt={pkg.name}
            fill
            className="object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white hover:bg-gray-100 rounded-full p-2 shadow-md transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-4">
            <h2 className="text-2xl font-bold text-gray-900">{pkg.name}</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-3xl font-bold text-primary">£{pkg.price}</span>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>{pkg.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {/* What's Included */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
            <div className="flex flex-wrap gap-2">
              {pkg.whatsIncluded?.map((item, i) => (
                <span key={i} className="bg-[#fff0ee] text-gray-900 text-sm font-medium px-3 py-1.5 rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Package Details</h3>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {pkg.description}
              </div>
            </div>
          </div>

          {/* Package Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Duration</div>
              <div className="font-semibold text-gray-900">{pkg.duration}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Star className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Price Type</div>
              <div className="font-semibold text-gray-900 capitalize">{pkg.priceType?.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailsModal;

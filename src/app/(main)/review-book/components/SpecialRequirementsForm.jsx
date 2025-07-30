"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, Users, Utensils, Shield } from "lucide-react"

export default function SpecialRequirementsForm({ 
  formData, 
  onInputChange, 
  onCheckboxChange 
}) {
  // Debug logging to see what the component receives
  console.log('🔍 SpecialRequirementsForm received formData:', {
    dietaryRequirements: formData?.dietaryRequirements,
    accessibilityRequirements: formData?.accessibilityRequirements
  })

  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Special Requirements</h2>
            <p className="text-gray-600 text-sm">Help us make your party perfect for everyone</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Number of Children */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Users className="w-4 h-4 inline mr-2" />
              Number of Children Expected
            </label>
            <Select
              value={formData.numberOfChildren}
              onValueChange={(value) => onInputChange("numberOfChildren", value)}
            >
              <SelectTrigger className="bg-white w-full border-gray-200 focus:border-primary-500 h-12 text-xs p-2">
                <SelectValue placeholder="Select number of children" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5-10">5-10 children</SelectItem>
                <SelectItem value="10-15">10-15 children</SelectItem>
                <SelectItem value="15-20">15-20 children</SelectItem>
                <SelectItem value="20-25">20-25 children</SelectItem>
                <SelectItem value="25+">25+ children</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dietary Requirements */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <Utensils className="w-4 h-4 mr-2" />
              Dietary Requirements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "vegetarian", label: "Vegetarian options needed", icon: "🥗" },
                { key: "vegan", label: "Vegan options needed", icon: "🌱" },
                { key: "glutenFree", label: "Gluten-free options needed", icon: "🌾" },
                { key: "nutAllergy", label: "Nut allergy considerations", icon: "🥜" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <Checkbox
                    id={item.key}
                    checked={Boolean(formData.dietaryRequirements?.[item.key])}
                    onCheckedChange={(checked) => {
                      console.log('🎯 Dietary checkbox clicked:', item.key, checked, 'current value:', formData.dietaryRequirements?.[item.key])
                      onCheckboxChange("dietaryRequirements", item.key, Boolean(checked))
                    }}
                    className="data-[state=checked]:bg-[hsl(var(--primary-500))] data-[state=checked]:border-[hsl(var(--primary-500))]"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-lg">{item.icon}</span>
                    <label htmlFor={item.key} className="text-sm text-gray-700 font-medium cursor-pointer">
                      {item.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accessibility Requirements */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Accessibility Requirements
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: "wheelchairAccessible", label: "Wheelchair accessible venue needed", icon: "♿" },
                { key: "sensoryFriendly", label: "Sensory-friendly environment", icon: "🤫" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <Checkbox
                    id={item.key}
                    checked={Boolean(formData.accessibilityRequirements?.[item.key])}
                    onCheckedChange={(checked) => {
                      console.log('🎯 Accessibility checkbox clicked:', item.key, checked, 'current value:', formData.accessibilityRequirements?.[item.key])
                      onCheckboxChange("accessibilityRequirements", item.key, Boolean(checked))
                    }}
                    className="data-[state=checked]:bg-[hsl(var(--primary-500))] data-[state=checked]:border-[hsl(var(--primary-500))]"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-lg">{item.icon}</span>
                    <label htmlFor={item.key} className="text-sm text-gray-700 font-medium cursor-pointer">
                      {item.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
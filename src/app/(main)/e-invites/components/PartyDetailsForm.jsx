// components/PartyDetailsForm.js

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Users } from "lucide-react"
import { formatDateForDisplay } from '../utils/helperFunctions'
import { getHeadlineOptions, getHeadlineStyles, getHeadlineText } from '../utils/headlineUtils'

const PartyDetailsForm = ({ 
  inviteData, 
  handleInputChange, 
  selectedTheme, 
  useAIGeneration 
}) => {
  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          Party Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Child's Name</label>
            <Input
              value={inviteData.childName}
              onChange={(e) => handleInputChange("childName", e.target.value)}
              placeholder="Enter child's name"
              className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Age</label>
            <Input
              value={inviteData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              placeholder="Age"
              className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
            />
          </div>

          {/* Headline Options - Only show for template mode */}
          {!useAIGeneration && (
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Invitation Headline
                <span className="text-xs text-gray-500 ml-2 font-normal">
                  Choose how you want to announce the party
                </span>
              </label>
              <div className="space-y-3">
                <select
                  value={inviteData.headline}
                  onChange={(e) => handleInputChange("headline", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium"
                >
                  {getHeadlineOptions(selectedTheme, inviteData.childName, inviteData.age, selectedTheme).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}: "{option.text}"
                    </option>
                  ))}
                  <option value="custom">Custom headline</option>
                </select>
                {inviteData.headline === "custom" && (
                  <Input
                    value={inviteData.customHeadline || ""}
                    onChange={(e) => handleInputChange("customHeadline", e.target.value)}
                    placeholder="Enter your custom headline"
                    className="mt-2 border-2 border-gray-200 focus:border-primary-500 rounded-lg"
                  />
                )}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="text-sm font-bold text-gray-600 mb-2">Preview:</div>
                  <div
                    style={{
                      ...getHeadlineStyles(inviteData.headline, selectedTheme),
                      position: "relative",
                      transform: "none",
                      color: "#333",
                      textShadow: "none",
                    }}
                  >
                    "{getHeadlineText(inviteData, selectedTheme)}"
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Style: {getHeadlineStyles(inviteData.headline, selectedTheme).fontSize} •{" "}
                    {getHeadlineStyles(inviteData.headline, selectedTheme).fontWeight} •{" "}
                    {getHeadlineStyles(inviteData.headline, selectedTheme).fontFamily || "Default Font"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
            <Input
              value={inviteData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              placeholder="Party date (e.g., 27/08/2025 or August 27, 2025)"
              className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
            />
            {inviteData.date && (
              <div className="mt-1 text-xs text-gray-600">
                Will display as: <span className="font-bold">"{formatDateForDisplay(inviteData.date)}"</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
            <Input
              value={inviteData.time}
              onChange={(e) => handleInputChange("time", e.target.value)}
              placeholder="Party time"
              className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Venue</label>
            <Input
              value={inviteData.venue}
              onChange={(e) => handleInputChange("venue", e.target.value)}
              placeholder="Party venue"
              className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Special Message</label>
            <Textarea
              value={inviteData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Add a special message for your guests"
              rows={3}
              className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PartyDetailsForm
// Add this to your dashboard imports at the top of the file:
// import WhilstYouWaitSection from './WhilstYouWaitSection' // or wherever you place this component

// Or if you add it directly to the dashboard file, just add the components above your main dashboard component

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Mail, Plus, Users, Send, Check, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import GiftRegistryCard from '@/components/GiftRegistryCard'

// Section Header Component
function SectionHeader({ section }) {
  return (
    <div className="mb-6 mt-20 ml-7">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
        <div className="w-20 h-20 flex-shrink-0">
          <Image
            src={section.image}
            alt={section.title}
            width={50}
            height={50}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <p>{section.title}</p>    
          <p className="text-gray-400 text-base mb-4">{section.subtitle}</p>
        </div>
      </h2>
    </div>
  );
}

// E-Invites Card Component
function EInvitesCard({ hasCreatedInvites, onCreateInvites }) {
  return (
    <Card className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200">
      {/* Top Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753869777/ChatGPT_Image_Jul_30_2025_11_02_50_AM_vfmxd5.png"
          alt="Party Invites"
          className="w-full h-full object-cover"
        />
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-pink-500 text-white border-0">
            Party Invites
          </Badge>
          {hasCreatedInvites ? (
            <Badge className="bg-green-500 text-white border-0">
              ✓ Created
            </Badge>
          ) : (
            <Badge className="bg-orange-500 text-white border-0">
              Ready
            </Badge>
          )}
        </div>

        {/* Progress indicator (if created) */}
        {hasCreatedInvites && (
          <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-white font-bold text-lg">✓</div>
            <div className="text-white/80 text-xs">Sent</div>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {!hasCreatedInvites ? (
          // No invites created yet
          <>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Beautiful E-Invites</h3>
              <p className="text-gray-600">Get everyone excited about the party!</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Mail className="w-5 h-5 text-pink-500" />
                <span className="font-semibold text-gray-900">Why create invites now?</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                While suppliers confirm, get your guest list sorted and build excitement! Digital invites are instant, trackable, and perfectly themed to your party.
              </p>
            </div>

            <Button
              onClick={onCreateInvites}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl"
            >
              <Mail className="w-5 h-5 mr-2" />
              Create E-Invites
            </Button>
          </>
        ) : (
          // Invites created
          <>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">E-Invites Created! 💌</h3>
              <p className="text-gray-600">Your invites are ready to send</p>
            </div>

            {/* Invite Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900">24</div>
                <div className="text-xs text-gray-500">Created</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">18</div>
                <div className="text-xs text-green-700">Sent</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">12</div>
                <div className="text-xs text-blue-700">Opened</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm"
                asChild
              >
                <Link href="/e-invites">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Invites
                </Link>
              </Button>

              <Button
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl text-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Send More
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Main Whilst You Wait Section Component
function WhilstYouWaitSection({ 
  registry, 
  registryItems, 
  partyTheme, 
  childAge, 
  onCreateRegistry, 
  onAddItem, 
  registryLoading,
  hasCreatedInvites,
  onCreateInvites
}) {
  const section = {
    id: "whilst-you-wait",
    title: "Whilst You Wait",
    subtitle: "Perfect time to get these sorted!",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753869777/ChatGPT_Image_Jul_30_2025_11_02_50_AM_vfmxd5.png"
  }

  return (
    <div className="mb-8 ml-7">
      {/* Section Header */}
      <SectionHeader section={section} />
      
      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gift Registry Card */}
        <GiftRegistryCard 
          registry={registry}
          registryItems={registryItems}
          partyTheme={partyTheme}
          childAge={childAge}
          onCreateRegistry={onCreateRegistry}
          onAddItem={onAddItem}
          loading={registryLoading}
        />
        
        {/* E-Invites Card */}
        <EInvitesCard 
          hasCreatedInvites={hasCreatedInvites}
          onCreateInvites={onCreateInvites}
        />
      </div>
      
      {/* Optional: Help text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          ⏱️ While suppliers confirm availability, take care of these party essentials
        </p>
      </div>
    </div>
  )
}

export default WhilstYouWaitSection
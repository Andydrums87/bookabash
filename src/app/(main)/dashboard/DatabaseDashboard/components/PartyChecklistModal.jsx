"use client"

import { useState, useEffect } from 'react'
import { UniversalModal, ModalHeader, ModalContent } from '@/components/ui/UniversalModal.jsx'
import { CheckCircle, Circle, ChevronDown, ChevronRight } from 'lucide-react'

// Import Google Font for handwritten style
if (typeof document !== 'undefined') {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}

export default function PartyChecklistModal({ isOpen, onClose, partyId, suppliers = {} }) {
  const [checklist, setChecklist] = useState({
    preParty: {
      title: "Pre-Party Tasks",
      icon: "🎪",
      items: [
        { id: 'venue', label: 'Book venue', icon: '🏛️', completed: false },
        { id: 'entertainment', label: 'Book entertainment', icon: '🎭', completed: false },
        { id: 'cake', label: 'Order cake', icon: '🎂', completed: false },
        { id: 'invitations', label: 'Send invitations', icon: '✉️', completed: false },
        { id: 'rsvps', label: 'Confirm RSVPs', icon: '✓', completed: false },
        { id: 'partyBags', label: 'Buy party bags', icon: '🎁', completed: false },
        { id: 'decorations', label: 'Get decorations/balloons', icon: '🎈', completed: false },
        { id: 'menu', label: 'Plan menu (kids + adults)', icon: '🍽️', completed: false },
        { id: 'playlist', label: 'Create playlist', icon: '🎵', completed: false },
        { id: 'tableware', label: 'Buy tableware/napkins', icon: '🍴', completed: false },
        { id: 'candles', label: 'Get candles & matches', icon: '🕯️', completed: false },
      ]
    },
    dayBefore: {
      title: "Day Before",
      icon: "📅",
      items: [
        { id: 'confirmSuppliers', label: 'Confirm all suppliers', icon: '☎️', completed: false },
        { id: 'prepBags', label: 'Prep party bags', icon: '🎁', completed: false },
        { id: 'shopping', label: 'Shop for fresh food', icon: '🛒', completed: false },
        { id: 'chargeDevices', label: 'Charge camera/phone', icon: '📱', completed: false },
      ]
    },
    dayOf: {
      title: "Day Of Party",
      icon: "🎉",
      items: [
        { id: 'weather', label: 'Check weather & pack accordingly', icon: '☔', completed: false },
        { id: 'binBags', label: 'Bring bin bags', icon: '🗑️', completed: false },
        { id: 'presentBag', label: 'Bring bag for presents', icon: '🎁', completed: false },
        { id: 'decorationsSetup', label: 'Set up decorations', icon: '🎈', completed: false },
        { id: 'speaker', label: 'Test speaker/music', icon: '🔊', completed: false },
      ]
    }
  })

  const [expandedSections, setExpandedSections] = useState({
    preParty: true,
    dayBefore: true,
    dayOf: true
  })

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Auto-check items based on booked suppliers
  useEffect(() => {
    if (partyId && suppliers) {
      const stored = localStorage.getItem(`party_checklist_${partyId}`)
      let newChecklist = { ...checklist }

      if (stored) {
        try {
          newChecklist = JSON.parse(stored)
        } catch (e) {
          console.error('Error loading checklist:', e)
        }
      }

      // Auto-check items based on suppliers
      if (suppliers.venue) {
        const venueItem = newChecklist.preParty.items.find(i => i.id === 'venue')
        if (venueItem) venueItem.completed = true
      }
      if (suppliers.entertainment) {
        const entertainmentItem = newChecklist.preParty.items.find(i => i.id === 'entertainment')
        if (entertainmentItem) entertainmentItem.completed = true
      }
      if (suppliers.cakes) {
        const cakeItem = newChecklist.preParty.items.find(i => i.id === 'cake')
        if (cakeItem) cakeItem.completed = true
      }
      if (suppliers.partyBags) {
        const partyBagsItem = newChecklist.preParty.items.find(i => i.id === 'partyBags')
        if (partyBagsItem) partyBagsItem.completed = true
      }
      if (suppliers.decorations) {
        const decorationsItem = newChecklist.preParty.items.find(i => i.id === 'decorations')
        if (decorationsItem) decorationsItem.completed = true
      }

      setChecklist(newChecklist)
    }
  }, [partyId, suppliers])

  // Save checklist to localStorage
  const saveChecklist = (newChecklist) => {
    if (partyId) {
      localStorage.setItem(`party_checklist_${partyId}`, JSON.stringify(newChecklist))
    }
    setChecklist(newChecklist)
  }

  const toggleItem = (section, itemId) => {
    const newChecklist = { ...checklist }
    const item = newChecklist[section].items.find(i => i.id === itemId)
    if (item) {
      item.completed = !item.completed
      saveChecklist(newChecklist)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Calculate progress
  const calculateProgress = () => {
    const allItems = Object.values(checklist).flatMap(section => section.items)
    const completed = allItems.filter(item => item.completed).length
    return { completed, total: allItems.length, percentage: Math.round((completed / allItems.length) * 100) }
  }

  const progress = calculateProgress()

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent className="bg-white">
        {/* Checklist Sections */}
        <div className="space-y-4">
          {Object.entries(checklist).map(([key, section]) => {
            const sectionCompleted = section.items.filter(i => i.completed).length
            const isExpanded = expandedSections[key]

            return (
              <div key={key} className="rounded-xl overflow-hidden shadow-lg border-2 border-[hsl(var(--primary-200))] relative" style={{ transform: 'rotate(-0.3deg)' }}>
                {/* Tape effect at top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-6 bg-white/60 border border-[hsl(var(--primary-200))]/40 rotate-0"
                  style={{
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                    zIndex: 10
                  }}
                />

                {/* Section Header */}
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between p-5 bg-primary-50 text-gray-800 transition-all hover:shadow-md relative"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <h3 className="font-black text-gray-800 text-3xl" style={{ fontFamily: 'Caveat, cursive', fontWeight: 900 }}>{section.title}</h3>
                      <p className="text-lg text-gray-600 font-semibold" style={{ fontFamily: 'Caveat, cursive', fontWeight: 600 }}>{sectionCompleted}/{section.items.length} done</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-6 h-6 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                  )}
                </button>

                {/* Section Items */}
                {isExpanded && (
                  <div className="p-4 space-y-2 bg-white">
                    {section.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(key, item.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        {/* Hand-drawn style checkbox */}
                        <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 transition-all ${
                          item.completed
                            ? 'bg-teal-500 border-teal-600'
                            : 'border-gray-300 group-hover:border-gray-400'
                        }`} style={{
                          borderWidth: '2.5px',
                          borderStyle: 'solid',
                          borderRadius: '4px',
                          transform: 'rotate(-1deg)',
                          boxShadow: item.completed ? '2px 2px 0px rgba(0,0,0,0.1)' : 'none'
                        }}>
                          {item.completed && (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: 'rotate(3deg)' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-2xl mr-2">{item.icon}</span>
                        <span className={`text-left flex-1 text-2xl ${item.completed ? 'line-through text-gray-500' : 'text-gray-900 font-bold'}`} style={{ fontFamily: 'Caveat, cursive', fontWeight: item.completed ? 600 : 700 }}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Completion Message */}
          {progress.percentage === 100 && (
            <div className="mt-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 text-center shadow-lg">
              <div className="text-5xl mb-3">🎊✨🎉</div>
              <h4 className="font-black text-white text-4xl mb-2" style={{ fontFamily: 'Caveat, cursive', fontWeight: 900 }}>ALL DONE!</h4>
              <p className="text-white text-xl font-bold" style={{ fontFamily: 'Caveat, cursive', fontWeight: 700 }}>You're ready for an AMAZING party!</p>
            </div>
          )}
        </div>
      </ModalContent>
    </UniversalModal>
  )
}

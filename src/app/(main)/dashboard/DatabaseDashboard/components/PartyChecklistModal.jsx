"use client"

import { useState, useEffect } from 'react'
import { UniversalModal, ModalHeader, ModalContent } from '@/components/ui/UniversalModal.jsx'
import { ChevronDown, ChevronRight } from 'lucide-react'

// Import Google Font for handwritten style
if (typeof document !== 'undefined') {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}

export default function PartyChecklistModal({ isOpen, onClose, partyId, suppliers = {} }) {
  const [checklist, setChecklist] = useState({
    preParty: {
      title: "Pre-Party Tasks",
      items: [
        { id: 'venue', label: 'Book venue', completed: false },
        { id: 'entertainment', label: 'Book entertainment', completed: false },
        { id: 'cake', label: 'Order cake', completed: false },
        { id: 'invitations', label: 'Send invitations', completed: false },
        { id: 'rsvps', label: 'Confirm RSVPs', completed: false },
        { id: 'partyBags', label: 'Buy party bags', completed: false },
        { id: 'decorations', label: 'Get decorations/balloons', completed: false },
        { id: 'menu', label: 'Plan menu (kids + adults)', completed: false },
        { id: 'playlist', label: 'Create playlist', completed: false },
        { id: 'tableware', label: 'Buy tableware/napkins', completed: false },
        { id: 'candles', label: 'Get candles & matches', completed: false },
      ]
    },
    dayBefore: {
      title: "Day Before",
      items: [
        { id: 'confirmSuppliers', label: 'Confirm all suppliers', completed: false },
        { id: 'prepBags', label: 'Prep party bags', completed: false },
        { id: 'shopping', label: 'Shop for fresh food', completed: false },
        { id: 'chargeDevices', label: 'Charge camera/phone', completed: false },
      ]
    },
    dayOf: {
      title: "Day Of Party",
      items: [
        { id: 'weather', label: 'Check weather & pack accordingly', completed: false },
        { id: 'binBags', label: 'Bring bin bags', completed: false },
        { id: 'presentBag', label: 'Bring bag for presents', completed: false },
        { id: 'decorationsSetup', label: 'Set up decorations', completed: false },
        { id: 'speaker', label: 'Test speaker/music', completed: false },
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
        {/* Simple Clean Checklist */}
        <div className="space-y-6">
          {Object.entries(checklist).map(([key, section]) => {
            const sectionCompleted = section.items.filter(i => i.completed).length
            const isExpanded = expandedSections[key]

            return (
              <div key={key} className="border-b border-gray-200 pb-4 last:border-b-0">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex flex-col items-center mb-3 hover:text-primary-600 transition-colors"
                >
                  <h3 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Indie Flower, cursive', fontWeight: 800, WebkitTextStroke: '0.3px currentColor' }}>{section.title}</h3>
                  <div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Section Items */}
                {isExpanded && (
                  <div className="space-y-2">
                    {section.items.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(key, item.id)}
                        className="w-full flex items-center gap-3 py-2 px-1 hover:bg-gray-50 transition-colors group rounded"
                      >
                        {/* Hand-drawn style checkbox */}
                        <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 transition-all ${
                          item.completed
                            ? 'bg-gray-700 border-gray-800'
                            : 'border-gray-400 group-hover:border-gray-500'
                        }`} style={{
                          borderWidth: '2px',
                          borderStyle: 'solid',
                          borderRadius: '2px',
                          transform: `rotate(${(index % 2 === 0 ? -1 : 1)}deg)`,
                        }}>
                          {item.completed && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: 'rotate(2deg)' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        {/* Item with hand-drawn line */}
                        <div className="flex-1 flex flex-col py-1">
                          <span className={`text-left text-xl pb-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-900'}`} style={{ fontFamily: 'Indie Flower, cursive', fontWeight: 500, WebkitTextStroke: '0.15px currentColor' }}>
                            {item.label}
                          </span>
                          {/* Hand-drawn line - very wobbly */}
                          <svg width="100%" height="4" viewBox="0 0 400 4" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            <path
                              d={`M 0 ${2 + Math.sin(index * 0.7) * 0.8}
                                  C ${50 + Math.cos(index * 1.3) * 3} ${2 + Math.sin(index * 1.1) * 0.9},
                                    ${100 + Math.sin(index * 1.7) * 3} ${2 + Math.cos(index * 1.9) * 0.7},
                                    ${150 + Math.cos(index * 2.1) * 2} ${2 + Math.sin(index * 2.3) * 0.8}
                                  C ${200 + Math.sin(index * 2.7) * 3} ${2 + Math.cos(index * 2.9) * 0.9},
                                    ${250 + Math.cos(index * 3.1) * 3} ${2 + Math.sin(index * 3.3) * 0.7},
                                    ${300 + Math.sin(index * 3.7) * 2} ${2 + Math.cos(index * 3.9) * 0.8}
                                  C ${350 + Math.cos(index * 4.1) * 3} ${2 + Math.sin(index * 4.3) * 0.9},
                                    ${375 + Math.sin(index * 4.7) * 2} ${2 + Math.cos(index * 4.9) * 0.7},
                                    400 ${2 + Math.sin(index * 5.1) * 0.8}`}
                              stroke="#6b7280"
                              strokeWidth="1.8"
                              fill="none"
                              strokeLinecap="round"
                              opacity="0.7"
                            />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Completion Message */}
          {progress.percentage === 100 && (
            <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h4 className="font-bold text-green-900 text-2xl mb-1" style={{ fontFamily: 'Indie Flower, cursive', fontWeight: 700, WebkitTextStroke: '0.2px currentColor' }}>All Done!</h4>
              <p className="text-green-700 text-lg" style={{ fontFamily: 'Indie Flower, cursive', fontWeight: 500, WebkitTextStroke: '0.15px currentColor' }}>You're ready for an amazing party!</p>
            </div>
          )}
        </div>
      </ModalContent>
    </UniversalModal>
  )
}

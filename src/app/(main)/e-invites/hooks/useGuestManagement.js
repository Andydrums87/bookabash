// hooks/useGuestManagement.js

import { useState, useEffect } from 'react'
import { DEFAULT_GUEST, GUEST_STATUS } from '../constants/inviteConstants'
import { 
  generateWhatsAppMessage, 
  generateEmailContent, 
  generateWhatsAppUrl, 
  generateMailtoUrl 
} from '../utils/helperFunctions'

export const useGuestManagement = (inviteData, initialGuestList = []) => {
  const [guestList, setGuestList] = useState(initialGuestList)
  const [newGuest, setNewGuest] = useState(DEFAULT_GUEST)

  // Update guest list when initialGuestList changes (when loaded from database)
  useEffect(() => {
    if (initialGuestList && initialGuestList.length > 0) {
      console.log("📋 Initializing guest list with", initialGuestList.length, "guests")
      setGuestList(initialGuestList)
    }
  }, [initialGuestList])

  const addGuest = () => {
    if (newGuest.name.trim() && newGuest.contact.trim()) {
      const guest = {
        id: Date.now(),
        name: newGuest.name.trim(),
        contact: newGuest.contact.trim(),
        type: newGuest.type,
        status: GUEST_STATUS.PENDING,
        addedAt: new Date().toISOString(),
      }

      setGuestList((prev) => [...prev, guest])
      setNewGuest(DEFAULT_GUEST)
    }
  }

  const removeGuest = (guestId) => {
    setGuestList((prev) => prev.filter((guest) => guest.id !== guestId))
  }

  const sendViaWhatsApp = (guest, shareableLink) => {
    const message = generateWhatsAppMessage(inviteData, shareableLink)
    const whatsappUrl = generateWhatsAppUrl(guest.contact, message)
    
    window.open(whatsappUrl, "_blank")

    setGuestList((prev) =>
      prev.map((g) => (g.id === guest.id ? { 
        ...g, 
        status: GUEST_STATUS.SENT, 
        sentAt: new Date().toISOString() 
      } : g)),
    )
  }

  const sendViaEmail = (guest, shareableLink) => {
    const { subject, body } = generateEmailContent(inviteData, shareableLink)
    const mailtoUrl = generateMailtoUrl(guest.contact, subject, body)
    
    window.open(mailtoUrl)

    setGuestList((prev) =>
      prev.map((g) => (g.id === guest.id ? { 
        ...g, 
        status: GUEST_STATUS.SENT, 
        sentAt: new Date().toISOString() 
      } : g)),
    )
  }

  const sendToAllPending = (shareableLink) => {
    const pendingGuests = guestList.filter((g) => g.status === GUEST_STATUS.PENDING)
    pendingGuests.forEach((guest) => {
      if (guest.type === "phone") {
        setTimeout(() => sendViaWhatsApp(guest, shareableLink), 100)
      } else {
        setTimeout(() => sendViaEmail(guest, shareableLink), 100)
      }
    })
  }

  const updateNewGuest = (field, value) => {
    setNewGuest((prev) => ({ ...prev, [field]: value }))
  }

  return {
    guestList,
    setGuestList,
    newGuest,
    setNewGuest,
    addGuest,
    removeGuest,
    sendViaWhatsApp,
    sendViaEmail,
    sendToAllPending,
    updateNewGuest,
  }
}
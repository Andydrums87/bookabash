// components/GuestManagement.js

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Send, Share2, MessageCircle, Mail, Users } from "lucide-react"
import { GUEST_STATUS } from '../constants/inviteConstants'

const GuestManagement = ({ 
  guestList,
  newGuest,
  updateNewGuest,
  addGuest,
  removeGuest,
  sendViaWhatsApp,
  sendViaEmail,
  sendToAllPending,
  copyShareableLink,
  generatedImage,
  shareableLink
}) => {
  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          Guest List & Sending
        </h2>
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Guest name"
              value={newGuest.name}
              onChange={(e) => updateNewGuest("name", e.target.value)}
              className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
            />
            <Input
              placeholder={newGuest.type === "email" ? "Email address" : "Phone number"}
              value={newGuest.contact}
              onChange={(e) => updateNewGuest("contact", e.target.value)}
              className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={newGuest.type}
              onChange={(e) => updateNewGuest("type", e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 font-medium"
            >
              <option value="email">Email</option>
              <option value="phone">WhatsApp</option>
            </select>
            <Button
              onClick={addGuest}
              className="flex-1 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Guest
            </Button>
          </div>
        </div>

        {guestList.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-gray-900">Guests ({guestList.length})</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {guestList.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="font-bold text-sm text-gray-900">{guest.name}</div>
                    <div className="text-xs text-gray-600">{guest.contact}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        guest.status === GUEST_STATUS.SENT
                          ? "bg-green-50 text-green-700 border-green-200 font-bold"
                          : guest.status === GUEST_STATUS.PENDING
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 font-bold"
                      }
                    >
                      {guest.status}
                    </Badge>
                    {guest.status === GUEST_STATUS.PENDING && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => (guest.type === "phone" ? sendViaWhatsApp(guest, shareableLink) : sendViaEmail(guest, shareableLink))}
                        className="h-8 px-3 border-2 border-primary-300 text-primary-700 hover:bg-primary-50 font-medium"
                      >
                        {guest.type === "phone" ? (
                          <MessageCircle className="w-3 h-3" />
                        ) : (
                          <Mail className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeGuest(guest.id)}
                      className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {guestList.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full border-2 border-primary-300 text-primary-700 hover:bg-primary-50 font-bold py-3 bg-transparent"
              onClick={() => sendToAllPending(shareableLink)}
              disabled={!guestList.some((g) => g.status === GUEST_STATUS.PENDING)}
            >
              <Send className="w-4 h-4 mr-2" />
              Send to All Pending
            </Button>
            <Button
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 bg-transparent"
              onClick={copyShareableLink}
              disabled={!generatedImage}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Invite Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default GuestManagement
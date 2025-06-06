"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PartyPopper } from "lucide-react"

export default function WelcomeDashboardPopup({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <PartyPopper className="h-7 w-7 mr-2 text-primary-500" />
            Your Party Plan is Ready!
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-sm text-gray-700 space-y-3 dark:text-gray-300">
          <p>Welcome to your BookABash dashboard! We've whipped up an initial party plan based on your choices.</p>
          <p>Feel free to explore and make it your own:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>
              Adjust your <strong>budget</strong> using the slider.
            </li>
            <li>
              Change <strong>suppliers</strong> for any category.
            </li>
            <li>
              Customize your <strong>e-invites</strong>.
            </li>
            <li>
              Add or remove <strong>party add-ons</strong>.
            </li>
          </ul>
          <p>This is your command center for creating an unforgettable party. Happy planning!</p>
        </div>
        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button type="button" className="w-full bg-primary-500 hover:bg-primary-600 text-white">
              Got it, Let's Plan!
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

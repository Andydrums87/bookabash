"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FileText } from "lucide-react"

export function BasicTermsModal({ children }) {
  const [open, setOpen] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const TERMS_VERSION = "2025-01"

  const handleAgree = async () => {
    if (!agreed) return
    // TODO: Save acceptance to DB
    console.log("Basic Terms accepted", TERMS_VERSION)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col bg-white">
        <DialogHeader className="flex-shrink-0 p-4 pb-3 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <FileText className="w-4 h-4 text-gray-600" />
            Basic Platform Terms
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            These terms cover account setup and platform use. Full Supplier Terms apply when you go live.
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 overflow-y-auto">
          <div className="py-4 space-y-4 text-sm text-gray-700">
            <p>
              By creating an account, you agree to use PartySnap for legitimate business purposes, provide accurate
              information, and comply with our{" "}
              <a href="/terms/basic" target="_blank" className="underline">
                Basic Terms
              </a>
              ,{" "}
              <a href="/terms/supplier" target="_blank" className="underline">
                Supplier Terms
              </a>{" "}
              (when you go live), and our{" "}
              <a href="/privacy" target="_blank" className="underline">
                Privacy Policy
              </a>
              .
            </p>

            <ul className="list-disc ml-5 space-y-1">
              <li>You must be 18+ and provide accurate registration info</li>
              <li>One account per person or business; keep credentials secure</li>
              <li>No fraudulent, misleading, or abusive activity</li>
              <li>Respect other users and maintain professionalism</li>
              <li>You’re responsible for all activity on your account</li>
            </ul>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-gray-200 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <Checkbox id="agree-basic" checked={agreed} onCheckedChange={setAgreed} className="mt-1" />
            <Label htmlFor="agree-basic" className="text-sm text-gray-900">
              I have read and agree to PartySnap’s Basic Terms (v{TERMS_VERSION}), Supplier Terms (when I go live), and
              Privacy Policy
            </Label>
          </div>
          <Button
            disabled={!agreed}
            onClick={handleAgree}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white"
          >
            Agree & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

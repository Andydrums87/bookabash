"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Send } from "lucide-react"

export default function FloatingInviteButton({ daysUntilParty = 30, showAfterScroll = true }) {
  const [isVisible, setIsVisible] = useState(!showAfterScroll);
  const [animation, setAnimation] = useState("");

  useEffect(() => {
    if (!showAfterScroll) {
      setIsVisible(true);
      setAnimation("animate-in fade-in slide-in-from-bottom-5 duration-500");
      return;
    }
    const handleScroll = () => {
      if (window.scrollY > 300 && !isVisible) {
        setIsVisible(true);
        setAnimation("animate-in fade-in slide-in-from-bottom-5 duration-500");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAfterScroll, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-28 right-6 z-50 md:bottom-6">
    {" "}
    {/* Adjusted bottom for mobile to avoid overlap with budget bar */}
    <Button className="rounded-full shadow-lg pl-3 pr-4 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
      <Send className="w-5 h-5 mr-2" />
      Send Invites ({daysUntilParty} days left)
    </Button>
  </div>
  );
}

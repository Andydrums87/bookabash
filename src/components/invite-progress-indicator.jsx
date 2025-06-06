"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function InviteProgressIndicator({
  partyDate = "March 15, 2025",
  invitesSent = 0,
  totalGuests = 15,
  className = "",
}) {
  const daysUntilParty = () => {
    const today = new Date();
    const partyDateObj = new Date(partyDate);
    const diffTime = Math.abs(partyDateObj.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyLevel = () => {
    const days = daysUntilParty();
    if (days <= 7) return "critical";
    if (days <= 14) return "urgent";
    if (days <= 21) return "important";
    return "normal";
  };

  const urgency = getUrgencyLevel();
  const percentSent = Math.round((invitesSent / totalGuests) * 100) || 0;

  return (
    <div
      className={`bg-white rounded-lg border ${urgency === "critical" ? "border-red-200 animate-pulse" : urgency === "urgent" ? "border-orange-200" : "border-gray-200"} p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mail
            className={`w-5 h-5 ${urgency === "critical" ? "text-red-500" : urgency === "urgent" ? "text-orange-500" : "text-primary-500"}`}
          />
          <h3 className="font-medium text-gray-900">Party Invitations</h3>
        </div>
        {invitesSent > 0 ? (
          <div className="flex items-center gap-1 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-700">{invitesSent} sent</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-sm">
            <AlertCircle
              className={`w-4 h-4 ${urgency === "critical" ? "text-red-500" : urgency === "urgent" ? "text-orange-500" : "text-blue-500"}`}
            />
            <span
              className={
                urgency === "critical" ? "text-red-700" : urgency === "urgent" ? "text-orange-700" : "text-blue-700"
              }
            >
              Not started
            </span>
          </div>
        )}
      </div>
      {invitesSent > 0 && (
        <div className="mb-3">
          <Progress value={percentSent} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{percentSent}% sent</span>
            <span>{totalGuests - invitesSent} remaining</span>
          </div>
        </div>
      )}
      <div
        className={`text-sm ${urgency === "critical" ? "text-red-700" : urgency === "urgent" ? "text-orange-700" : "text-gray-600"} mb-3`}
      >
        {urgency === "critical" ? (
          <strong>Urgent: Send invites now! Your party is in {daysUntilParty()} days.</strong>
        ) : urgency === "urgent" ? (
          <strong>Important: Send invites soon. Your party is in {daysUntilParty()} days.</strong>
        ) : (
          <span>Your party is in {daysUntilParty()} days. Time to plan your invitations!</span>
        )}
      </div>
      <Button
        className={`w-full ${urgency === "critical" ? "bg-red-500 hover:bg-red-600" : urgency === "urgent" ? "bg-orange-500 hover:bg-orange-600" : "bg-primary-500 hover:bg-primary-600"} text-white`}
        asChild
      >
        <Link href="/e-invites">
          {invitesSent === 0
            ? "Create & Send Invites"
            : invitesSent < totalGuests
              ? "Continue Sending Invites"
              : "Manage Invitations"}
        </Link>
      </Button>
    </div>
  );
}

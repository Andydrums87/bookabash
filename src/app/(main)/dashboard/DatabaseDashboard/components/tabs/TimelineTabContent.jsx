"use client"

import CountdownWidget from '../../../components/ui/CountdownWidget'
import PartyTimeline from '../PartyTimeline'

export default function TimelineTabContent({
  partyDetails,
  visibleSuppliers,
}) {
  return (
    <div className="space-y-6 py-6 px-4">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          Party Timeline
          <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
        </h2>
        <p className="text-sm text-gray-600 mt-3">Countdown and schedule for the big day</p>
      </div>

      {/* Two Column Layout - Countdown & Timeline side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Left Column - Countdown */}
        <div className="h-full [&>*]:h-full">
          <CountdownWidget partyDate={partyDetails?.date} />
        </div>

        {/* Right Column - Day Schedule */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 h-full flex flex-col">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Day Schedule</h3>
          <div className="flex-1 overflow-auto">
            <PartyTimeline
              partyDetails={partyDetails}
              suppliers={visibleSuppliers}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react';
import { Home, BarChart3, FileText, Clock, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MobileBottomTabBar = ({ 
  suppliers = {},
  enquiries = [],
  totalCost = 0,
  timeRemaining = 24,
  partyDetails = {},
  onPaymentReady,
  isPaymentConfirmed = false,
  // Add these props that you're passing from the parent
  ProgressWidget,
  CountdownWidget
}) => {
  const [activeTab, setActiveTab] = useState('party');
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Calculate progress - fix the supplier counting logic
  const confirmedSuppliers = Object.entries(suppliers || {})
    .filter(([key, supplier]) => supplier !== null && key !== "einvites")
    .length;
  
  const totalSlots = 7; // Adjust based on your actual supplier slots
  const progressPercentage = Math.round((confirmedSuppliers / totalSlots) * 100);

  const tabs = [
    { id: 'party', label: 'Party', icon: Home },
    { id: 'progress', label: 'Progress', icon: BarChart3, badge: `${confirmedSuppliers}/${totalSlots}` },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'timer', label: 'Timer', icon: Clock, urgent: timeRemaining < 6 }
  ];

  const handleTabPress = (tabId) => {
    if (tabId === 'party') {
      setActiveTab(tabId);
      setShowModal(false);
    } else if (tabId === 'summary') {
      // Navigate directly to party summary page
      router.push('/party-summary');
    } else {
      setActiveTab(tabId);
      setShowModal(true);
    }
  };

  const getModalContent = () => {
    switch (activeTab) {
      case 'progress':
        return (
          <div className="space-y-6">
            {ProgressWidget ? (
              // Use the passed ProgressWidget component
              <div>
                {ProgressWidget}
              </div>
            ) : (
              // Fallback progress display
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Party Progress</h3>
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-coral-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${progressPercentage}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">{progressPercentage}%</span>
                  </div>
                </div>
                <p className="text-gray-600">{confirmedSuppliers} of {totalSlots} suppliers confirmed</p>
              </div>
            )}

      
          </div>
        );

      case 'timer':
        return (
          <div className="space-y-6">
            {CountdownWidget ? (
              // Use the passed CountdownWidget component
              <div>
             
                {CountdownWidget}
              </div>
            ) : (
              // Fallback timer display
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Party Countdown</h3>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold mb-2">
                    <span className="text-blue-600">
                      {Math.floor(timeRemaining)}h {Math.round((timeRemaining - Math.floor(timeRemaining)) * 60)}m
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Time remaining to secure your party
                  </p>
                </div>
              </div>
            )}

        
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Bottom Tab Bar - Fixed at bottom on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-10">
        <div className="grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-coral-100 text-coral-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 mb-1" />
                  {tab.badge && (
                    <span className="absolute -top-2 -right-2 bg-coral-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {tab.badge.split('/')[0]}
                    </span>
                  )}
                  {tab.urgent && timeRemaining < 2 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal for tab content */}
      {showModal && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeTab}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 pb-24">
              {getModalContent()}
            </div>
          </div>
        </div>
      )}

      {/* Add bottom padding to main content to account for tab bar */}
      <style jsx global>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 80px;
          }
        }
      `}</style>
    </>
  );
};

export default MobileBottomTabBar;
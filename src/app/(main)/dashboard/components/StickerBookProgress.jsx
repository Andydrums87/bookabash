import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Plus, ArrowRight, Sparkles } from 'lucide-react';

export default function StickerBookProgress({ 
  suppliers = {},
  enquiries = [],
  timeRemaining = 24,
  onPaymentReady,
  showPaymentCTA = false,
  onSupplierAdd
}) {
  const [animatingSticker, setAnimatingSticker] = useState(null);
  const [snappyMood, setSnappyMood] = useState('waiting');

  console.log(suppliers)

  // Convert your suppliers object to sticker format
  const stickerSuppliers = {
    entertainment: {
      name: suppliers.entertainment?.name || "",
      status: getSupplierStatus('entertainment'),
      stickerIcon: "🎭",
      stickerColor: "from-purple-400 to-pink-500",
      position: { top: "15%", left: "15%" }
    },
    venue: {
      name: suppliers.venue?.name || "",
      status: getSupplierStatus('venue'),
      stickerIcon: "🏰",
      stickerColor: "from-green-400 to-blue-500",
      position: { top: "15%", left: "55%" }
    },
    catering: {
      name: suppliers.catering?.name || "",
      status: getSupplierStatus('catering'),
      stickerIcon: "🍰",
      stickerColor: "from-yellow-400 to-orange-500",
      position: { top: "45%", left: "15%" }
    },
    activities: {
      name: suppliers.activities?.name || "",
      status: getSupplierStatus('activities'),
      stickerIcon: "🎮",
      stickerColor: "from-red-400 to-pink-500",
      position: { top: "45%", left: "55%" }
    },
    facePainting: {
      name: suppliers.facePainting?.name || "",
      status: getSupplierStatus('facePainting'),
      stickerIcon: "🎨",
      stickerColor: "from-indigo-400 to-purple-500",
      position: { top: "70%", left: "35%" }
    }
  };

  // Get supplier status from enquiries
  function getSupplierStatus(type) {
    if (!suppliers[type]) return 'empty';
    
    const enquiry = enquiries.find(e => e.supplier_category === type);
    if (!enquiry) return 'selected'; // Selected but no enquiry sent yet
    
    switch (enquiry.status) {
      case 'accepted': return 'confirmed';
      case 'pending': return 'pending';
      case 'declined': return 'declined';
      default: return 'pending';
    }
  }

  // Calculate progress
  const trackableSuppliers = Object.entries(stickerSuppliers).filter(([key, supplier]) => 
    suppliers[key] && key !== 'einvites'
  );
  const totalSuppliers = trackableSuppliers.length;
  const confirmedCount = trackableSuppliers.filter(([key]) => 
    getSupplierStatus(key) === 'confirmed'
  ).length;
  const pendingCount = trackableSuppliers.filter(([key]) => 
    getSupplierStatus(key) === 'pending'
  ).length;
  const allConfirmed = confirmedCount === totalSuppliers && totalSuppliers > 0;

  // Update Snappy's mood
  useEffect(() => {
    if (allConfirmed) {
      setSnappyMood('celebrating');
    } else if (confirmedCount > 0) {
      setSnappyMood('excited');
    } else {
      setSnappyMood('waiting');
    }
  }, [confirmedCount, allConfirmed]);

  // Auto-animate when supplier confirms
  useEffect(() => {
    const newlyConfirmed = trackableSuppliers.find(([key]) => 
      getSupplierStatus(key) === 'confirmed' && animatingSticker !== key
    );
    
    if (newlyConfirmed && !animatingSticker) {
      setAnimatingSticker(newlyConfirmed[0]);
      setTimeout(() => setAnimatingSticker(null), 2000);
    }
  }, [confirmedCount]);

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <Card className="border border-[hsl(var(--primary-900))] shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Sticker Book Header */}
        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-6 border-b border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Snappy with mood */}
              <div className="w-16 h-16 bg-white rounded-full border-4 border-orange-300 flex items-center justify-center shadow-lg">
                <img
                  src={
                    snappyMood === "celebrating"
                      ? "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753256660/dwb6vr6lxyj7ubokfeel.png"
                      : snappyMood === "excited"
                        ? "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753291833/ctcf51iyrrhfv6y481dl.jpg"
                        : "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753291661/qjdvo5qnbylnzwhlawhf.png"
                  }
                  alt="Snappy"
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
                <span className="text-2xl" style={{ display: "none" }}>🐊</span>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-orange-800">
                  {allConfirmed ? "🎉 Sticker Collection Complete!" : "📚 Party Sticker Book"}
                </h3>
                <p className="text-orange-700">
                  {allConfirmed 
                    ? "All suppliers confirmed - ready to party!" 
                    : `Collect stickers as suppliers confirm • ${confirmedCount}/${totalSuppliers} collected`
                  }
                </p>
              </div>
            </div>
            
            {!allConfirmed && timeRemaining > 0 && (
              <div className="text-right">
                <div className="flex items-center space-x-1 text-sm text-orange-700">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeRemaining)} remaining</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticker Book Pages */}
        <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 min-h-[500px]">
          {/* Spiral binding */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-orange-400 to-orange-500">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-4 h-4 bg-orange-600 rounded-full border-2 border-orange-300"
                style={{ 
                  left: '24px', 
                  top: `${60 + i * 70}px`,
                  transform: 'translateX(-50%)'
                }}
              />
            ))}
          </div>

          {/* Sticker collection area */}
          <div className="relative ml-16 p-8 min-h-[500px]">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-gray-400"></div>
                ))}
              </div>
            </div>

            {/* Stickers */}
            {Object.entries(stickerSuppliers).map(([type, supplier]) => (
              <div
                key={type}
                className="absolute transition-all duration-700"
                style={{
                  top: supplier.position.top,
                  left: supplier.position.left,
                  transform: animatingSticker === type ? 'scale(1.1) rotate(5deg)' : 'scale(1)'
                }}
              >
                {supplier.status === 'confirmed' && (
                  <div className="relative group">
                    {/* Confirmed sticker */}
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${supplier.stickerColor} shadow-xl border-4 border-white flex items-center justify-center transform transition-all hover:scale-110 hover:rotate-6`}>
            
                    <img src={suppliers?.entertainment?.image} alt="" />
                    </div>
                    
                    {/* Success sparkle */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <CheckCircle className="w-4 h-4 text-white fill-current" />
                    </div>
                    
                    {/* Celebration effects */}
                    {animatingSticker === type && (
                      <>
                        <div className="absolute -top-4 -left-4 text-yellow-400 animate-ping text-2xl">✨</div>
                        <div className="absolute -bottom-4 -right-4 text-yellow-400 animate-ping delay-300 text-2xl">⭐</div>
                      </>
                    )}
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="bg-green-600 text-white text-xs rounded py-1 px-2 whitespace-nowrap font-medium">
                        ✅ {supplier.name} Confirmed!
                      </div>
                    </div>
                  </div>
                )}

                {supplier.status === 'pending' && (
                  <div className="relative group">
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${supplier.stickerColor} opacity-50 shadow-lg border-4 border-dashed border-yellow-400 flex items-center justify-center animate-pulse`}>
                      <span className="text-4xl grayscale">{supplier.stickerIcon}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-yellow-600 animate-spin" />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="bg-yellow-500 text-white text-xs rounded py-1 px-2 whitespace-nowrap font-medium">
                        ⏳ Waiting for {supplier.name || type}
                      </div>
                    </div>
                  </div>
                )}

                {supplier.status === 'empty' && (
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => onSupplierAdd?.(type)}
                  >
                    <div className="w-24 h-24 rounded-2xl border-4 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center opacity-60 hover:opacity-80 transition-opacity">
                      <span className="text-4xl opacity-30">{supplier.stickerIcon}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="bg-blue-500 text-white text-xs rounded py-1 px-2 whitespace-nowrap font-medium">
                        ➕ Add {type}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Progress celebration */}
            {allConfirmed && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="bg-gradient-to-r from-green-500/90 to-blue-500/90 text-white px-6 py-4 rounded-2xl shadow-2xl animate-pulse">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎊✨🎉</div>
                    <div className="font-bold">Collection Complete!</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress footer */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{confirmedCount}</div>
                <div className="text-xs text-gray-600">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">{pendingCount}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-600">{Object.keys(stickerSuppliers).length - confirmedCount - pendingCount}</div>
                <div className="text-xs text-gray-600">Available</div>
              </div>
            </div>
            
            <Badge className={`${allConfirmed ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
              {confirmedCount}/{totalSuppliers} Stickers
            </Badge>
          </div>

          {/* Payment CTA */}
          {allConfirmed && showPaymentCTA && (
            <Button 
              onClick={onPaymentReady}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
            >
              🎉 Pay £180 to Secure Your Party!
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}

          {!allConfirmed && (
            <div className="text-center text-sm text-gray-500">
              Stickers will appear automatically as suppliers confirm ✨
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
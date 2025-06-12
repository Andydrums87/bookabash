"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Share2, Send, MessageCircle, Users, Mail, Link, Check } from "lucide-react"

const EInvitesPage= ({ onSaveSuccess }) => {
  const canvasRef = useRef(null);
  const [selectedTheme, setSelectedTheme] = useState('princess');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [guestList, setGuestList] = useState([]);
  const [newGuest, setNewGuest] = useState({ name: '', contact: '', type: 'email' });
  const [shareableLink, setShareableLink] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [inviteData, setInviteData] = useState({
    childName: "Emma",
    age: "6",
    date: "March 15, 2025",
    time: "2:00 PM - 5:00 PM",
    venue: "Community Center Hall",
    message: "Join us for an amazing adventure!"
  });

  const themes = {
    princess: {
      name: "Princess Theme",
      colors: {
        primary: '#FF69B4',
        secondary: '#FFB6C1',
        accent: '#FFD700',
        text: '#8B008B'
      },
      emoji: '👑',
      background: 'linear-gradient(45deg, #FF69B4, #FFB6C1, #FFD700)',
      decorations: ['✨', '💎', '🌟', '🦄']
    },
    spiderman: {
      name: "Spider-Man Theme",
      colors: {
        primary: '#DC143C',
        secondary: '#0047AB',
        accent: '#FFFFFF',
        text: '#000000'
      },
      emoji: '🕷️',
      background: 'linear-gradient(45deg, #DC143C, #0047AB)',
      decorations: ['💥', '🕸️', '⚡', '🦸‍♂️']
    },
    dinosaur: {
      name: "Dinosaur Theme",
      colors: {
        primary: '#228B22',
        secondary: '#FFA500',
        accent: '#8B4513',
        text: '#006400'
      },
      emoji: '🦕',
      background: 'linear-gradient(45deg, #228B22, #FFA500, #8B4513)',
      decorations: ['🌋', '🥚', '🦴', '🌿']
    },
    safari: {
      name: "Jungle Safari Theme",
      colors: {
        primary: '#8B4513',
        secondary: '#228B22',
        accent: '#FFD700',
        text: '#2F4F2F'
      },
      emoji: '🦁',
      background: 'linear-gradient(45deg, #8B4513, #228B22, #FFD700)',
      decorations: ['🐘', '🦒', '🌴', '🦎']
    }
  };

  const generateInvite = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const theme = themes[selectedTheme];
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 800;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (selectedTheme === 'princess') {
      gradient.addColorStop(0, '#FF69B4');
      gradient.addColorStop(0.5, '#FFB6C1');
      gradient.addColorStop(1, '#FFD700');
    } else if (selectedTheme === 'spiderman') {
      gradient.addColorStop(0, '#DC143C');
      gradient.addColorStop(1, '#0047AB');
    } else if (selectedTheme === 'dinosaur') {
      gradient.addColorStop(0, '#228B22');
      gradient.addColorStop(0.5, '#FFA500');
      gradient.addColorStop(1, '#8B4513');
    } else if (selectedTheme === 'safari') {
      gradient.addColorStop(0, '#8B4513');
      gradient.addColorStop(0.5, '#228B22');
      gradient.addColorStop(1, '#FFD700');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add decorative border
    ctx.strokeStyle = theme.colors.accent;
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    // Add inner border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    
    // Add theme emoji at top
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(theme.emoji, canvas.width / 2, 120);
    
    // Add decorative elements
    ctx.font = '40px Arial';
    const decorations = theme.decorations;
    decorations.forEach((emoji, index) => {
      const x = 80 + (index * 120);
      const y = 180;
      ctx.fillText(emoji, x, y);
    });
    
    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = theme.colors.text;
    ctx.lineWidth = 2;
    ctx.strokeText("You're Invited!", canvas.width / 2, 250);
    ctx.fillText("You're Invited!", canvas.width / 2, 250);
    
    // Child's name and age
    ctx.fillStyle = theme.colors.accent;
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`${inviteData.childName}'s ${inviteData.age}th Birthday`, canvas.width / 2, 320);
    
    // Theme-specific subtitle
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    let subtitle = '';
    if (selectedTheme === 'princess') subtitle = '👑 Royal Princess Party 👑';
    else if (selectedTheme === 'spiderman') subtitle = '🕷️ Superhero Adventure 🕷️';
    else if (selectedTheme === 'dinosaur') subtitle = '🦕 Dino-mite Adventure 🦕';
    else if (selectedTheme === 'safari') subtitle = '🦁 Wild Safari Adventure 🦁';
    
    ctx.fillText(subtitle, canvas.width / 2, 360);
    
    // Event details box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(50, 400, canvas.width - 100, 280);
    
    // Event details border
    ctx.strokeStyle = theme.colors.primary;
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 400, canvas.width - 100, 280);
    
    // Event details text
    ctx.fillStyle = theme.colors.text;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    
    const details = [
      `📅 Date: ${inviteData.date}`,
      `🕐 Time: ${inviteData.time}`,
      `📍 Venue: ${inviteData.venue}`,
      '',
      `💌 ${inviteData.message}`
    ];
    
    details.forEach((detail, index) => {
      if (detail === '') return;
      const y = 440 + (index * 35);
      if (index === 4) { // Message
        ctx.font = '18px Arial';
        const words = detail.split(' ');
        let line = '';
        let lineY = y;
        
        words.forEach((word, wordIndex) => {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > 480 && line !== '') {
            ctx.fillText(line, 70, lineY);
            line = word + ' ';
            lineY += 25;
          } else {
            line = testLine;
          }
        });
        ctx.fillText(line, 70, lineY);
      } else {
        ctx.fillText(detail, 70, y);
      }
    });
    
    // RSVP text
    ctx.fillStyle = theme.colors.primary;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RSVP: Click the link in your invitation!', canvas.width / 2, 730);
    
    // Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px Arial';
    ctx.fillText('Created with ❤️ by BookABash', canvas.width / 2, 770);
    
    // Convert to image
    const imageDataUrl = canvas.toDataURL('image/png');
    setGeneratedImage(imageDataUrl);
  };
  
  useEffect(() => {
    generateInvite();
  }, [selectedTheme, inviteData]);

  // Load existing invite data on component mount
  useEffect(() => {
    const loadExistingData = () => {
      try {
        // Check if there's existing invite data
        const savedInvite = localStorage.getItem('party_einvites');
        const partyPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}');
        
        if (savedInvite) {
          const data = JSON.parse(savedInvite);
          setSelectedTheme(data.theme || 'princess');
          setInviteData(data.inviteData || inviteData);
          setGuestList(data.guestList || []);
          setShareableLink(data.shareableLink || '');
          if (data.generatedImage) {
            setGeneratedImage(data.generatedImage);
            setIsSaved(true);
          }
        }
        
        // Also check party plan for existing invite data
        if (partyPlan.einvites && partyPlan.einvites.image) {
          setGeneratedImage(partyPlan.einvites.image);
          setIsSaved(true);
          if (partyPlan.einvites.theme) {
            setSelectedTheme(partyPlan.einvites.theme);
          }
          if (partyPlan.einvites.inviteData) {
            setInviteData(partyPlan.einvites.inviteData);
          }
          if (partyPlan.einvites.guestList) {
            setGuestList(partyPlan.einvites.guestList);
          }
        }
      } catch (error) {
        console.error('Error loading existing invite data:', error);
      }
    };
    
    loadExistingData();
  }, []);
  
  // Save invite to your party plan backend system
  const saveInviteToPartyPlan = async () => {
    if (!generatedImage) {
      console.error('No invite image generated yet');
      return false;
    }

    try {
      // Get current party plan using your backend storage key
      const currentPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}');
      
      // Ensure the plan has the default structure
      if (!currentPlan.einvites) {
        currentPlan.einvites = {
          id: "digital-invites",
          name: "Digital Superhero Invites",
          description: "Themed e-invitations with RSVP tracking",
          price: 25,
          status: "confirmed",
          image: "/placeholder.jpg",
          category: "Digital Services",
          priceUnit: "per set",
          addedAt: new Date().toISOString()
        };
      }
      
      // Update the e-invites with generated data
      currentPlan.einvites = {
        ...currentPlan.einvites,
        id: "digital-invites",
        name: `${inviteData.childName}'s ${themes[selectedTheme].name} Invites`,
        description: `Custom ${selectedTheme} themed digital invitations`,
        price: 25,
        status: "created", // Changed from confirmed to created
        image: generatedImage, // 👈 KEY: This shows on your dashboard
        category: "Digital Services",
        priceUnit: "per set",
        // Store additional invite data
        theme: selectedTheme,
        inviteData: inviteData,
        guestList: guestList,
        shareableLink: shareableLink,
        addedAt: currentPlan.einvites.addedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save back to your party plan backend
      localStorage.setItem('user_party_plan', JSON.stringify(currentPlan));
      
      // Also save detailed invite data for this component
      const inviteDetails = {
        theme: selectedTheme,
        inviteData,
        guestList,
        generatedImage,
        shareableLink,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('party_einvites', JSON.stringify(inviteDetails));
      
      setIsSaved(true);
      
      // Emit event for real-time updates (triggers your usePartyPlan hook)
      const event = new CustomEvent('partyPlanUpdated', { 
        detail: currentPlan 
      });
      window.dispatchEvent(event);
      
      // Also trigger storage event for compatibility
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user_party_plan',
        newValue: JSON.stringify(currentPlan),
        oldValue: null
      }));
      
      console.log('✅ Invite saved to party plan - should now appear on dashboard!');
      
      // Call success callback
      if (onSaveSuccess) {
        onSaveSuccess(currentPlan.einvites);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error saving invite to party plan:', error);
      return false;
    }
  };

  // Generate shareable link
  const generateShareableLink = () => {
    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const link = `${window.location.origin}/party-invite/${inviteId}`;
    setShareableLink(link);
    
    // Save the invite with this ID for public viewing
    const publicInvite = {
      id: inviteId,
      theme: selectedTheme,
      inviteData,
      generatedImage,
      createdAt: new Date().toISOString()
    };
    
    // Store public invite (in real app, this would go to your backend)
    localStorage.setItem(`public_invite_${inviteId}`, JSON.stringify(publicInvite));
    
    return link;
  };

  // Add guest to list
  const addGuest = () => {
    if (newGuest.name.trim() && newGuest.contact.trim()) {
      const guest = {
        id: Date.now(),
        name: newGuest.name.trim(),
        contact: newGuest.contact.trim(),
        type: newGuest.type,
        status: 'pending',
        addedAt: new Date().toISOString()
      };
      
      setGuestList(prev => [...prev, guest]);
      setNewGuest({ name: '', contact: '', type: 'email' });
    }
  };

  // Remove guest from list
  const removeGuest = (guestId) => {
    setGuestList(prev => prev.filter(guest => guest.id !== guestId));
  };

  // Send invites via WhatsApp
  const sendViaWhatsApp = (guest) => {
    const message = `🎉 You're invited to ${inviteData.childName}'s ${themes[selectedTheme].name} Birthday Party!\n\n📅 ${inviteData.date}\n🕐 ${inviteData.time}\n📍 ${inviteData.venue}\n\n${inviteData.message}\n\nView your invitation: ${shareableLink || generateShareableLink()}\n\nRSVP by replying to this message!`;
    
    const whatsappUrl = `https://wa.me/${guest.contact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Update guest status
    setGuestList(prev => prev.map(g => 
      g.id === guest.id ? { ...g, status: 'sent', sentAt: new Date().toISOString() } : g
    ));
  };

  // Send invites via email (would integrate with your email service)
  const sendViaEmail = (guest) => {
    const subject = `You're invited to ${inviteData.childName}'s Birthday Party!`;
    const body = `View your invitation: ${shareableLink || generateShareableLink()}`;
    
    const mailtoUrl = `mailto:${guest.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    
    // Update guest status
    setGuestList(prev => prev.map(g => 
      g.id === guest.id ? { ...g, status: 'sent', sentAt: new Date().toISOString() } : g
    ));
  };

  // Copy shareable link
  const copyShareableLink = async () => {
    const link = shareableLink || generateShareableLink();
    try {
      await navigator.clipboard.writeText(link);
      alert('Invite link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Invite link copied to clipboard!');
    }
  };

  const handleInputChange = (field, value) => {
    setInviteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Themed E-Invite</h1>
          <p className="text-gray-600">Design beautiful birthday invitations in seconds!</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Theme Selection & Customization */}
          <div className="lg:col-span-2 space-y-6">
            {/* Theme Selection */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Choose Your Theme</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(themes).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTheme(key)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        selectedTheme === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{theme.emoji}</div>
                      <div className="font-medium text-sm">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Party Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Party Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Child's Name</label>
                    <Input
                      value={inviteData.childName}
                      onChange={(e) => handleInputChange('childName', e.target.value)}
                      placeholder="Enter child's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Age</label>
                    <Input
                      value={inviteData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input
                      value={inviteData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      placeholder="Party date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <Input
                      value={inviteData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      placeholder="Party time"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Venue</label>
                    <Input
                      value={inviteData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                      placeholder="Party venue"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Special Message</label>
                    <Textarea
                      value={inviteData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Add a special message for your guests"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Guest Management */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Guest List & Sending</h2>
                
                {/* Add Guest */}
                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Guest name"
                      value={newGuest.name}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder={newGuest.type === 'email' ? 'Email address' : 'Phone number'}
                      value={newGuest.contact}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, contact: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select 
                      value={newGuest.type}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, type: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="email">Email</option>
                      <option value="phone">WhatsApp</option>
                    </select>
                    <Button onClick={addGuest} className="flex-1">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Guest
                    </Button>
                  </div>
                </div>

                {/* Guest List */}
                {guestList.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h3 className="font-medium text-gray-900">Guests ({guestList.length})</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {guestList.map((guest) => (
                        <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{guest.name}</div>
                            <div className="text-xs text-gray-600">{guest.contact}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={
                                guest.status === 'sent' ? 'bg-green-50 text-green-700 border-green-200' :
                                guest.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-gray-50 text-gray-700 border-gray-200'
                              }
                            >
                              {guest.status}
                            </Badge>
                            {guest.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => guest.type === 'phone' ? sendViaWhatsApp(guest) : sendViaEmail(guest)}
                                className="h-8 px-2"
                              >
                                {guest.type === 'phone' ? (
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
                              className="h-8 px-2 text-red-600 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bulk Actions */}
                {guestList.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const pendingGuests = guestList.filter(g => g.status === 'pending');
                        pendingGuests.forEach(guest => {
                          if (guest.type === 'phone') {
                            setTimeout(() => sendViaWhatsApp(guest), 100);
                          } else {
                            setTimeout(() => sendViaEmail(guest), 100);
                          }
                        });
                      }}
                      disabled={!guestList.some(g => g.status === 'pending')}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to All Pending
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
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
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="space-y-6">
            {/* Live Preview */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  {generatedImage ? (
                    <img 
                      src={generatedImage} 
                      alt="Generated Invite" 
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Generating preview...</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      saveInviteToPartyPlan();
                      if (!shareableLink) generateShareableLink();
                    }}
                    className={`w-full ${isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={!generatedImage}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Saved to Dashboard
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Save Invite
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={copyShareableLink}
                    disabled={!generatedImage}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Copy Invite Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Theme Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Current Theme: {themes[selectedTheme].name}</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">{themes[selectedTheme].emoji}</span>
                  <span className="text-sm text-gray-600">Perfect for a magical celebration!</span>
                </div>
                <div className="text-xs text-gray-500">
                  Your invite will be automatically saved and can be used on your dashboard.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden canvas for generation */}
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }}
          width={600} 
          height={800}
        />
      </div>
    </div>
  );
};

export default EInvitesPage ;
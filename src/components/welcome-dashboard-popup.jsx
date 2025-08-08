"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Cake, DollarSign, Mail, Sparkles, Heart, Plus, ArrowRight, Star } from "lucide-react"
import Image from "next/image"
import confetti from "canvas-confetti"

// Choose your favorite variation - just uncomment the one you want to use:

// VARIATION 1: Party Timeline
function WelcomeVariation1({ firstName, isAlaCarteUser }) {
  const steps = isAlaCarteUser ? [
    { icon: Plus, title: "Add More Suppliers", desc: "Build your perfect team", color: "bg-primary-500" },
    { icon: DollarSign, title: "Set Budget", desc: "Keep costs on track", color: "bg-primary-600" },
    { icon: Mail, title: "Send Enquiries", desc: "Book when ready!", color: "bg-primary-700" }
  ] : [
    { icon: DollarSign, title: "Adjust Budget", desc: "Swap & customize", color: "bg-primary-500" },
    { icon: Heart, title: "Customize Invites", desc: "Make them special", color: "bg-primary-600" },
    { icon: Sparkles, title: "Add Magic", desc: "Extras & surprises", color: "bg-primary-700" }
  ]

  return (
    <>
      <div className="relative">
        <div className="bg-primary-100 rounded-full p-4 inline-block mb-6">
          <Image
            src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752853551/1_1_lxuiqa.png"
            alt="Snappy celebrating"
            width={80}
            height={80}
            className="w-20 h-20"
          />
        </div>
        <div className="absolute -top-2 -right-2 text-2xl">🎉</div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-primary-600 mb-2">
          {firstName}'s Party Journey Begins! 🚀
        </h3>
        <p className="text-gray-600">Here's your party planning roadmap:</p>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 mr-4 text-sm font-bold">
              {index + 1}
            </div>
            <div className={`p-2 rounded-lg ${step.color} mr-3`}>
              <step.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-800">{step.title}</div>
              <div className="text-sm text-gray-600">{step.desc}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
        ))}
      </div>
    </>
  )
}

// VARIATION 2: Celebration Cards
function WelcomeVariation2({ firstName, isAlaCarteUser }) {
  const cards = isAlaCarteUser ? [
    { 
      icon: "🛍️", 
      title: "Keep Shopping", 
      desc: "Add more amazing suppliers to make this party perfect!",
      accent: "border-primary-200 bg-primary-50"
    },
    { 
      icon: "💰", 
      title: "Budget Buddy", 
      desc: "Set your budget to see what fits perfectly",
      accent: "border-blue-200 bg-blue-50"
    },
    { 
      icon: "📧", 
      title: "Ready to Book", 
      desc: "Send enquiries when you're happy with your choices",
      accent: "border-green-200 bg-green-50"
    }
  ] : [
    { 
      icon: "🎨", 
      title: "Make It Yours", 
      desc: "Swap suppliers and adjust your perfect party budget",
      accent: "border-primary-200 bg-primary-50"
    },
    { 
      icon: "💌", 
      title: "Invite Magic", 
      desc: "Create beautiful invitations that match your theme",
      accent: "border-pink-200 bg-pink-50"
    },
    { 
      icon: "✨", 
      title: "Extra Special", 
      desc: "Discover amazing add-ons to wow your guests",
      accent: "border-purple-200 bg-purple-50"
    }
  ]

  return (
    <>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="bg-primary-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">
          🎊
        </div>
        <h3 className="text-2xl font-bold text-primary-600 mb-2">
          Welcome to {firstName}'s Party Dashboard!
        </h3>
        <p className="text-gray-600">Your party planning command center is ready!</p>
      </div>

      {/* Cards */}
      <div className="grid gap-4 mb-6">
        {cards.map((card, index) => (
          <div key={index} className={`p-4 rounded-xl border-2 ${card.accent} hover:scale-[1.02] transition-transform duration-200 cursor-pointer`}>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{card.icon}</div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 mb-1">{card.title}</h4>
                <p className="text-sm text-gray-600">{card.desc}</p>
              </div>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Fun fact */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl p-4 text-center">
        <div className="text-lg font-bold mb-1">🎈 Fun Fact!</div>
        <div className="text-sm opacity-90">
          The average party takes 3-4 weeks to plan, but you're already ahead of the game!
        </div>
      </div>
    </>
  )
}

// VARIATION 3: Achievement Style
function WelcomeVariation3({ firstName, isAlaCarteUser }) {
  return (
    <>
      {/* Achievement Badge */}
      <div className="relative text-center mb-6">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center">
            <Image
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752853551/1_1_lxuiqa.png"
              alt="Snappy celebrating"
              width={60}
              height={60}
              className="w-15 h-15"
            />
          </div>
        </div>
        <div className="absolute -top-2 -left-2 text-3xl">⭐</div>
        <div className="absolute -top-2 -right-2 text-2xl">🏆</div>
        <div className="absolute -bottom-2 -right-2 text-2xl">🎉</div>
      </div>

      <div className="text-center mb-6">
        <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-bold mb-3 inline-block">
          🎯 ACHIEVEMENT UNLOCKED!
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Party Planner Level: {isAlaCarteUser ? 'Explorer' : 'Master'}! 
        </h3>
        <p className="text-gray-600 mb-6">
          {firstName}'s epic celebration is officially in motion! 🚀
        </p>
      </div>

      {/* Progress Bar Style Next Steps */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h4 className="font-bold text-gray-800 text-lg mb-4">🎮 Your Next Quests:</h4>
        
        {isAlaCarteUser ? (
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-white rounded-lg border border-primary-200">
              <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</div>
              <div className="flex-1 text-left">
                <div className="font-semibold">🛍️ Supplier Hunt</div>
                <div className="text-sm text-gray-600">Find more amazing party suppliers</div>
              </div>
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">+50 XP</div>
            </div>
            <div className="flex items-center p-3 bg-white rounded-lg border border-blue-200">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</div>
              <div className="flex-1 text-left">
                <div className="font-semibold">💰 Budget Master</div>
                <div className="text-sm text-gray-600">Set your party budget limits</div>
              </div>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">+25 XP</div>
            </div>
            <div className="flex items-center p-3 bg-white rounded-lg border border-green-200">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</div>
              <div className="flex-1 text-left">
                <div className="font-semibold">📧 Party Launch</div>
                <div className="text-sm text-gray-600">Send enquiries to book suppliers</div>
              </div>
              <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">+100 XP</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-white rounded-lg border border-primary-200">
              <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</div>
              <div className="flex-1 text-left">
                <div className="font-semibold">🎨 Party Customizer</div>
                <div className="text-sm text-gray-600">Adjust budget & swap suppliers</div>
              </div>
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">+75 XP</div>
            </div>
            <div className="flex items-center p-3 bg-white rounded-lg border border-pink-200">
              <div className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</div>
              <div className="flex-1 text-left">
                <div className="font-semibold">💌 Invite Designer</div>
                <div className="text-sm text-gray-600">Create {firstName}'s special invitations</div>
              </div>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">+50 XP</div>
            </div>
            <div className="flex items-center p-3 bg-white rounded-lg border border-purple-200">
              <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</div>
              <div className="flex-1 text-left">
                <div className="font-semibold">✨ Magic Maker</div>
                <div className="text-sm text-gray-600">Add extras to wow your guests</div>
              </div>
              <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">+125 XP</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default function WelcomeDashboardPopup({ isOpen, onClose, onNameSubmit }) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isAlaCarteUser, setIsAlaCarteUser] = useState(false)
  const [childAge, setChildAge] = useState("")
  const [step, setStep] = useState(1)

  // Choose which variation to use (1, 2, or 3)
  const WELCOME_VARIATION = 2 // Change this number to switch variations!

  useEffect(() => {
    const checkAlaCarteContext = () => {
      try {
        const partyDetails = localStorage.getItem('party_details')
        if (partyDetails) {
          const parsed = JSON.parse(partyDetails)
          setIsAlaCarteUser(parsed.source === 'a_la_carte')
        }
      } catch (error) {
        console.log('Error checking a la carte context:', error)
      }
    }
    
    if (isOpen) {
      checkAlaCarteContext()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && step === 2) {
      const timeout = setTimeout(() => {
        // More celebratory confetti for the simplified version
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff6b35', '#f7931e', '#ffd23f', '#06d6a0', '#118ab2', '#073b4c']
        })
        
        // Second burst after a delay
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.7 },
            colors: ['#ff6b35', '#f7931e', '#ffd23f']
          })
        }, 300)
      }, 500)
      
      return () => clearTimeout(timeout)
    }
  }, [isOpen, step])

  const handleNameSubmit = () => {
    if (firstName.trim() && childAge) {
      onNameSubmit?.({
        childName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        childAge: parseInt(childAge),
        firstName: firstName.trim(),
        lastName: lastName.trim()
      })
      setStep(2)
    }
  }

  const handleClose = () => {
    setStep(1)
    setFirstName("")
    setLastName("")
    setChildAge("")
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && firstName.trim() && childAge) {
      handleNameSubmit()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} className="cursor-pointer">
      <DialogContent className="sm:max-w-lg w-[90vw] md:w-[60vw] max-h-[80vh] overflow-y-auto">
        {step === 1 ? (
          // Step 1: Collect Child's Name (restored to original)
          <>
            <DialogHeader className="">
              <DialogTitle className="md:text-4xl text-start text-3xl font-black text-gray-900 leading-tight">
                🎉 Almost Ready!<br className="sm:hidden" /> One Quick Thing...
              </DialogTitle>
            </DialogHeader>

            {/* Name and Age collection */}
            <div className="space-y-3">
              <div className=" text-gray-700 space-y-2">
                <p className="text-sm text-gray-600 px-2">
                  Who's celebrating? We'll make it extra special for them! 🎉
                </p>
              </div>

              {/* Mobile-first responsive form */}
              <div className="space-y-4">
                {/* Child's First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 h-12 text-base font-medium border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                      placeholder="e.g. Emma"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Child's Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last name <span className="text-gray-400 text-xs">(optional)</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 h-12 text-base font-medium border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                      placeholder="e.g. Smith"
                    />
                  </div>
                </div>

                {/* Child's Age */}
                <div className="space-y-2">
                  <Label htmlFor="childAge" className="text-sm font-medium text-gray-700">
                    Turning
                  </Label>
                  <div className="relative">
                    <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Select value={childAge} onValueChange={(value) => setChildAge(value)}>
                      <SelectTrigger className="w-full  pl-10 h-15 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl">
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 years old</SelectItem>
                        <SelectItem value="3">3 years old</SelectItem>
                        <SelectItem value="4">4 years old</SelectItem>
                        <SelectItem value="5">5 years old</SelectItem>
                        <SelectItem value="6">6 years old</SelectItem>
                        <SelectItem value="7">7 years old</SelectItem>
                        <SelectItem value="8">8 years old</SelectItem>
                        <SelectItem value="9">9 years old</SelectItem>
                        <SelectItem value="10">10 years old</SelectItem>
                        <SelectItem value="11">11 years old</SelectItem>
                        <SelectItem value="12">12 years old</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-8">
              <Button 
                onClick={handleNameSubmit}
                disabled={!firstName.trim() || !childAge}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-base rounded-full h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Continue to {firstName.trim() ? `${firstName.trim()}'s` : "My"} Party! 🎉
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Step 2: Simple Celebration
          <div className="relative overflow-hidden ">
            <div className="absolute inset-0"></div>
            
            <div className="relative z-10 p-6 pt-6">
              <DialogHeader className=" pb-6">
                <DialogTitle className="text-4xl text-start font-black text-gray-900 leading-tight">
                  🎉 {firstName}'s Party Plan is Ready!
                </DialogTitle>
              </DialogHeader>

              {/* Big Snappy with Confetti - smaller on mobile */}
              <div className="flex justify-center mb-4 sm:mb-8">
                <div className="relative">
                  <Image
                    src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752853551/1_1_lxuiqa.png"
                    alt="Snappy celebrating"
                    width={250}
                    height={250}
                    className="md:w-[250px] md:h-[250px] w-[200px] h-[200px] drop-shadow-2xl"
                  />
                  {/* Floating confetti around Snappy - smaller on mobile */}
                  <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 text-2xl sm:text-3xl animate-bounce">🎊</div>
                  <div className="absolute -top-1 -right-4 sm:-top-2 sm:-right-6 text-xl sm:text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</div>
                  <div className="absolute top-6 -left-6 sm:top-8 sm:-left-8 text-xl sm:text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>✨</div>
                  <div className="absolute top-3 -right-3 sm:top-4 sm:-right-4 text-xl sm:text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>🎈</div>
                  <div className="absolute -bottom-1 -left-4 sm:-bottom-2 sm:-left-6 text-xl sm:text-2xl animate-bounce" style={{ animationDelay: '0.8s' }}>🎊</div>
                  <div className="absolute -bottom-3 -right-1 sm:-bottom-4 sm:-right-2 text-2xl sm:text-3xl animate-bounce" style={{ animationDelay: '1s' }}>🎉</div>
                  <div className="absolute top-1/2 -left-8 sm:-left-10 text-lg sm:text-xl animate-bounce" style={{ animationDelay: '1.2s' }}>⭐</div>
                  <div className="absolute top-1/3 -right-6 sm:-right-8 text-lg sm:text-xl animate-bounce" style={{ animationDelay: '1.4s' }}>💫</div>
                </div>
              </div>

              {/* Simple Message - smaller text on mobile */}
              <div className="mb-6 sm:mb-8">
                <p className="text-lg sm:text-xl text-gray-700 font-medium leading-relaxed">
                  Your party planning dashboard is loaded and ready to go!
                </p>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button 
                    type="button" 
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold  text-sm md:text-xl h-10 rounded-2xl md:h-16 transition-all duration-200 shadow-lg transform hover:scale-[1.02]"
                    onClick={handleClose}
                  >
                    Got it — Let's Get Planning! 📸
                  </Button>
                </DialogClose>
              </DialogFooter>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
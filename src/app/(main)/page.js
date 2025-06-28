"use client"

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePartyBuilder } from '@/utils/partyBuilderBackend';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Input } from "@/components/ui/input"
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, ArrowRight, Check, AlertCircle, ArrowDown, Search, User, Calendar, UsersIcon, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import MobileNav from "@/components/mobile-nav" // Assuming MobileNav is still desired here
import SearchableEventTypeSelect from "@/components/searchable-event-type-select"
import FlexibleLocationInput from '@/components/FlexibleLocationInput';

export default function HomePage() {

  const router = useRouter();
  const { buildParty, loading, error } = usePartyBuilder();

  const scrollToForm = () => {
    document.getElementById('search-form')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Form state to capture user inputs
  const [formData, setFormData] = useState({
    date: '2025-08-16',
    theme: 'princess',
    guestCount: '15',
    postcode: '',
    childName: '', // We'll need to add this field or derive from theme
    childAge: 6 // Default age, we can make this dynamic
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // For button state
  const [showPartyLoader, setShowPartyLoader] = useState(false); // For full-screen loader
  const [buildingProgress, setBuildingProgress] = useState(0);



  
const PartyBuildingLoader = ({ isVisible, theme, childName, progress }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [visibleImages, setVisibleImages] = useState([]);

  const partyImages = [
    {
      src: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473245/iStock-1150333197_bw6j3b.jpg",
      alt: "Kids enjoying party games"
    },
    {
      src: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473373/iStock-469207460_romywt.jpg", 
      alt: "Children celebrating at party"
    },
    {
      src: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473689/iStock-1369813086_osxnjy.jpg",
      alt: "Fun party activities"
    }
  ];

  const themeEmojis = {
    'spiderman': '🕷️',
    'taylor-swift': '🎤',
    'princess': '👑',
    'dinosaur': '🦕',
    'unicorn': '🦄',
    'science': '🔬',
    'superhero': '🦸',
    'default': '🎉'
  };

  const messages = [
    `Finding the perfect ${theme} entertainment for ${childName}...`,
    `Searching for amazing venues in your area...`,
    `Selecting delicious party food and treats...`,
    `Adding magical decorations and party supplies...`,
    `Putting together the perfect party bags...`,
    `Creating your personalized party timeline...`,
    `Almost ready! Adding final touches...`,
    `🎉 Your perfect party is ready! 🎉`
  ];

  // Handle message cycling
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => {
        if (prev < messages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isVisible, messages.length]);

  // Handle image popping animations
  useEffect(() => {
    if (!isVisible) {
      setVisibleImages([]);
      return;
    }

    const addRandomImage = () => {
      const randomImage = partyImages[Math.floor(Math.random() * partyImages.length)];
      
      // Calculate position to avoid center area where main content is
      let top, left;
      const centerAreaTop = 25; // Main content starts around 25%
      const centerAreaBottom = 75; // Main content ends around 75%
      const centerAreaLeft = 20; // Main content spans roughly 20% to 80%
      const centerAreaRight = 80;
      
      // Randomly choose if image goes on top/bottom or left/right of center
      const placement = Math.random();
      
      if (placement < 0.4) {
        // Top area
        top = Math.random() * 20 + 5; // 5% to 25%
        left = Math.random() * 80 + 10; // 10% to 90%
      } else if (placement < 0.8) {
        // Bottom area
        top = Math.random() * 20 + 75; // 75% to 95%
        left = Math.random() * 80 + 10; // 10% to 90%
      } else {
        // Side areas
        top = Math.random() * 60 + 20; // 20% to 80%
        if (Math.random() < 0.5) {
          // Left side
          left = Math.random() * 15 + 2; // 2% to 17%
        } else {
          // Right side
          left = Math.random() * 15 + 83; // 83% to 98%
        }
      }
      
      const randomPosition = {
        top,
        left,
        size: Math.random() * 120 + 150, // 150px to 270px (much bigger!)
        rotation: Math.random() * 20 - 10, // -10deg to +10deg
        id: Date.now() + Math.random()
      };

      setVisibleImages(prev => [...prev, { ...randomImage, ...randomPosition }]);

      // Remove image with smooth timing
      setTimeout(() => {
        setVisibleImages(prev => prev.filter(img => img.id !== randomPosition.id));
      }, 5000); // 5 seconds - allows 2-3 images on screen at once
    };

    // Add first image quickly
    setTimeout(addRandomImage, 300);
    
    // Add images at consistent, frequent intervals for smooth experience
    const interval = setInterval(() => {
      addRandomImage();
    }, 1800); // Fixed 1.8 second intervals for consistency

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const currentEmoji = themeEmojis[theme] || themeEmojis['default'];

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 overflow-hidden">
      
      {/* Animated party images popping around the screen */}
      {visibleImages.map((image) => (
        <div
          key={image.id}
          className="absolute pointer-events-none animate-bounce-in-scale z-30"
          style={{
            top: `${image.top}%`,
            left: `${image.left}%`,
            transform: `rotate(${image.rotation}deg)`,
            animationDuration: '0.6s', // Quicker, smoother animation
            animationFillMode: 'forwards'
          }}
        >
          <div 
            className="rounded-2xl shadow-2xl border-4 border-white overflow-hidden opacity-85 hover:opacity-100 transition-opacity duration-500"
            style={{
              width: `${image.size}px`,
              height: `${image.size}px`
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
            />
          </div>
        </div>
      ))}

      {/* Main content container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 max-w-lg mx-4 text-center relative z-20">
        
        {/* Header */}
        <div className="mb-8">
          <div className="text-7xl mb-4 animate-bounce">
            {currentEmoji}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Building Your Party!
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            Creating the perfect <span className="font-semibold text-[#FF6B4A]">{theme}</span> experience for <span className="font-semibold">{childName}</span>
          </p>
        </div>

        {/* Progress section */}
        <div className="mb-8">
          <div className="bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#FF6B4A] to-[#FF8A70] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-2xl font-bold text-[#FF6B4A] mb-6">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Loading message */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <p className="text-base text-gray-700 font-medium leading-relaxed animate-pulse">
            {messages[currentMessageIndex]}
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center items-center mt-8 space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[#FF6B4A] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>

      {/* Custom CSS for the bounce-in animation */}
      <style jsx>{`
        @keyframes bounce-in-scale {
          0% {
            transform: scale(0) rotate(${Math.random() * 360}deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(${Math.random() * 20 - 10}deg);
            opacity: 0.9;
          }
          100% {
            transform: scale(1) rotate(var(--final-rotation));
            opacity: 0.85;
          }
        }
        
        .animate-bounce-in-scale {
          animation: bounce-in-scale 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px) rotate(var(--rotation)); }
          50% { transform: translateY(-10px) rotate(var(--rotation)); }
        }
        
        .animate-bounce-in-scale:hover {
          animation: gentle-float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
  
  
const [testValue, setTestValue] = useState('');
const handleFieldChange = (field, value) => {
  console.log('🔄 handleFieldChange called with:', { field, value });
  
  // Add this to see exactly which field is being called
  if (field === 'postcode') {
    console.log('🚨 POSTCODE field update detected!');
    console.log('🚨 Call stack:', new Error().stack);
  }
  
  setFormData(prev => ({ ...prev, [field]: value }));
};


  const mapThemeValue = (formTheme) => {
    const themeMapping = {
      // Specific character themes
      'spiderman': 'spiderman',
      'spider-man': 'spiderman', 
      'taylor-swift': 'taylor-swift',
      'taylor swift': 'taylor-swift',
      'swiftie': 'taylor-swift',
      'princess': 'princess',
      'dinosaur': 'dinosaur',
      'dino': 'dinosaur',
      'unicorn': 'unicorn',
      'science': 'science',
      'scientist': 'science',
      'laboratory': 'science',
      
      // Generic themes (fallback to superhero)
      'superhero': 'superhero',
      'superheroes': 'superhero',
      'hero': 'superhero',
      'action': 'superhero',
      
      // Other themes you might have
      'fairy-tale': 'princess',
      'fairy tale': 'princess',
      'royal': 'princess',
      'prehistoric': 'dinosaur',
      'jurassic': 'dinosaur',
      'magic': 'unicorn',
      'magical': 'unicorn',
      'rainbow': 'unicorn',
      'stem': 'science',
      'experiment': 'science',
      'chemistry': 'science'
    };
    
    // Convert to lowercase for matching
    const lowerTheme = formTheme?.toLowerCase() || '';
    
    // Return mapped theme or fallback to original
    return themeMapping[lowerTheme] || lowerTheme || 'superhero';
  };

  const mapPostcodeToLocation = (postcode) => {
    const postcodeMap = {
      'w3-7qd': 'West London',
      'sw1-1aa': 'Central London',
      'e1-6an': 'East London',
      'n1-9gu': 'North London',
      'se1-9sg': 'South London'
    };
    return postcodeMap[postcode] || 'London';
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Don't submit if already submitting
    if (isSubmitting) return;
    
    try {
      // Set button to loading state first
      setIsSubmitting(true);
      
      // Small delay then show full-screen loader
      setTimeout(() => {
        setShowPartyLoader(true);
        setBuildingProgress(0);
      }, 200);
  
      const partyDetails = {
        date: formData.date,
        theme: mapThemeValue(formData.theme),
        guestCount: parseInt(formData.guestCount),
        location: mapPostcodeToLocation(formData.postcode),
        childName: formData.childName || 'Your Child',
        childAge: formData.childAge,
        budget: 500
      };
  
      console.log('🎪 Submitting party with theme:', partyDetails.theme);
  
      // Progress simulation
      setBuildingProgress(15);
      await new Promise(resolve => setTimeout(resolve, 800));
  
      setBuildingProgress(30);
      await new Promise(resolve => setTimeout(resolve, 600));
  
      setBuildingProgress(50);
      
      // Build the party
      const result = await buildParty(partyDetails);
      
      setBuildingProgress(75);
      await new Promise(resolve => setTimeout(resolve, 800));
  
      setBuildingProgress(90);
      await new Promise(resolve => setTimeout(resolve, 600));
  
      if (result.success) {
        setBuildingProgress(100);
        console.log('✅ Party built successfully with themed entertainment!');
        
        // Show completion for a moment
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Navigate to dashboard
        router.push('/dashboard?show_welcome=true');
      } else {
        console.error('Failed to build party:', result.error);
        // Reset states on error
        setIsSubmitting(false);
        setShowPartyLoader(false);
        setBuildingProgress(0);
      }
    } catch (error) {
      console.error('Error during party building:', error);
      // Reset states on error
      setIsSubmitting(false);
      setShowPartyLoader(false);
      setBuildingProgress(0);
    }
  };
  


  const [postcodeValid, setPostcodeValid] = useState(true);

// 3. Add this validation function in your component:
const validateAndFormatPostcode = (postcode) => {
  if (!postcode) return { isValid: true, formatted: '' };
  
  const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
  const isValid = UK_POSTCODE_REGEX.test(postcode.trim());
  
  // Format postcode (uppercase with space)
  let formatted = postcode;
  if (isValid) {
    const clean = postcode.replace(/\s/g, '').toUpperCase();
    if (clean.length >= 5) {
      formatted = clean.slice(0, -3) + ' ' + clean.slice(-3);
    }
  }
  
  return { isValid, formatted };
};



  
  return (

      <div className="min-h-screen bg-[#F5F5F5]">
       <PartyBuildingLoader 
  isVisible={showPartyLoader} // Use showPartyLoader instead of isBuilding
  theme={mapThemeValue(formData.theme)}
  childName={formData.childName || 'Your Child'}
  progress={buildingProgress}
/>

  {/* Header - Restored from previous version */}
  {/* Hero Section */}
  <section className="md:pt-15 pb-8 md:pb-12">
    <div className="container mx-auto">
      
      {/* Desktop Layout - Original */}
      <div className="hidden lg:block">
        <div className="grid lg:grid-cols-2 gap-8 items-center mb-8">
          {/* Hero Text - Left Side */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
                Book Your <span className="text-[#FF6B6B]">Dream</span> Party in Minutes
              </h1>
              <h2 className="text-xl lg:text-2xl text-gray-700">Choose your theme, we&apos;ll handle everything else</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                From theme selection to thank you bags - get a complete party plan with London&apos;s best suppliers, all
                coordinated in one place
              </p>
            </div>
          </div>

          {/* Hero Visual - Right Side */}
          <div className="relative">
            <div className="relative w-full h-64 lg:h-100">
              {/* Main party image */}
              <div className="relative w-full h-full">
                <Image
       
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473145/iStock-1150515783_xilnlz.jpg"
                  
                  alt="People celebrating at a party"
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>

              {/* Floating illustrated elements */}
              {/* <div className="absolute rounded-xl -top-8 -left-8 w-16 h-26 opacity-80">
                <Image src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473145/iStock-1150515783_xilnlz.jpg" alt="Top hat" fill className="object-contain rounded-2xl" />
              </div>

              <div className="absolute top-4 -right-12 w-20 h-26 opacity-80">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473641/iStock-1205509072_th1rww.jpg"
                  alt="Playing cards"
                  fill
                  className="object-contain rounded-2xl"
                />
              </div>

              <div className="absolute -bottom-8 -right-8 w-16 h-26 opacity-80">
                <Image src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473720/iStock-1047163654_h53byx.jpg" alt="Teacup" fill className="object-contain" />
              </div>

              <div className="absolute bottom-12 -left-12 w-24 h-26 opacity-80">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473689/iStock-1369813086_osxnjy.jpg"
                  alt="Plant decoration"
                  fill
                  className="object-contain rounded-2xl"
                />
              </div> */}
            </div>
          </div>
        </div>

        {/* Desktop Search Form - Original Position */}
        {/* Desktop Search Form - Updated with party builder */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-100 shadow-md">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
                
                {/* Event Date */}
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Event date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFieldChange('date', e.target.value)}
                      className="bg-white border-gray-200 focus:border-[hsl(var(--primary-500))] !rounded-xl h-12 pl-10 w-full"
                      placeholder="Date"
                    />
                  </div>
                </div>

                {/* Event Type */}
                <div className="col-span-2 md:col-span-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Event type</label>
                  <SearchableEventTypeSelect 
                    value={formData.theme}
                    onValueChange={(value) => handleFieldChange('theme', value)}
                    defaultValue="princess" 
                  />
                </div>

                {/* Guests */}
                <div className="col-span-1 md:col-span-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Guests (up to)</label>
                  <div className="relative">
                    <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Select value={formData.guestCount} onValueChange={(value) => handleFieldChange('guestCount', value)}>
                      <SelectTrigger className="bg-white py-6 px-22 border-gray-200 focus:border-[hsl(var(--primary-500))] rounded-xl h-12 pl-10">
                        <SelectValue placeholder="Guests" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 guests</SelectItem>
                        <SelectItem value="10">10 guests</SelectItem>
                        <SelectItem value="15">15 guests</SelectItem>
                        <SelectItem value="20">20 guests</SelectItem>
                        <SelectItem value="25">25 guests</SelectItem>
                        <SelectItem value="30">30+ guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>


{/* Postcode - Desktop with validation (fixed layout) */}
<div className="col-span-1 md:col-span-1 space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Event postcode
  </label>
  
  <div className="relative">
    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
    <Input
      type="text"
      value={formData.postcode}
      onChange={(e) => {
        const value = e.target.value;
        handleFieldChange('postcode', value);
        const { isValid } = validateAndFormatPostcode(value);
        setPostcodeValid(isValid);
      }}
      onBlur={() => {
        // Format when user finishes typing
        const { isValid, formatted } = validateAndFormatPostcode(formData.postcode);
        if (isValid && formatted !== formData.postcode) {
          handleFieldChange('postcode', formatted);
        }
      }}
      placeholder="Enter your postcode"
      className={`
        bg-white py-6 px-12 border-gray-200 focus:border-[hsl(var(--primary-500))] rounded-xl h-12 pl-10 pr-10
        ${!postcodeValid && formData.postcode ? 'border-red-300 focus:border-red-500' : ''}
      `}
    />
    
    {/* Validation icon */}
    {formData.postcode && (
      postcodeValid ? (
        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
      ) : (
        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
      )
    )}
    
    {/* Validation message - positioned absolutely to not affect layout */}
    {!postcodeValid && formData.postcode && (
      <div className="absolute top-full left-0 right-0 mt-1 z-10">
        <p className="text-xs text-red-600 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-red-200">
          <AlertCircle className="w-3 h-3" />
          Please enter a valid UK postcode
        </p>
      </div>
    )}
    
    {postcodeValid && formData.postcode && (
      <div className="absolute top-full left-0 right-0 mt-1 z-10">
        <p className="text-xs text-green-600 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-green-200">
          <Check className="w-3 h-3" />
          Valid postcode
        </p>
      </div>
    )}
  </div>
</div>
                {/* Search Button - Updated */}
                <div className="col-span-2 md:col-span-1 mt-4 md:mt-0 md:flex md:items-end">
                <Button 
  type="submit" 
  disabled={isSubmitting} // Use isSubmitting instead of loading
  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
>
  {isSubmitting ? (
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      Building Your Party...
    </div>
  ) : (
    "Create My Perfect Party"
  )}
</Button>
                </div>
                
              </div>
            </form>
      </div>

      {/* Mobile Layout - Full Screen Hero */}
      <div className="lg:hidden">
  {/* Hero section */}
  <div className="relative h-screen">
    {/* Background image */}
    <div className="absolute inset-0">
      <Image
        src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1751018218/iStock-1149320278_srn8ti.jpg"
        alt="People celebrating at a party"
        fill
        className="object-cover scale-110 -translate-y-12"
      />
      {/* Lighter overlay - let the image breathe more */}
      <div className="absolute h-screen inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
    </div>
     
    {/* Content overlay */}
    <div className="relative z-10 flex flex-col pt-20 items-center text-center h-full px-6">
      <div className="max-w-sm mx-auto">
        <h1 className="text-5xl font-poppins-fix font-black leading-tight text-white mb-6 tracking-tight" 
            style={{
              fontFamily: 'var(--font-poppins), sans-serif',
              textShadow: '0 4px 16px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4)'
            }}>
          Your <span className="text-[#FF6B6B]">Dream</span> Party In Minutes
        </h1>
                         
        <p className="text-xl font-bold text-white leading-relaxed mb-8" 
           style={{textShadow: '0 3px 12px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)'}}>
          Choose your theme, we&apos;ll handle everything else
        </p>

        {/* CTA Button */}
        <Link href="#search-form">
          <Button className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-black h-14 rounded-xl px-8 text-lg shadow-xl transition-all hover:shadow-2xl transform hover:scale-105 mb-8 w-full max-w-xs">
            Plan Your Party
          </Button>
        </Link>
         
        {/* Scroll indicator */}
        <div className="flex flex-col items-center text-white">
          <span className="text-sm mb-2 font-medium" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>
            Scroll down to get started
          </span>
          <div className="animate-bounce">
            <svg className="w-6 h-6 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    </div>
  </section>

  {/* Mobile Search Form Section - ONLY MOBILE */}
          {/* Decorative Elements */}

          <form onSubmit={handleSearch} className="bg-white md:hidden rounded-3xl mobile-form-container border border-gray-100 shadow-xl max-w-2xl mx-auto">
            
            <div className="mobile-form-grid">
      
              {/* Event Date - Full width */}
              <div className="form-field-date form-field-full space-y-2 w-full">
                <label className="block text-sm font-medium text-gray-700">Event date</label>
                <div className="relative w-full">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    className=" bg-white border-gray-200 focus:border-primary-500 rounded-xl h-12"
           
                    placeholder="Date"
                  />
                </div>
              </div>

              {/* Event Type - Full width */}
              <div className="form-field-type form-field-full space-y-2">
                <label className="block text-sm font-medium text-gray-700">Event type</label>
                <div className="w-full">
                  <SearchableEventTypeSelect 
                    value={formData.theme}
                    onValueChange={(value) => handleFieldChange('theme', value)}
                    defaultValue="princess" 
                    className="w-full" 
                  />
                </div>
              </div>

              {/* Guests - Half width on larger mobile */}
              <div className="form-field-guests form-field-half space-y-2">
                <label className="block text-sm font-medium text-gray-700">Guests (up to)</label>
                <div className="relative w-full">
                  <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Select value={formData.guestCount} onValueChange={(value) => handleFieldChange('guestCount', value)}>
                    <SelectTrigger className="w-full bg-white border-gray-200 focus:border-primary-500 rounded-xl h-12 pl-10">
                      <SelectValue placeholder="Guests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 guests</SelectItem>
                      <SelectItem value="10">10 guests</SelectItem>
                      <SelectItem value="15">15 guests</SelectItem>
                      <SelectItem value="20">20 guests</SelectItem>
                      <SelectItem value="25">25 guests</SelectItem>
                      <SelectItem value="30">30+ guests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
{/* Postcode - Mobile with validation (fixed layout) */}
<div className="form-field-postcode form-field-half space-y-2">
  <label className="block text-sm font-medium text-gray-700">Event postcode</label>
  <div className="relative w-full">
    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
    <Input
      type="text"
      value={formData.postcode}
      onChange={(e) => {
        const value = e.target.value;
        handleFieldChange('postcode', value);
        const { isValid } = validateAndFormatPostcode(value);
        setPostcodeValid(isValid);
      }}
      onBlur={() => {
        // Format when user finishes typing
        const { isValid, formatted } = validateAndFormatPostcode(formData.postcode);
        if (isValid && formatted !== formData.postcode) {
          handleFieldChange('postcode', formatted);
        }
      }}
      placeholder="Enter your postcode"
      className={`
        w-full bg-white border-gray-200 focus:border-primary-500 rounded-xl h-12 pl-10 pr-10
        ${!postcodeValid && formData.postcode ? 'border-red-300 focus:border-red-500' : ''}
      `}
    />
    
    {/* Validation icon */}
    {formData.postcode && (
      postcodeValid ? (
        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
      ) : (
        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
      )
    )}
    
    {/* Validation message - positioned absolutely for mobile */}
    {!postcodeValid && formData.postcode && (
      <div className="absolute top-full left-0 right-0 mt-1 z-20">
        <p className="text-xs text-red-600 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-red-200">
          <AlertCircle className="w-3 h-3" />
          Please enter a valid UK postcode
        </p>
      </div>
    )}
  </div>
</div>

              {/* Search Button - Full width - Updated */}
              <div className="form-field-button form-field-full">
              <Button 
  type="submit" 
  disabled={isSubmitting} // Use isSubmitting instead of loading
  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
>
  {isSubmitting ? (
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      Building Your Party...
    </div>
  ) : (
    "Create My Perfect Party"
  )}
</Button>
              </div>
              
            </div>
          </form>


      {/* Trust Indicators */}
      <section className="bg-white py-6 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-green-500 text-green-500" />
                ))}
              </div>
              <span className="font-semibold text-gray-900">Excellent</span>
              <span className="text-gray-600">3,002 reviews on</span>
              <span className="font-bold text-green-600">★ Trustpilot</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section id="categories" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Some of our favourite party experiences</h2>
            <p className="text-xl text-gray-600">
              Looking for something special? Explore our expert picks for parties that go above & beyond.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Garden Party Deluxe",
                badge: "EXTRAORDINARY ✨",
                image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595139/blog-post-5_nvozyq.png",
              },
              {
                title: "Rooftop Celebration",
                badge: "POPTOP CHOICE 💖",
                image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595066/party_uam87x.png",
              },
              {
                title: "Vintage Tea Party",
                badge: "POPTOP CHOICE 💖",
                image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594997/balloons_r2wbfh.png",
              },
              {
                title: "Beach Party Bash",
                badge: "TRENDING 🔥",
                image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594938/face-painter_kdiqia.png",
              },
            ].map((experience, index) => (
              <Card
                key={index}
                className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={experience.image || "/placeholder.svg"}
                    alt={experience.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary-500 hover:bg-primary-500 text-white font-bold px-3 py-1 rounded-full">
                      {experience.badge}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-900">{experience.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* The BookABash Way */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">The BookABash Way</h3>

              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Tell us about your party</h4>
                    <p className="text-gray-600">Share your theme, date, and details</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">We create your personalized dashboard</h4>
                    <p className="text-gray-600">Get matched with perfect suppliers for your theme</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Review, customize, and book everything</h4>
                    <p className="text-gray-600">Complete coordination in one place</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Traditional vs Our Way */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Traditional Way vs Our Way</h3>
       
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h4 className="font-semibold text-gray-700 mb-4">Traditional Way:</h4>
                <div className="flex items-center space-x-2 text-gray-600 mb-6">
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                  <span>Compare</span>
                  <ArrowRight className="w-4 h-4" />
                  <span>Book</span>
                  <ArrowRight className="w-4 h-4" />
                  <span>Repeat for each supplier</span>
                </div>

                <h4 className="font-semibold text-primary-500 mb-4">BookABash Way:</h4>
                <div className="flex items-center space-x-2 text-primary-500">
                  <span>Plan</span>
                  <ArrowRight className="w-4 h-4" />
                  <span>Coordinate</span>
                  <ArrowRight className="w-4 h-4" />
                  <span>Celebrate</span>
                </div>
              </div>

              <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
                <p className="text-xl font-medium text-gray-900">
                  Why book 6 different suppliers when you can plan 1 complete party?
                </p>
              </div>

              <div className="pt-4">
                <Button className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg">
                  Start Planning Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Stories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real Parties Planned with BookABash</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Emma's Superhero Adventure",
                theme: "Superhero",
                quote: "BookABash made planning so easy! All the suppliers worked perfectly together.",
                image: "/superhero.webp",
              },
              {
                name: "Lucas's Jungle Safari",
                theme: "Jungle Safari",
                quote: "The themed coordination was amazing. Best party we've ever thrown!",
                image: "/bouncy-castle.png",
              },
              {
                name: "Sophia's Princess Palace",
                theme: "Princess",
                quote: "Everything matched our theme perfectly. The dashboard made planning stress-free.",
                image: "/princessbanner.webp",
              },
            ].map((story, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-lg">
                <div className="relative h-48">
                  <Image src={story.image || "/placeholder.svg"} alt={story.name} fill className="object-cover" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary-500 text-white">{story.theme} Theme</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{story.name}</h3>
                  <p className="text-gray-600 italic mb-4">&ldquo;{story.quote}&ldquo;</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">Happy Parent</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Final CTA */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F7] to-white z-0"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FC6B57]/5 rounded-bl-full z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FC6B57]/5 rounded-tr-full z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#2F2F2F] mb-6">
                  Ready to plan your next bash?
                </h2>
                <p className="text-[#707070] mb-8">
                  Join thousands of happy parents who&apos;ve made party planning a breeze with BookABash. Your perfect party is just a few clicks away.
                </p>
                <div className="space-y-4">
                  <a
                    href="#"
                    className="block w-full bg-[#FC6B57] text-white px-6 py-4 rounded-full hover:bg-[#e55c48] transition-colors text-center text-lg font-medium"
                  >
                    Start Booking Now
                  </a>
                  <a
                    href="#"
                    className="block w-full border border-[#FC6B57] text-[#FC6B57] px-6 py-4 rounded-full hover:bg-[#FC6B57] hover:text-white transition-colors text-center text-lg font-medium"
                  >
                    Browse Top Categories
                  </a>
                </div>
              </div>
              <div className="md:w-3/4 relative min-h-[300px]">
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473145/iStock-1150515783_xilnlz.jpg"
                alt="Happy children celebrating at a birthday party"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              </div>
            </div>
            <div className="bg-[#FFF8F7] p-6 text-center">
              <p className="text-[#2F2F2F] font-medium">
                Have questions? <a href="#" className="text-[#FC6B57] hover:underline">Chat with our team</a> or call us at <span className="text-[#FC6B57]">0800 123 4567</span>
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer - Restored from previous version */}
      {/* <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Link href="/">
                  <div className="h-8 w-auto relative">
                    <Image src="/images/logo.png" alt="BookABash" width={120} height={32} className="object-contain" />
                  </div>
                </Link>
              </div>
              <p className="text-gray-400">London's premier party planning platform for extraordinary celebrations.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    My Events
                  </Link>
                </li>
                <li>
                  <Link href="/browse" className="hover:text-white">
                    Browse Suppliers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Party Themes
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Venues
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Safety
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Reviews
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BookABash. All rights reserved. Making London parties extraordinary.</p>
          </div>
        </div>
      </footer> */}
    </div>
  )
}
// "use client";

// import { useState } from "react"
// import Image from "next/image"

// export default function HomePage() {
//   const [category, setCategory] = useState("")
//   const [postcode, setPostcode] = useState("")
//   const [budget, setBudget] = useState(200)
//   const [activeTestimonial, setActiveTestimonial] = useState(0)
//   const [registerEmail, setRegisterEmail] = useState("")
//   const [status, setStatus] = useState("")
//   const [registered, setRegistered] = useState(false)
//   const [activeTab, setActiveTab] = useState("supplier") 
//   const [showSuccessModal, setShowSuccessModal] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const testimonials = [
//     {
//       quote: "BookABash saved me so much time! I found an amazing magician and ordered the cake all in one go. My son's 7th birthday was a huge hit!",
//       author: "Sophie, mum of two in North London",
//       rating: 5
//     },
//     {
//       quote: "I was panicking about my daughter's birthday until I found BookABash. Within an hour I had everything sorted. The face painter was incredible!",
//       author: "James, dad of three in Manchester",
//       rating: 5
//     },
//     {
//       quote: "The transparent pricing was such a relief. No hidden costs and I could stick to my budget while still giving my twins an amazing 5th birthday party.",
//       author: "Priya, mum of twins in Birmingham",
//       rating: 5
//     },
//     {
//       quote: "BookABash made planning my son's superhero party so easy. Found an amazing entertainer and venue in just one evening!",
//       author: "Michael, dad in Leeds",
//       rating: 5
//     },
//     {
//       quote: "As a busy working mum, I don't have time to call dozens of providers. BookABash let me book everything in one evening!",
//       author: "Emma, mum in Edinburgh",
//       rating: 5
//     }
//   ]
//   // const handleRegisterSubmit = async (e) => {
//   //   e.preventDefault()
//   //   // In a real implementation, this would send the email to a backend service
//   //   try {
//   //     const response = await fetch("/api/subscribe", {
//   //       method: "POST",
//   //       body: JSON.stringify({ email: registerEmail}),
//   //       headers: { Accept: "application/json" },
//   //     });

//   //     if (response.ok) {
//   //       setRegistered(true)
//   //       console.log("Registered email:", registerEmail)
//   //       setStatus("Thank you for signing up! Please check your email for confirmation.");
//   //       setRegisterEmail("");
//   //           // Reset form after 5 seconds
//   //   setTimeout(() => {
//   //     setRegistered(false)
//   //     setRegisterEmail("")
//   //   }, 5000)
//   //     } else {
//   //       setStatus("Oops! Something went wrong.");
//   //     }
//   //   } catch (error) {
//   //     setStatus("Oops! Something went wrong.", error);
//   //   }
//   // }

//   const handleRegisterSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true)
//   console.log("Registering email:", registerEmail);
//     const res = await fetch("/api/subscribe", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email: registerEmail }),
//     });
  
//     const data = await res.json();
  
//     if (res.ok) {
//       setIsSubmitting(false)
//      setShowSuccessModal(true)
//       setRegisterEmail("");

//     } else {
//       alert(data.error || "Something went wrong");
//     }
//   };


//   return (
//     <div className="min-h-screen bg-[#FDFDFB] overflow-hidden relative">
     
//   {/* Hero Section */}
//   <section className="relative py-12 md:py-16">
//         {/* Hero Background */}
//         <div className="absolute inset-0 overflow-hidden">
//         <Image
//     src="https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748522377/blog-hero_lhgb8b.png"
//     alt="Colorful children's party with balloons and streamers"
//     fill
//     priority
//     style={{ objectFit: 'cover' }}
//     sizes="(max-width: 768px) 100vw, 1200px"
//   />
//         </div>

//         {/* Semi-transparent overlay - slightly darker to make text pop more */}
//         <div className="absolute inset-0 bg-gradient-to-r from-[#2F2F2F]/50 to-[#2F2F2F]/40 backdrop-blur-[2px] z-10"></div>

//         <div className="container mx-auto px-4 relative z-20">
//           <div className="max-w-5xl mx-auto">
//             <div className="bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-lg shadow-lg">
//               {/* Eye-Catching Offer Badge - More compact on mobile */}
//               <div className="flex justify-center mb-3 md:mb-4">
//                 <div className="relative">
//                   <div className="bg-gradient-to-r from-[#FC6B57] to-[#e55c48] text-white px-3 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-lg font-bold inline-flex items-center gap-1 md:gap-2 shadow-lg animate-pulse">
//                     <span className="text-lg md:text-2xl">🎉</span>
//                     <span className="hidden md:inline">Limited Offer: First 100 Suppliers Get 3 Months Free!</span>
//                     <span className="md:hidden">First 100 Get 3 Months Free!</span>
//                   </div>
//                   {/* Starburst decoration - smaller on mobile */}
//                   <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-1 py-0.5 md:px-2 md:py-1 rounded-full transform rotate-12 shadow-md">
//                     HOT!
//                   </div>
//                 </div>
//               </div>

//               {/* Urgency Counter - More compact on mobile */}
//               <div className="flex justify-center mb-3 md:mb-4">
//                 <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium">
//                   ⏰ Only <span className="font-bold text-red-600">37 spots left</span>
//                   <span className="hidden md:inline"> - Don&apos;t miss out!</span>
//                 </div>
//               </div>

//               <div className="text-center mb-4 md:mb-6">
//                 <h1 className="text-2xl md:text-5xl font-bold text-[#2F2F2F] mb-3 md:mb-4 leading-tight">
//                   <span className="md:hidden">
//                     Get{" "}
//                     <span className="bg-gradient-to-r from-[#FC6B57] to-[#e55c48] bg-clip-text text-transparent">
//                       3 Months Free
//                     </span>{" "}
//                     — First 100 Suppliers!
//                   </span>
//                   <span className="hidden md:block">
//                     Get{" "}
//                     <span className="bg-gradient-to-r from-[#FC6B57] to-[#e55c48] bg-clip-text text-transparent">
//                       3 Months Commission-Free
//                     </span>{" "}
//                     — Be Among the First 100 Suppliers!
//                   </span>
//                 </h1>
//                 <p className="text-lg md:text-xl text-[#707070]">
//                   <span className="md:hidden">Reach more customers and grow your business.</span>
//                   <span className="hidden md:block">
//                     Reach more customers and grow your party services with BookABash.
//                   </span>
//                 </p>
//               </div>

//               {/* Supplier Form - More compact on mobile */}
              
//                  <div className="max-w-lg mx-auto mb-6 md:mb-8">
//                 <div className="bg-[#2F2F2F]/5 p-4 md:p-6 rounded-lg">
//                   <form onSubmit={handleRegisterSubmit}>
//                     <div className="flex flex-col gap-2 md:gap-3">
//                       <input
//                         type="email"
//                         placeholder="Your business email"
//                         value={registerEmail}
//                         onChange={(e) => setRegisterEmail(e.target.value)}
//                         className="p-3 md:p-4 dark:text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FC6B57] text-base md:text-lg"
//                         required
//                         disabled={isSubmitting}
//                       />
//                       <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="bg-gradient-to-r from-[#FC6B57] to-[#e55c48] text-white px-4 py-3 md:py-4 rounded-md hover:from-[#e55c48] hover:to-[#d54a37] transition-all duration-300 font-bold text-base md:text-lg shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                       >
//                         {isSubmitting ? (
//                           <span className="flex items-center justify-center">
//                             <svg
//                               className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
//                               xmlns="http://www.w3.org/2000/svg"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                             >
//                               <circle
//                                 className="opacity-25"
//                                 cx="12"
//                                 cy="12"
//                                 r="10"
//                                 stroke="currentColor"
//                                 strokeWidth="4"
//                               ></circle>
//                               <path
//                                 className="opacity-75"
//                                 fill="currentColor"
//                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                               ></path>
//                             </svg>
//                             <span className="md:hidden">Claiming...</span>
//                             <span className="hidden md:block">Claiming Your Spot...</span>
//                           </span>
//                         ) : (
//                           <>
//                             <span className="md:hidden">🚀 Claim Your Spot!</span>
//                             <span className="hidden md:block">🚀 Claim Your Spot Now - Limited Time!</span>
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </form>
//                   <p className="text-[#707070] text-xs md:text-sm mt-2 md:mt-3 text-center">
//                     <span className="md:hidden">No commission for 3 months if you&apos;re in the first 100.</span>
//                     <span className="hidden md:block">
//                       No commission fees for your first 3 months if you&apos;re in the first 100 suppliers to sign up.
//                     </span>
//                   </p>
//                 </div>
//               </div>

//               {/* Key Benefits for Suppliers - Simplified on mobile */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
//                 <div className="flex items-start">
//                   <div className="bg-[#FC6B57]/10 p-2 rounded-full mr-3 flex-shrink-0">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-4 w-4 md:h-5 md:w-5 text-[#FC6B57]"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="font-medium text-[#2F2F2F] text-sm md:text-base">
//                       <span className="md:hidden">Reach local customers</span>
//                       <span className="hidden md:block">Reach thousands of local customers</span>
//                     </h3>
//                     <p className="text-xs md:text-sm text-[#707070] hidden md:block">
//                       Connect with parents looking for your exact services
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-start">
//                   <div className="bg-[#FC6B57]/10 p-2 rounded-full mr-3 flex-shrink-0">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-4 w-4 md:h-5 md:w-5 text-[#FC6B57]"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="font-medium text-[#2F2F2F] text-sm md:text-base">
//                       <span className="md:hidden">Easy booking system</span>
//                       <span className="hidden md:block">Easy online booking system</span>
//                     </h3>
//                     <p className="text-xs md:text-sm text-[#707070] hidden md:block">
//                       Manage your calendar and bookings in one place
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-start">
//                   <div className="bg-[#FC6B57]/10 p-2 rounded-full mr-3 flex-shrink-0">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-4 w-4 md:h-5 md:w-5 text-[#FC6B57]"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="font-medium text-[#2F2F2F] text-sm md:text-base">
//                       <span className="md:hidden">Secure payments</span>
//                       <span className="hidden md:block">Secure payments and support</span>
//                     </h3>
//                     <p className="text-xs md:text-sm text-[#707070] hidden md:block">
//                       Get paid on time with our secure payment system
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Supplier Testimonial - Simplified on mobile */}
//               {/* <div className="bg-gradient-to-r from-[#FC6B57]/10 to-[#e55c48]/10 p-4 md:p-6 rounded-lg mb-6 md:mb-8 border border-[#FC6B57]/20">
//                 <div className="flex items-center justify-center mb-3 md:mb-4">
//                   <div className="flex text-yellow-400 text-base md:text-lg">★★★★★</div>
//                 </div>
//                 <blockquote className="text-center">
//                   <p className="text-base md:text-lg text-[#2F2F2F] italic mb-3 md:mb-4">
//                     <span className="md:hidden">"Game-changer! 15 parties booked this month."</span>
//                     <span className="hidden md:block">
//                       "This platform is a game-changer for party providers! I've already booked 15 parties this month
//                       through early access."
//                     </span>
//                   </p>
//                   <footer className="text-[#707070] text-sm md:text-base">— Sarah M., Face Painter, London</footer>
//                 </blockquote>
//               </div> */}

//               {/* Secondary Customer Option - More compact on mobile */}
//               <div className="border-t border-gray-200 pt-4 md:pt-6 text-center">
//                 <p className="text-[#707070] mb-2 md:mb-3 text-sm md:text-base">
//                   <span className="md:hidden">Looking for party services?</span>
//                   <span className="hidden md:block">Looking for party services for your child?</span>
//                 </p>
//                 <button
//                   onClick={() => setActiveTab("customer")}
//                   className="text-[#FC6B57] font-medium hover:underline inline-flex items-center text-sm md:text-base"
//                 >
//                   Get notified when we launch
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-3 w-3 md:h-4 md:w-4 ml-1"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </button>
//               </div>

//               {/* Customer Registration Form - Hidden by default, shown when activeTab is "customer" */}
//               {activeTab === "customer" && (
//                 <div className="mt-6 border-t border-gray-200 pt-6">
//                   <div className="bg-[#FFF8F7] p-6 rounded-lg max-w-lg mx-auto">
//                     <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3 flex items-center">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-5 w-5 mr-2 text-[#FC6B57]"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                         />
//                       </svg>
//                       For Customers
//                     </h3>
//                     <p className="text-[#707070] mb-4">
//                       Be the first to know when we launch and find amazing party providers in your area.
//                     </p>
//                     {!registered ? (
//                       <form onSubmit={handleRegisterSubmit}>
//                         <div className="flex flex-col gap-3">
//                           <input
//                             type="email"
//                             placeholder="Your email address"
//                             className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FC6B57]"
//                             value={registerEmail}
//                             onChange={(e) => setRegisterEmail(e.target.value)}
//                             required
//                           />
//                           <button
//                             type="submit"
//                             className="bg-[#FC6B57] text-white px-4 py-3 rounded-md hover:bg-[#e55c48] transition-colors font-medium"
//                           >
//                             Register Interest
//                           </button>
//                         </div>
//                       </form>
//                     ) : (
//                       <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           className="h-6 w-6 text-green-600 mx-auto mb-2"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                         <p className="text-green-700 text-sm">Thank you! We&apos;ll notify you when BookABash launches.</p>
//                       </div>
//                     )}
//                     <button
//                       onClick={() => setActiveTab("")}
//                       className="text-[#707070] text-sm mt-4 hover:text-[#FC6B57] transition-colors flex items-center mx-auto"
//                     >
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-4 w-4 mr-1"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                       Close
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>


//       {/* How It Works */}
//       <section className="py-20 relative overflow-hidden">
//         {/* Background Elements */}
//         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-[#FFF8F7] z-0"></div>
//         <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#FC6B57]/5 z-0"></div>
//         <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[#FC6B57]/5 z-0"></div>
//         <div className="absolute top-1/4 right-1/3 w-16 h-16 rounded-full bg-[#FC6B57]/5 z-0"></div>

//         <div className="container mx-auto px-4 relative z-10">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold text-[#2F2F2F] mb-4 relative inline-block">
//               Booking a party should feel like magic
//               <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#FC6B57] rounded-full"></div>
//             </h2>
//             <p className="text-[#707070] max-w-2xl mx-auto mt-6">
//               Our simple three-step process takes the stress out of planning your child&apos;s perfect celebration
//             </p>
//           </div>

//           <div className="relative">
//             {/* Connecting Line */}
//             <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-[#FC6B57]/20 via-[#FC6B57] to-[#FC6B57]/20 transform -translate-y-1/2 z-0"></div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
//               {/* Step 1 */}
//               <div className="relative bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl z-10 h-full">
//                 <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#FC6B57] w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
//                   1
//                 </div>
//                 <div className="mt-8 text-center">
//                   <div className="bg-[#FFF8F7] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-10 w-10 text-[#FC6B57]"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                       />
//                     </svg>
//                   </div>
//                   <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Browse local party providers</h3>
//                   <p className="text-[#707070]">
//                     Find the perfect entertainers, venues, and more in your area with our verified local listings.
//                   </p>
//                 </div>
//               </div>

//               {/* Step 2 */}
//               <div className="relative bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl z-10 h-full">
//                 <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#FC6B57] w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
//                   2
//                 </div>
//                 <div className="mt-8 text-center">
//                   <div className="bg-[#FFF8F7] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-10 w-10 text-[#FC6B57]"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//                       />
//                     </svg>
//                   </div>
//                   <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Book instantly — no endless calls</h3>
//                   <p className="text-[#707070]">
//                     Secure your booking online in minutes, not days. Real-time availability and instant confirmation.
//                   </p>
//                 </div>
//               </div>

//               {/* Step 3 */}
//               <div className="relative bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl z-10 h-full">
//                 <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#FC6B57] w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
//                   3
//                 </div>
//                 <div className="mt-8 text-center">
//                   <div className="bg-[#FFF8F7] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-10 w-10 text-[#FC6B57]"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
//                       />
//                     </svg>
//                   </div>
//                   <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Relax and enjoy the big day</h3>
//                   <p className="text-[#707070]">
//                     We handle the details so you can focus on the celebration. Our support team is available if you need
//                     anything.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-16 text-center">
//             <a href="#" className="inline-flex items-center text-[#FC6B57] font-medium hover:underline">
//               Learn more about our booking process
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
//                 <path
//                   fillRule="evenodd"
//                   d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//             </a>
//           </div>
//         </div>
//       </section>

//       {/* Benefits Section */}
//       <section className="py-20 relative overflow-hidden">
//         {/* Background Elements */}
//         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FFF8F7] to-[#FDFDFB] z-0"></div>
//         <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#FC6B57]/5 z-0"></div>
//         <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[#FC6B57]/5 z-0"></div>
        
//         <div className="container mx-auto px-4 relative z-10">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold text-[#2F2F2F] mb-4 relative inline-block">
//               Parents love BookABash because it&apos;s…
//               <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#FC6B57] rounded-full"></div>
//             </h2>
//             <p className="text-[#707070] max-w-2xl mx-auto mt-6">
//               We&apos;ve designed our platform with busy parents in mind, making party planning a breeze
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
//             <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
//               <div className="text-[#FC6B57] mb-6 transform transition-transform duration-300 group-hover:scale-110">
//                 <div className="bg-[#FFF8F7] w-16 h-16 rounded-full flex items-center justify-center">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-8 w-8"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                   </svg>
//                 </div>
//               </div>
//               <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Fast and stress-free</h3>
//               <p className="text-[#707070]">Book everything you need in minutes, not hours. Our streamlined process saves you valuable time.</p>
//               <div className="mt-4 pt-4 border-t border-gray-100">
//                 <span className="text-sm text-[#FC6B57] font-medium">Average booking time: 15 minutes</span>
//               </div>
//             </div>

//             <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
//               <div className="text-[#FC6B57] mb-6 transform transition-transform duration-300 group-hover:scale-110">
//                 <div className="bg-[#FFF8F7] w-16 h-16 rounded-full flex items-center justify-center">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-8 w-8"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Trusted, vetted providers</h3>
//               <p className="text-[#707070]">Every provider is verified and reviewed by real parents. We only work with the best in the business.</p>
//               <div className="mt-4 pt-4 border-t border-gray-100">
//                 <span className="text-sm text-[#FC6B57] font-medium">500+ verified providers nationwide</span>
//               </div>
//             </div>

//             <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
//               <div className="text-[#FC6B57] mb-6 transform transition-transform duration-300 group-hover:scale-110">
//                 <div className="bg-[#FFF8F7] w-16 h-16 rounded-full flex items-center justify-center">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-8 w-8"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Transparent pricing</h3>
//               <p className="text-[#707070]">No hidden fees or surprises — see exactly what you&apos;ll pay. Compare options easily to stay within budget.</p>
//               <div className="mt-4 pt-4 border-t border-gray-100">
//                 <span className="text-sm text-[#FC6B57] font-medium">Average savings of £75 per booking</span>
//               </div>
//             </div>

//             <div className="bg-white p-8 rounded-xl shadow-md transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
//               <div className="text-[#FC6B57] mb-6 transform transition-transform duration-300 group-hover:scale-110">
//                 <div className="bg-[#FFF8F7] w-16 h-16 rounded-full flex items-center justify-center">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-8 w-8"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               <h3 className="text-xl font-semibold text-[#2F2F2F] mb-3">Built just for kids&apos; parties</h3>
//               <p className="text-[#707070]">Specialized for children&apos;s events, not generic bookings. We understand what makes a great kids&apos; party.</p>
//               <div className="mt-4 pt-4 border-t border-gray-100">
//                 <span className="text-sm text-[#FC6B57] font-medium">10,000+ successful parties</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Popular Categories */}
//       <section className="py-20 bg-white relative">
//   <div className="absolute top-0 left-0 w-full h-64 bg-[#FFF8F7]/50 z-0"></div>

//   <div className="container mx-auto px-4 relative z-10">
//     <div className="text-center mb-16">
//       <h2 className="text-3xl md:text-4xl font-bold text-[#2F2F2F] mb-4 relative inline-block">
//         Popular Categories
//         <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#FC6B57] rounded-full"></div>
//       </h2>
//       <p className="text-[#707070] max-w-2xl mx-auto mt-6">
//         Find everything you need for the perfect party
//       </p>
//     </div>

//     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
//       {[
//         { src: "https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748594938/face-painter_kdiqia.png", alt: "Face painter with child", title: "Face Painters", price: "From £85" },
//         { src: "https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748594952/bouncy-castle_gaq0z4.png", alt: "Bouncy castle", title: "Bouncy Castles", price: "From £120" },
//         { src: "https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748594968/party-host_omxpqr.jpg", alt: "Party host", title: "Party Hosts", price: "From £150" },
//         { src: "https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748594980/birthday-cake_f8wr1u.png", alt: "Birthday cake", title: "Cakes & Catering", price: "From £65" },
//         { src: "https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748594997/balloons_r2wbfh.png", alt: "Party decorations", title: "Decor & Extras", price: "From £45" },
//       ].map((item, idx) => (
//         <div key={idx} className="relative group overflow-hidden rounded-xl shadow-md w-full h-64">
//           <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/70 to-transparent z-10"></div>
//           <Image 
//             src={item.src}
//             alt={item.alt}
//             fill
//             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
//             className="object-cover transition-transform duration-500 group-hover:scale-110"
//             priority={idx < 2}
//           />
//           <div className="absolute bottom-0 left-0 w-full p-4 z-20">
//             <div className="text-white mb-2 flex justify-center">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-white text-center">{item.title}</h3>
//             <div className="mt-2 flex justify-center">
//               <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">
//                 {item.price}
//               </span>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>

//     <div className="mt-12 text-center">
//       <a
//         href="#"
//         className="inline-flex items-center justify-center bg-[#FC6B57] text-white px-6 py-3 rounded-full hover:bg-[#e55c48] transition-colors"
//       >
//         View All Categories
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
//           <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
//         </svg>
//       </a>
//     </div>
//   </div>
// </section>


//       {/* Testimonials */}
//       <section className="py-20 bg-[#FFF8F7] relative overflow-hidden">
//         <div className="absolute top-0 left-0 w-full h-full">
//           <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#FC6B57]/5"></div>
//           <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[#FC6B57]/5"></div>
//           <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-[#FC6B57]/5"></div>
//         </div>
        
//         <div className="container mx-auto px-4 relative z-10">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold text-[#2F2F2F] mb-4 relative inline-block">
//               What Parents Say
//               <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#FC6B57] rounded-full"></div>
//             </h2>
//             <p className="text-[#707070] max-w-2xl mx-auto mt-6">
//               Don&apos;t just take our word for it — hear from parents who&apos;ve used BookABash
//             </p>
//           </div>

//           <div className="max-w-4xl mx-auto">
//             <div className="relative bg-white p-8 md:p-12 rounded-2xl shadow-xl">
//               <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[#FC6B57] text-7xl">&quot;</div>
              
//               <div className="mt-6 text-center">
//                 <p className="text-xl md:text-2xl text-[#2F2F2F] italic mb-8">
//                   {testimonials[activeTestimonial].quote}
//                 </p>
                
//                 <div className="flex items-center justify-center mb-4">
//                   <div className="text-[#FC6B57] text-xl">
//                     {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
//                       <span key={i} className="inline-block">★</span>
//                     ))}
//                   </div>
//                 </div>
                
//                 <p className="font-semibold text-[#2F2F2F] text-lg">
//                   {testimonials[activeTestimonial].author}
//                 </p>
//               </div>
              
//               <div className="mt-10 flex justify-center space-x-2">
//                 {testimonials.map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setActiveTestimonial(index)}
//                     className={`w-3 h-3 rounded-full transition-colors ${
//                       activeTestimonial === index ? 'bg-[#FC6B57]' : 'bg-gray-300 hover:bg-gray-400'
//                     }`}
//                     aria-label={`View testimonial ${index + 1}`}
//                   />
//                 ))}
//               </div>
              
//               <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
//                 <button
//                   onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
//                   className="bg-white rounded-full p-2 shadow-md hover:bg-[#FFF8F7] transition-colors"
//                   aria-label="Previous testimonial"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FC6B57]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                   </svg>
//                 </button>
//               </div>
              
//               <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
//                 <button
//                   onClick={() => setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
//                   className="bg-white rounded-full p-2 shadow-md hover:bg-[#FFF8F7] transition-colors"
//                   aria-label="Next testimonial"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FC6B57]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>
          
//           <div className="mt-12 text-center">
//             <a href="#" className="text-[#FC6B57] font-medium hover:underline inline-flex items-center">
//               Read more reviews
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
//               </svg>
//             </a>
//           </div>
//         </div>
//       </section>

//       {/* Final CTA */}
//       <section className="py-20 bg-white relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F7] to-white z-0"></div>
        
//         {/* Decorative Elements */}
//         <div className="absolute top-0 right-0 w-64 h-64 bg-[#FC6B57]/5 rounded-bl-full z-0"></div>
//         <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FC6B57]/5 rounded-tr-full z-0"></div>
        
//         <div className="container mx-auto px-4 relative z-10">
//           <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
//             <div className="md:flex">
//               <div className="md:w-1/2 p-8 md:p-12">
//                 <h2 className="text-3xl md:text-4xl font-bold text-[#2F2F2F] mb-6">
//                   Ready to plan your next bash?
//                 </h2>
//                 <p className="text-[#707070] mb-8">
//                   Join thousands of happy parents who&apos;ve made party planning a breeze with BookABash. Your perfect party is just a few clicks away.
//                 </p>
//                 <div className="space-y-4">
//                   <a
//                     href="#"
//                     className="block w-full bg-[#FC6B57] text-white px-6 py-4 rounded-full hover:bg-[#e55c48] transition-colors text-center text-lg font-medium"
//                   >
//                     Start Booking Now
//                   </a>
//                   <a
//                     href="#"
//                     className="block w-full border border-[#FC6B57] text-[#FC6B57] px-6 py-4 rounded-full hover:bg-[#FC6B57] hover:text-white transition-colors text-center text-lg font-medium"
//                   >
//                     Browse Top Categories
//                   </a>
//                 </div>
//               </div>
//               <div className="md:w-1/2 relative min-h-[300px]">
//               <Image
//                 src="https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748595066/party_uam87x.png"
//                 alt="Happy children celebrating at a birthday party"
//                 fill
//                 sizes="(max-width: 768px) 100vw, 50vw"
//               />

//               </div>
//             </div>
//             <div className="bg-[#FFF8F7] p-6 text-center">
//               <p className="text-[#2F2F2F] font-medium">
//                 Have questions? <a href="#" className="text-[#FC6B57] hover:underline">Chat with our team</a> or call us at <span className="text-[#FC6B57]">0800 123 4567</span>
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>
// {/* Success Modal */}
// {showSuccessModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
//             <div className="p-8 text-center">
//               {/* Success Icon */}
//               <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-8 w-8 text-green-600"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>

//               {/* Title */}
//               <h3 className="text-2xl font-bold text-[#2F2F2F] mb-4">🎉 Welcome to BookABash!</h3>

//               {/* Message */}
//               <p className="text-[#707070] mb-6 leading-relaxed">
//                 Thanks for signing up! We&apos;ve sent you a confirmation email with next steps to get your business listed.
//               </p>

//               {/* Email reminder */}
//               <div className="bg-[#FFF8F7] border border-[#FC6B57]/20 rounded-lg p-4 mb-6">
//                 <div className="flex items-center justify-center mb-2">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5 text-[#FC6B57] mr-2"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                     />
//                   </svg>
//                   <span className="text-sm font-medium text-[#2F2F2F]">Check your email</span>
//                 </div>
//                 <p className="text-xs text-[#707070]">
//                   Don&apos;t forget to check your spam folder if you don&apos;t see it in your inbox!
//                 </p>
//               </div>

//               {/* Close Button */}
//               <button
//                 onClick={() => setShowSuccessModal(false)}
//                 className="w-full bg-[#FC6B57] text-white px-6 py-3 rounded-full hover:bg-[#e55c48] transition-colors font-medium"
//               >
//                 Got it, thanks!
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* Footer */}
    
   

 
//     </div >
//   )
// }
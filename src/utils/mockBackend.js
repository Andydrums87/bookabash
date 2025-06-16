// utils/suppliersBackend.js
// Simple backend for loading suppliers

const mockSuppliers = [
  {
    id: "magic-mike",
    name: "Magic Mike's Superhero Show",
    owner: {
      name: "Mike Johnson",
      email: "mike@magicmike.com",
      phone: "07123456789"
    },
    category: "Entertainment",
    subcategory: "Magicians",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460635/edson-junior-YlgnX_ISPLo-unsplash_wlsz60.jpg",
    rating: 4.9,
    reviewCount: 127,
    bookingCount: 89,
    location: "London & Surrounding Areas",
    priceFrom: 150,
    priceUnit: "per show",
    description: "Professional superhero magic show with audience participation",
    badges: ["DBS Checked", "Highly Rated"],
    availability: "Available this weekend",
    themes: ["superhero", "magic", "entertainment"],
    businessDescription: "Professional superhero magic show with audience participation",
    serviceType: "entertainer",
    packages: [
      {
        id: "magic-basic",
        name: "Basic Magic Show",
        description: "45-minute magic show with superhero theme",
        price: 150,
        priceType: "flat",
        duration: "45 minutes",
        whatsIncluded: ["Magic Show", "Superhero Theme", "Audience Participation"]
      }
    ],
    isComplete: true // Existing suppliers are complete
  },
  {
    id: "spiderman-live-show",
    name: "Amazing Spider-Man Live Show",
    category: "Entertainment",
    subcategory: "Character Visits",
    themes: ["spiderman", "superhero", "marvel", "princess", "dinosaur"],
    image: "https://images.unsplash.com/photo-1521714161819-15534968fc5f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BpZGVybWFufGVufDB8MHwwfHx8MA%3D%3D",
    rating: 4.9,
    reviewCount: 156,
    bookingCount: 89,
    location: "London & Surrounding Areas",
    priceFrom: 180,
    priceUnit: "per hour",
    description: "Professional Spider-Man character with web-slinging stunts and interactive superhero training",
    badges: ["DBS Checked", "Authentic Costume", "Interactive Show"],
    availability: "Available this weekend",
  },
  {
    id: "web-slinger-magic",
    name: "Web-Slinger Magic & Illusions",
    category: "Entertainment",
    subcategory: "Magic Shows",
    themes: ["spiderman", "superhero", "magic"],
    image: "https://images.unsplash.com/photo-1725465447900-a2b5164b6a43?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BpZGVybWFuJTIwa2lkc3xlbnwwfHwwfHx8MA%3D%3D",
    rating: 4.8,
    reviewCount: 134,
    bookingCount: 67,
    location: "Greater London",
    priceFrom: 160,
    priceUnit: "per 45 minutes",
    description: "Spider-Man themed magic show with web tricks and superhero illusions",
    badges: ["Professional Magician", "Spider-Man Licensed"],
    availability: "Book 1 week ahead",
  },

  // === TAYLOR SWIFT THEMED ===
  {
    id: "swiftie-popstar-party",
    name: "Swiftie Pop Star Experience",
    category: "Entertainment", 
    subcategory: "Pop Star Shows",
    themes: ["taylor-swift", "pop-star", "music", "concert"],
    image: "https://images.unsplash.com/photo-1709037805316-2d31b6003d22?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cG9wJTIwc3RhciUyMGtpZHMlMjBwYXJ0eXxlbnwwfHwwfHx8MA%3D%3D",
    rating: 4.9,
    reviewCount: 203,
    bookingCount: 145,
    location: "London Wide",
    priceFrom: 220,
    priceUnit: "per 1.5 hours",
    description: "Taylor Swift tribute performer with karaoke, dance lessons, and friendship bracelet making",
    badges: ["Professional Performer", "Costume Changes", "Interactive"],
    availability: "Book 2 weeks ahead",
  },
  {
    id: "eras-tour-dj",
    name: "Eras Tour DJ Experience",
    category: "Entertainment",
    subcategory: "DJ Services", 
    themes: ["taylor-swift", "music", "pop", "dance", "princess"],
    image: "https://images.unsplash.com/photo-1692796226663-dd49d738f43c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGF5bG9yJTIwc3dpZnR8ZW58MHx8MHx8fDA%3D",
    rating: 4.7,
    reviewCount: 178,
    bookingCount: 98,
    location: "UK Wide",
    priceFrom: 180,
    priceUnit: "per 3 hours",
    description: "Complete Taylor Swift DJ set covering all eras with dance party and sing-alongs",
    badges: ["Professional Sound System", "All Eras Covered"],
    availability: "Available most weekends",
  },

  // === PRINCESS THEMED ===
  {
    id: "royal-princess-party",
    name: "Royal Princess Character Visit",
    category: "Entertainment",
    subcategory: "Character Visits",
    themes: ["princess", "fairy-tale", "royal", "disney"],
    image: "https://images.unsplash.com/photo-1607196337528-2f4adcaff98c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJpbmNlc3MlMjBwYXJ0eSUyMGtpZHN8ZW58MHx8MHx8fDA%3D",
    rating: 4.9,
    reviewCount: 289,
    bookingCount: 234,
    location: "London & Home Counties",
    priceFrom: 150,
    priceUnit: "per hour",
    description: "Beautiful princess character with storytelling, singing, and royal etiquette lessons",
    badges: ["Professional Actress", "Multiple Princesses", "Songs Included"],
    availability: "Available this weekend",
  },
  {
    id: "enchanted-princess-show",
    name: "Enchanted Princess Magic Show",
    category: "Entertainment",
    subcategory: "Magic Shows",
    themes: ["princess", "magic", "fairy-tale", "enchanted"],
    image: "https://images.unsplash.com/photo-1740150265606-d1c6f66e7472?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZW5jaGFudGVkJTIwcHJpbmNlc3MlMjBzaG93fGVufDB8fDB8fHww",
    rating: 4.8,
    reviewCount: 167,
    bookingCount: 112,
    location: "Greater London",
    priceFrom: 170,
    priceUnit: "per 45 minutes",
    description: "Magical princess show with fairy tale illusions and enchanted storytelling",
    badges: ["Professional Magic", "Interactive Story"],
    availability: "Book 1 week ahead",
  },

  // === DINOSAUR THEMED ===
  {
    id: "dino-discovery-show",
    name: "Dinosaur Discovery Educational Show",
    category: "Entertainment",
    subcategory: "Educational Shows",
    themes: ["dinosaur", "prehistoric", "science", "educational"],
    image: "https://images.unsplash.com/photo-1685971703748-28509a092f38?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fGRpbm9zYXVyJTIwcGFydHklMjBjaGlsZHJlbnxlbnwwfDB8MHx8fDA%3D",
    rating: 4.8,
    reviewCount: 145,
    bookingCount: 89,
    location: "London & Surrounding Areas",
    priceFrom: 140,
    priceUnit: "per hour",
    description: "Interactive dinosaur show with fossils, facts, and prehistoric adventures",
    badges: ["Educational Content", "Real Fossils", "Interactive"],
    availability: "Available weekdays and weekends",
  },
  {
    id: "jurassic-adventure",
    name: "Jurassic Adventure Experience",
    category: "Entertainment",
    subcategory: "Adventure Shows",
    themes: ["dinosaur", "jurassic", "adventure", "prehistoric"],
    image: "https://images.unsplash.com/photo-1712677673681-7768f31c3974?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8anVyYXNzaWMlMjBwYXJrfGVufDB8MHwwfHx8MA%3D%3D",
    rating: 4.7,
    reviewCount: 198,
    bookingCount: 156,
    location: "Greater London",
    priceFrom: 160,
    priceUnit: "per 1.5 hours",
    description: "Thrilling dinosaur adventure with costumes, games, and paleontologist activities",
    badges: ["Costume Included", "Adventure Games"],
    availability: "Available most weekends",
  },

  // === UNICORN THEMED ===
  {
    id: "magical-unicorn-party",
    name: "Magical Unicorn Fantasy Show",
    category: "Entertainment",
    subcategory: "Fantasy Shows",
    themes: ["unicorn", "magic", "rainbow", "fantasy"],
    image: "https://images.unsplash.com/photo-1607653150149-526b2744ca60?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dW5pY29ybiUyMHBhcnR5fGVufDB8MHwwfHx8MA%3D%3D",
    rating: 4.9,
    reviewCount: 234,
    bookingCount: 178,
    location: "London Wide",
    priceFrom: 165,
    priceUnit: "per hour",
    description: "Enchanting unicorn show with rainbow magic, sparkles, and unicorn character",
    badges: ["Magical Effects", "Unicorn Costume", "Interactive"],
    availability: "Book 1 week ahead",
  },
  {
    id: "rainbow-unicorn-magic",
    name: "Rainbow Unicorn Magic Workshop",
    category: "Entertainment",
    subcategory: "Magic Shows",
    themes: ["unicorn", "rainbow", "magic", "crafts"],
    image: "https://images.unsplash.com/photo-1538577270539-a358155d66b8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHVuaWNvcm4lMjBwYXJ0eXxlbnwwfDB8MHx8fDA%3D",
    rating: 4.8,
    reviewCount: 156,
    bookingCount: 123,
    location: "UK Wide",
    priceFrom: 145,
    priceUnit: "per 1.5 hours",
    description: "Magical unicorn workshop with rainbow crafts, glitter, and unicorn magic tricks",
    badges: ["Crafts Included", "Take-Home Items"],
    availability: "Available most days",
  },

  // === SCIENCE THEMED ===
  {
    id: "mad-scientist-show",
    name: "Mad Scientist Laboratory Show",
    category: "Entertainment",
    subcategory: "Science Shows",
    themes: ["science", "laboratory", "experiments", "educational"],
    image: "https://plus.unsplash.com/premium_photo-1663100782154-0f89208bf732?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fG1hZCUyMHNjaWVudGlzdCUyMHNob3d8ZW58MHwwfDB8fHww",
    rating: 4.9,
    reviewCount: 167,
    bookingCount: 134,
    location: "London & Home Counties",
    priceFrom: 175,
    priceUnit: "per hour",
    description: "Explosive science show with safe experiments, slime making, and laboratory fun",
    badges: ["Safe Experiments", "Educational", "Hands-On"],
    availability: "Available weekends",
  },
  {
    id: "chemistry-kids-lab",
    name: "Chemistry Kids Mobile Lab",
    category: "Entertainment",
    subcategory: "Educational Shows",
    themes: ["science", "chemistry", "experiments", "stem"],
    image: "https://plus.unsplash.com/premium_photo-1664298632492-c8be02c3db5c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fGNoZW1pb3N0cnklMjBsYWIlMjBraWRzfGVufDB8MHwwfHx8MA%3D%3D",
    rating: 4.8,
    reviewCount: 189,
    bookingCount: 145,
    location: "Greater London",
    priceFrom: 160,
    priceUnit: "per 1.5 hours",
    description: "Mobile chemistry lab with safe experiments, volcano eruptions, and STEM learning",
    badges: ["Mobile Lab", "STEM Focused", "Age Appropriate"],
    availability: "Book 2 weeks ahead",
  },

  // === EXISTING GENERIC SUPPLIERS (keep some for fallback) ===
 

 

 
  {
    id: "party-photographer",
    name: "Little Heroes Photography",
    category: "Photography",
    subcategory: "Party Photographers",
    themes: ["general", "professional", "memories"],
    image: "https://images.unsplash.com/photo-1576977756135-551a320dbd91?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHBhcnR5JTIwcGhvdG9ncm9waGVyfGVufDB8fDB8fHww",
    rating: 4.9,
    reviewCount: 54,
    bookingCount: 43,
    location: "London & Home Counties",
    priceFrom: 180,
    priceUnit: "per 2 hours",
    description: "Professional party photography with instant prints",
    badges: ["Digital Gallery", "Same Day Edits"],
    availability: "2 bookings available this month",
  },
  {
    id: "bouncy-castle",
    name: "Super Bounce Castle Hire",
    category: "Activities",
    subcategory: "Bouncy Castles",
    themes: ["general", "active", "outdoor"],
    image: "https://images.unsplash.com/photo-1663797184266-20c14bfee71a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym91bmN5JTIwY2FzdGxlfGVufDB8fDB8fHww",
    rating: 4.7,
    reviewCount: 198,
    bookingCount: 234,
    location: "Greater London",
    priceFrom: 95,
    priceUnit: "per day",
    description: "Themed bouncy castle with safety mats",
    badges: ["Safety Certified", "Free Delivery"],
    availability: "Available weekends",
  },
  {
    id: "face-painting",
    name: "Face Painting Artists",
    category: "Face Painting",
    subcategory: "Face Painting",
    themes: ["general", "artistic", "creative"],
    image: "https://plus.unsplash.com/premium_photo-1664298802117-6e125c5093a2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmFjZSUyMHBhaW50aW5nfGVufDB8fDB8fHww",
    rating: 4.9,
    reviewCount: 127,
    bookingCount: 89,
    location: "London Wide",
    priceFrom: 150,
    priceUnit: "per 2 hours",
    description: "Professional themed face painting for all children",
    badges: ["DBS Checked", "Highly Rated"],
    availability: "Available this weekend",
  },
  {
    id: "budget-venue",
    name: "Community Hall Party Space",
    category: "Venues", 
    subcategory: "Community Halls",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749482037/rosario-fernandes-Nnb1f3KBqnU-unsplash_pulk59.jpg",
    rating: 4.3,
    reviewCount: 78,
    bookingCount: 123,
    location: "North London", 
    priceFrom: 80,
    priceUnit: "per 3 hours",
    description: "Affordable community space perfect for children's parties",
    badges: ["Parking Available", "Kitchen Access"],
    availability: "Most weekends available",
  },
  {
    id: "adventure-center",
    name: "Adventure Play Centre",
    category: "Venues",
    subcategory: "Play Centers",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749482037/rosario-fernandes-Nnb1f3KBqnU-unsplash_pulk59.jpg",
    rating: 4.7,
    reviewCount: 203,
    bookingCount: 156,
    location: "Central London",
    priceFrom: 200, // Reduced from 700 to make it more accessible
    priceUnit: "per 2 hours",
    description: "Indoor playground perfect for superhero themed parties",
    badges: ["Parking Available", "Wheelchair Accessible"],
    availability: "3 slots available today",
  },
  {
    id: "premium-venue",
    name: "Luxury Party Venue",
    category: "Venues",
    subcategory: "Premium Venues",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749482037/rosario-fernandes-Nnb1f3KBqnU-unsplash_pulk59.jpg",
    rating: 4.9,
    reviewCount: 85,
    bookingCount: 45,
    location: "Central London",
    priceFrom: 350,
    priceUnit: "per 3 hours",
    description: "Premium party venue with full service and decorations included",
    badges: ["Full Service", "Decorations Included", "Catering Kitchen"],
    availability: "Limited availability",
  },
  {
    id: "budget-entertainment",
    name: "Party Games Coordinator", 
    category: "Entertainment",
    subcategory: "Games",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460635/edson-junior-YlgnX_ISPLo-unsplash_wlsz60.jpg",
    rating: 4.2,
    reviewCount: 45,
    bookingCount: 67,
    location: "London Wide",
    priceFrom: 80,
    priceUnit: "per 2 hours", 
    description: "Fun party games and activities coordinator for kids",
    badges: ["Interactive Games", "Age Appropriate"],
    availability: "Available most weekends",
  },
  {
    id: "character-visit",
    name: "Amazing Superhero Characters",
    category: "Entertainment",
    subcategory: "Character Visits",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749482223/ChatGPT_Image_Jun_9_2025_04_16_54_PM_qshvx8.png",
    rating: 4.8,
    reviewCount: 167,
    bookingCount: 145,
    location: "London Wide",
    priceFrom: 180,
    priceUnit: "per hour",
    description: "Professional superhero character appearances and meet & greets",
    badges: ["Authentic Costumes", "Interactive Shows"],
    availability: "Book 2 weeks ahead",
  },
  {
    id: "premium-entertainment",
    name: "Deluxe Magic & Character Show",
    category: "Entertainment", 
    subcategory: "Premium Shows",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460635/edson-junior-YlgnX_ISPLo-unsplash_wlsz60.jpg",
    rating: 5.0,
    reviewCount: 89,
    bookingCount: 34,
    location: "London & Surrounding Areas",
    priceFrom: 300,
    priceUnit: "per show",
    description: "Premium magic show with multiple characters and interactive experiences", 
    badges: ["DBS Checked", "Premium Package", "Multiple Characters"],
    availability: "Book 3 weeks ahead",
  },
  {
    id: "budget-catering",
    name: "Simple Party Food Package",
    category: "Catering",
    subcategory: "Basic Packages", 
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749482064/phil-hearing-sdVA2f8rTiw-unsplash_ydqz9d.jpg",
    rating: 4.1,
    reviewCount: 56,
    bookingCount: 89,
    location: "UK Wide Delivery",
    priceFrom: 25,
    priceUnit: "per child",
    description: "Basic party food package with sandwiches and snacks",
    badges: ["Simple Setup", "Budget Friendly"],
    availability: "Available daily",
  },
  {
    id: "superhero-cakes",
    name: "Superhero Celebration Cakes",
    category: "Catering",
    subcategory: "Birthday Cakes",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749482064/phil-hearing-sdVA2f8rTiw-unsplash_ydqz9d.jpg",
    rating: 4.8,
    reviewCount: 89,
    bookingCount: 67,
    location: "UK Wide Delivery",
    priceFrom: 60,
    priceUnit: "per cake",
    description: "Custom superhero themed birthday cakes",
    badges: ["Allergen Free Options", "Same Day Delivery"],
    availability: "Order by 2pm for next day",
  },
  {
    id: "premium-catering",
    name: "Gourmet Kids Party Catering",
    category: "Catering",
    subcategory: "Premium Catering",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749482064/phil-hearing-sdVA2f8rTiw-unsplash_ydqz9d.jpg",
    rating: 4.9,
    reviewCount: 67,
    bookingCount: 34,
    location: "London Wide",
    priceFrom: 120,
    priceUnit: "per child",
    description: "Premium catering with gourmet kids menu and custom cake",
    badges: ["Gourmet Menu", "Custom Cake", "Full Service"],
    availability: "Book 1 week ahead",
  },
  {
    id: "balloon-magic",
    name: "Balloon Magic Decorations",
    category: "Decorations",
    subcategory: "Balloon Displays",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749482096/helena-lopes-tdKwqYuawZQ-unsplash_1_mmmoku.jpg",
    rating: 4.6,
    reviewCount: 145,
    bookingCount: 98,
    location: "South London",
    priceFrom: 85,
    priceUnit: "per setup",
    description: "Stunning superhero balloon arches and displays",
    badges: ["Setup Included", "Eco-Friendly"],
    availability: "Available next week",
  },
  {
    id: "hero-bags",
    name: "Hero Party Bags",
    category: "Party Bags",
    subcategory: "Themed Bags",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749482131/daniel-alvasd-QJlg2KSl0fU-unsplash_vm4acf.jpg",
    rating: 4.5,
    reviewCount: 76,
    bookingCount: 123,
    location: "UK Wide",
    priceFrom: 4.5,
    priceUnit: "per bag",
    description: "Superhero themed party bags with toys and treats",
    badges: ["Age Appropriate", "Bulk Discounts"],
    availability: "In stock - ships today",
  },
  {
    id: "party-photographer",
    name: "Little Heroes Photography",
    category: "Photography",
    subcategory: "Party Photographers",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473689/iStock-1369813086_osxnjy.jpg",
    rating: 4.9,
    reviewCount: 54,
    bookingCount: 43,
    location: "London & Home Counties",
    priceFrom: 180,
    priceUnit: "per 2 hours",
    description: "Professional party photography with instant prints",
    badges: ["Digital Gallery", "Same Day Edits"],
    availability: "2 bookings available this month",
  },
  {
    id: "bouncy-castle",
    name: "Super Bounce Castle Hire",
    category: "Activities",
    subcategory: "Bouncy Castles",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594952/bouncy-castle_gaq0z4.png",
    rating: 4.7,
    reviewCount: 198,
    bookingCount: 234,
    location: "Greater London",
    priceFrom: 95,
    priceUnit: "per day",
    description: "Superhero themed bouncy castle with safety mats",
    badges: ["Safety Certified", "Free Delivery"],
    availability: "Available weekends",
  },
  {
    id: "face-painting",
    name: "Face Painting Artists",
    category: "Face Painting",
    subcategory: "Face Painting",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594938/face-painter_kdiqia.png",
    rating: 4.9,
    reviewCount: 127,
    bookingCount: 89,
    location: "London Wide",
    priceFrom: 150,
    priceUnit: "per 2 hours",
    description: "Professional superhero face painting for all children",
    badges: ["DBS Checked", "Highly Rated"],
    availability: "Available this weekend",
  },
  
  // Balloon Artist
  {
    id: "balloon-artist",
    name: "Balloon Sculpture Artists",
    category: "Entertainment",
    subcategory: "Balloon Art",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749476395/iStock-1716501930_vlyarc.jpg",
    rating: 4.8,
    reviewCount: 89,
    bookingCount: 67,
    location: "London & Surrounding Areas",
    priceFrom: 120,
    priceUnit: "per 1.5 hours",
    description: "Amazing balloon sculptures and superhero creations",
    badges: ["Interactive Entertainment", "Age Appropriate"],
    availability: "Available most weekends",
  },
  
  // Photo Booth
  {
    id: "photo-booth",
    name: "Superhero Photo Booth",
    category: "Photography",
    subcategory: "Photo Booth",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749476535/iStock-1186660222_uhbwam.jpg",
    rating: 4.9,
    reviewCount: 156,
    bookingCount: 78,
    location: "Greater London",
    priceFrom: 200,
    priceUnit: "per 3 hours",
    description: "Superhero-themed photo booth with props and instant prints",
    badges: ["Props Included", "Instant Prints"],
    availability: "Limited availability",
  },
  
  // Candy Cart
  {
    id: "candy-cart",
    name: "Vintage Candy Cart",
    category: "Catering",
    subcategory: "Specialty Treats",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749476912/aronskaya-KeURaM_9W9c-unsplash_vq2vwe.jpg",
    rating: 4.7,
    reviewCount: 203,
    bookingCount: 145,
    location: "London Wide",
    priceFrom: 180,
    priceUnit: "per event",
    description: "Vintage candy cart with superhero-themed treats",
    badges: ["Themed Treats", "Victorian Style"],
    availability: "Available next week",
  },
  
  // Magic Show (Additional)
  {
    id: "magic-show-premium",
    name: "Premium Magic & Illusion Show",
    category: "Entertainment",
    subcategory: "Magic Shows",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460635/edson-junior-YlgnX_ISPLo-unsplash_wlsz60.jpg",
    rating: 4.9,
    reviewCount: 98,
    bookingCount: 45,
    location: "London & Home Counties",
    priceFrom: 175,
    priceUnit: "per 45 minutes",
    description: "Interactive superhero magic show with audience participation",
    badges: ["Highly Rated", "Interactive Show"],
    availability: "Book 2 weeks ahead",
  },
  
  // DJ Services
  {
    id: "dj-services",
    name: "Kids Party DJ & Music",
    category: "Entertainment",
    subcategory: "DJ Services",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749477304/ChatGPT_Image_Jun_9_2025_02_54_56_PM_eoqvmc.png",
    rating: 4.6,
    reviewCount: 134,
    bookingCount: 89,
    location: "London Wide",
    priceFrom: 160,
    priceUnit: "per 3 hours",
    description: "Professional DJ with superhero soundtrack and party games",
    badges: ["Sound System Included", "Interactive Games"],
    availability: "Available most weekends",
  },
  
  // Superhero Training
  {
    id: "superhero-training",
    name: "Superhero Training Academy",
    category: "Activities",
    subcategory: "Training Courses",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749480381/iStock-540366448_ygq4my.jpg",
    rating: 4.7,
    reviewCount: 112,
    bookingCount: 67,
    location: "London & Surrounding Areas",
    priceFrom: 140,
    priceUnit: "per hour",
    description: "Obstacle course and superhero training activities",
    badges: ["Safety Certified", "Age Appropriate"],
    availability: "Available weekends",
  },
  
  // Additional Decorations
  {
    id: "superhero-decorations",
    name: "Complete Superhero Decorations",
    category: "Decorations",
    subcategory: "Theme Packages",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749482096/helena-lopes-tdKwqYuawZQ-unsplash_1_mmmoku.jpg",
    rating: 4.5,
    reviewCount: 87,
    bookingCount: 123,
    location: "UK Wide Delivery",
    priceFrom: 75,
    priceUnit: "per package",
    description: "Complete superhero decoration package with banners, balloons, and table settings",
    badges: ["Setup Included", "Theme Complete"],
    availability: "Available next day",
  },
  {
    id: "super-bounce-castle",
    name: "Super Bounce Castle Hire",
    category: "Activities",
    subcategory: "Bouncy Castles",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594952/bouncy-castle_gaq0z4.png",
    rating: 4.7,
    reviewCount: 198,
    bookingCount: 234,
    location: "Greater London",
    priceFrom: 95,
    priceUnit: "per day",
    description: "Superhero themed bouncy castle with safety mats and supervision",
    badges: ["Safety Certified", "Free Delivery"],
    availability: "Available weekends",
  },
  
  {
    id: "premium-bouncy-fun",
    name: "Premium Bouncy Fun",
    category: "Activities",
    subcategory: "Bouncy Castles",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594952/bouncy-castle_gaq0z4.png",
    rating: 4.9,
    reviewCount: 156,
    bookingCount: 89,
    location: "London Wide",
    priceFrom: 150,
    priceUnit: "per day",
    description: "Large superhero bouncy castle with slide and obstacle course",
    badges: ["Premium Quality", "Highly Rated", "Setup Included"],
    availability: "Available most days",
  },
  
  {
    id: "budget-bounce-hire",
    name: "Budget Bounce Hire",
    category: "Activities",
    subcategory: "Bouncy Castles",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594952/bouncy-castle_gaq0z4.png",
    rating: 4.3,
    reviewCount: 87,
    bookingCount: 145,
    location: "South London",
    priceFrom: 75,
    priceUnit: "per day",
    description: "Affordable bouncy castle hire with basic superhero theme",
    badges: ["Budget Friendly", "Local Delivery"],
    availability: "Good availability",
  },
  
  // Soft Play Suppliers
  {
    id: "adventure-soft-play",
    name: "Adventure Soft Play Hire",
    category: "Activities",
    subcategory: "Soft Play",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749480381/iStock-540366448_ygq4my.jpg",
    rating: 4.8,
    reviewCount: 134,
    bookingCount: 78,
    location: "London & Home Counties",
    priceFrom: 120,
    priceUnit: "per day",
    description: "Complete soft play equipment hire with superhero themed mats and obstacles",
    badges: ["Safety Certified", "Age Appropriate", "Setup Included"],
    availability: "Available weekdays and weekends",
  },
  
  {
    id: "little-heroes-soft-play",
    name: "Little Heroes Soft Play",
    category: "Activities",
    subcategory: "Soft Play",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749480381/iStock-540366448_ygq4my.jpg",
    rating: 4.6,
    reviewCount: 92,
    bookingCount: 67,
    location: "North London",
    priceFrom: 100,
    priceUnit: "per day",
    description: "Superhero themed soft play equipment perfect for indoor parties",
    badges: ["Indoor Suitable", "Easy Setup"],
    availability: "Available most weekends",
  },
  
  // Combined Activity Suppliers
  {
    id: "mega-party-activities",
    name: "Mega Party Activities",
    category: "Activities",
    subcategory: "Activity Packages",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749480381/iStock-540366448_ygq4my.jpg",
    rating: 4.9,
    reviewCount: 167,
    bookingCount: 89,
    location: "London Wide",
    priceFrom: 200,
    priceUnit: "per day",
    description: "Complete activity package with bouncy castle, soft play, and superhero training course",
    badges: ["Highly Rated", "Complete Package", "DBS Checked"],
    availability: "Book 1 week ahead",
  },
  
  {
    id: "superhero-adventure-zone",
    name: "Superhero Adventure Zone",
    category: "Activities",
    subcategory: "Obstacle Courses",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749480381/iStock-540366448_ygq4my.jpg",
    rating: 4.7,
    reviewCount: 112,
    bookingCount: 56,
    location: "Greater London",
    priceFrom: 175,
    priceUnit: "per day",
    description: "Superhero themed obstacle course and training zone for active parties",
    badges: ["Physical Activity", "Team Building", "Age 4-12"],
    availability: "Available weekends",
  }
];

// Function to add a new supplier from onboarding form
const addSupplierFromOnboarding = (formData) => {

  const getThemesFromServiceType = (serviceType) => {
    const themeMapping = {
      'magician': ['magic', 'superhero', 'general'],
      'clown': ['circus', 'comedy', 'general'],
      'entertainer': ['general', 'superhero', 'princess'],
      'dj': ['music', 'dance', 'general'],
      'musician': ['music', 'taylor-swift', 'general'],
      'face-painting': ['general', 'superhero', 'princess'],
      'decorations': ['general'],
      'venue': ['general'],
      'catering': ['general']
    };
    
    return themeMapping[serviceType] || ['general'];
  };
  const newSupplier = {
    id: `supplier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: formData.businessName,
    owner: {
      name: formData.yourName, // From the onboarding form
      email: formData.email,
      phone: formData.phone
    },
    category: formData.supplierType, // Default until they complete profile
    subcategory: formData.supplierType,
    image: "/placeholder.svg?height=300&width=400&text=" + encodeURIComponent(formData.businessName),
    rating: 0, // New supplier, no rating yet
    reviewCount: 0,
    bookingCount: 0,
    location: formData.postcode || "Location TBD",
    priceFrom: 0, // They haven't set packages yet
    priceUnit: "per event",
    description: "New supplier - profile setup in progress",
    badges: ["New Provider"],
    availability: "Contact for availability",
    themes: getThemesFromServiceType(formData.supplierType), // Add this
  serviceType: formData.supplierType,
    businessDescription: "",
    serviceType: formData.supplierType,
    packages: [],
    portfolioImages: formData.portfolioImages || [],  // ✅ CORRECT
  portfolioVideos: formData.portfolioVideos || [],  // ✅ CORRECT
    isComplete: false, // They still need to complete their profile
    createdAt: new Date().toISOString(),
    workingHours: {
      Monday: { active: true, start: "09:00", end: "17:00" },
      Tuesday: { active: true, start: "09:00", end: "17:00" },
      Wednesday: { active: true, start: "09:00", end: "17:00" },
      Thursday: { active: true, start: "09:00", end: "17:00" },
      Friday: { active: true, start: "09:00", end: "17:00" },
      Saturday: { active: true, start: "10:00", end: "16:00" },
      Sunday: { active: false, start: "10:00", end: "16:00" },
    },
    unavailableDates: [],
    busyDates: [],
    availabilityNotes: "",
    advanceBookingDays: 7,
    maxBookingDays: 365,
  };

  return newSupplier;
};

// Save to localStorage
const saveSuppliers = (suppliers) => {
  try {
    localStorage.setItem('allSuppliers', JSON.stringify(suppliers));
    return true;
  } catch (error) {
    console.error('Error saving suppliers:', error);
    return false;
  }
};

// Get all suppliers from localStorage, or return mock data
const getAllSuppliers = () => {
  try {
    const stored = localStorage.getItem('allSuppliers');
    if (stored) {
      return JSON.parse(stored);
    }
    return mockSuppliers;
  } catch (error) {
    console.error('Error loading suppliers:', error);
    return mockSuppliers;
  }
};



// Hook for the dashboard to manage the current supplier
export function useSupplierDashboard() {
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  

  // Load the current supplier when component mounts
  useEffect(() => {
    const loadCurrentSupplier = async () => {
      try {
        setLoading(true);
        
        // Get the supplier ID that was stored during onboarding
        const supplierId = localStorage.getItem('currentSupplierId');
        
        if (supplierId) {
          const supplier = await suppliersAPI.getSupplierById(supplierId);
          if (supplier) {
            setCurrentSupplier(supplier);
            console.log('📥 Loaded current supplier for dashboard:', supplier);
          } else {
            setError('Supplier not found');
          }
        } else {
          setError('No supplier ID found - user may not be signed up');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading current supplier:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentSupplier();
  }, []);

  // Function to update the supplier profile
  const updateProfile = async (profileData, packages = []) => {
    if (!currentSupplier) {
      return { success: false, error: 'No current supplier loaded' };
    }

    setSaving(true);
    setError(null);

    try {
      const result = await suppliersAPI.updateSupplierProfile(currentSupplier.id, profileData, packages);
      
      if (result.success) {
        setCurrentSupplier(result.supplier);
        console.log('🎉 Supplier profile updated successfully!');
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  return {
    currentSupplier,
    loading,
    saving,
    error,
    updateProfile
  };
}

// API functions
export const suppliersAPI = {
  // Get all suppliers
  getAllSuppliers: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return getAllSuppliers();
  },

  getEntertainmentByTheme: async (theme) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const allSuppliers = getAllSuppliers();
      
      // Filter for entertainment suppliers that match the theme
      const entertainmentSuppliers = allSuppliers.filter(supplier => {
        // Check if supplier is entertainment
        const isEntertainment = supplier.category === 'Entertainment' || 
                               supplier.serviceType === 'entertainer' ||
                               supplier.serviceType === 'magician' ||
                               supplier.serviceType === 'clown' ||
                               supplier.serviceType === 'dj' ||
                               supplier.serviceType === 'musician';
        
        if (!isEntertainment) return false;
        
        // Check theme matching
        const matchesTheme = 
          // Direct theme match
          supplier.themes?.includes(theme) ||
          supplier.serviceType === theme ||
          // Name/description contains theme keywords
          supplier.name.toLowerCase().includes(theme.toLowerCase()) ||
          supplier.description?.toLowerCase().includes(theme.toLowerCase()) ||
          // Handle specific theme mappings
          (theme === 'spiderman' && (
            supplier.themes?.includes('superhero') ||
            supplier.name.toLowerCase().includes('spider') ||
            supplier.name.toLowerCase().includes('superhero')
          )) ||
          (theme === 'princess' && (
            supplier.themes?.includes('princess') ||
            supplier.themes?.includes('fairy') ||
            supplier.name.toLowerCase().includes('princess')
          )) ||
          (theme === 'taylor-swift' && (
            supplier.serviceType === 'musician' ||
            supplier.serviceType === 'dj' ||
            supplier.themes?.includes('music')
          ));
          (theme === 'pokemon' && (
            supplier.serviceType === 'pokemon' ||
            supplier.serviceType === 'pokemon' ||
            supplier.themes?.includes('pokemon')
          ));
        
        return matchesTheme;
      });
      
      console.log(`🎭 Found ${entertainmentSuppliers.length} entertainment suppliers for theme: ${theme}`);
      return entertainmentSuppliers;
      
    } catch (error) {
      console.error('Error getting entertainment by theme:', error);
      return [];
    }
  },

  getVenuesByTheme: async (theme) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const allSuppliers = getAllSuppliers();
      
      const venueSuppliers = allSuppliers.filter(supplier => {
        const isVenue = supplier.category === 'Venues' || 
                       supplier.serviceType === 'venue';
        
        if (!isVenue) return false;
        
        const matchesTheme = supplier.themes?.includes(theme) ||
                           supplier.name.toLowerCase().includes(theme.toLowerCase()) ||
                           supplier.description?.toLowerCase().includes(theme.toLowerCase());
        
        return matchesTheme;
      });
      
      console.log(`🏢 Found ${venueSuppliers.length} venues for theme: ${theme}`);
      return venueSuppliers;
      
    } catch (error) {
      console.error('Error getting venues by theme:', error);
      return [];
    }
  },

  getCateringByTheme: async (theme) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const allSuppliers = getAllSuppliers();
      
      const cateringSuppliers = allSuppliers.filter(supplier => {
        const isCatering = supplier.category === 'Catering' || 
                          supplier.serviceType === 'catering';
        
        if (!isCatering) return false;
        
        const matchesTheme = supplier.themes?.includes(theme) ||
                           supplier.name.toLowerCase().includes(theme.toLowerCase()) ||
                           supplier.description?.toLowerCase().includes(theme.toLowerCase());
        
        return matchesTheme;
      });
      
      console.log(`🍰 Found ${cateringSuppliers.length} catering suppliers for theme: ${theme}`);
      return cateringSuppliers;
      
    } catch (error) {
      console.error('Error getting catering by theme:', error);
      return [];
    }
  },


updateSupplierProfile: async (supplierId, updatedData, packages = []) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    const allSuppliers = getAllSuppliers();
    const supplierIndex = allSuppliers.findIndex(s => s.id === supplierId);
    
    if (supplierIndex === -1) {
      return { success: false, error: 'Supplier not found' };
    }

    // Update the supplier with new data
    const updatedSupplier = {
      ...allSuppliers[supplierIndex],
      name: updatedData.businessName,
      description: updatedData.businessDescription || "Professional service provider",
      location: updatedData.postcode || allSuppliers[supplierIndex].location,
      serviceType: updatedData.serviceType,
      packages: packages,

      portfolioImages: updatedData.portfolioImages || allSuppliers[supplierIndex].portfolioImages || [],
      portfolioVideos: updatedData.portfolioVideos || allSuppliers[supplierIndex].portfolioVideos || [],

      serviceDetails: updatedData.serviceDetails || allSuppliers[supplierIndex].serviceDetails,

      coverPhoto: updatedData.coverPhoto || allSuppliers[supplierIndex].coverPhoto,
      image: updatedData.coverPhoto || allSuppliers[supplierIndex].image,

      workingHours: updatedData.workingHours || allSuppliers[supplierIndex].workingHours,
      unavailableDates: updatedData.unavailableDates || allSuppliers[supplierIndex].unavailableDates || [],
      busyDates: updatedData.busyDates || allSuppliers[supplierIndex].busyDates || [],
      availabilityNotes: updatedData.availabilityNotes || allSuppliers[supplierIndex].availabilityNotes || "",
      advanceBookingDays: updatedData.advanceBookingDays || allSuppliers[supplierIndex].advanceBookingDays || 7,
      maxBookingDays: updatedData.maxBookingDays || allSuppliers[supplierIndex].maxBookingDays || 365,
      
      // Update pricing based on packages
      priceFrom: packages.length > 0 ? Math.min(...packages.map(p => p.price)) : 0,
      priceUnit: packages.length > 0 && packages[0]?.priceType === 'hourly' ? 'per hour' : 'per event',
      
      // Update completion status
      isComplete: packages.length > 0 && updatedData.businessDescription, // Complete if they have packages and description
      
      // Update badges
      badges: [
        ...(packages.length > 0 ? ['Packages Available'] : ['New Provider']),
        ...(allSuppliers[supplierIndex].badges || []).filter(b => !['New Provider', 'Packages Available'].includes(b))
      ],
      
      // Update the owner info too
      owner: {
        ...allSuppliers[supplierIndex].owner,
        name: updatedData.contactName || allSuppliers[supplierIndex].owner.name,
        email: updatedData.email || allSuppliers[supplierIndex].owner.email,
        phone: updatedData.phone || allSuppliers[supplierIndex].owner.phone
      }
    };

    allSuppliers[supplierIndex] = updatedSupplier;
    const success = saveSuppliers(allSuppliers);
    
    if (success) {
      console.log('✅ Supplier profile updated:', updatedSupplier);
      return { success: true, supplier: updatedSupplier };
    } else {
      return { success: false, error: 'Failed to save updates' };
    }
  } catch (error) {
    console.error('Error updating supplier:', error);
    return { success: false, error: error.message };
  }
},


  // Add new supplier from onboarding
  addSupplierFromOnboarding: async (formData) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    try {
      const currentSuppliers = getAllSuppliers();
      const newSupplier = addSupplierFromOnboarding(formData);
      
      const updatedSuppliers = [...currentSuppliers, newSupplier];
      const success = saveSuppliers(updatedSuppliers);
      
      if (success) {
        console.log('✅ New supplier added:', newSupplier);
        return { success: true, supplier: newSupplier };
      } else {
        return { success: false, error: 'Failed to save supplier' };
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      return { success: false, error: error.message };
    }
  },

  // Get supplier by ID
  getSupplierById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const allSuppliers = getAllSuppliers();
    return allSuppliers.find(supplier => supplier.id === id) || null;
  },

  // Check if user owns a supplier (for redirecting to dashboard)
  getSupplierByOwnerEmail: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const allSuppliers = getAllSuppliers();
    return allSuppliers.find(supplier => supplier.owner.email === email) || null;
  }
};

// Hook for adding supplier from onboarding
export function useSupplierOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addSupplier = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await suppliersAPI.addSupplierFromOnboarding(formData);
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addSupplier
  };
}

// Your existing hooks stay the same
import { useState, useEffect } from 'react';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await suppliersAPI.getAllSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    refetch: loadSuppliers
  };
}

export function useSupplier(supplierId) {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSupplier = async () => {
    if (!supplierId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await suppliersAPI.getSupplierById(supplierId);
      setSupplier(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading supplier:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupplier();
  }, [supplierId]);

  return {
    supplier,
    loading,
    error,
    refetch: loadSupplier
  };
}
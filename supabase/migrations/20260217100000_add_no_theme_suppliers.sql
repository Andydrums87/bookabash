-- Migration: Add No-Theme Suppliers
-- These suppliers cater to parties without a specific theme
-- Users pick colour schemes via packages instead of separate suppliers

-- ============================================
-- 1. ENTERTAINMENT - General Party Entertainer
-- ============================================
INSERT INTO suppliers (
  id,
  business_name,
  business_slug,
  business_type,
  is_active,
  profile_status,
  can_go_live,
  profile_completion_percentage,
  data
) VALUES (
  gen_random_uuid(),
  'Classic Party Entertainment',
  'classic-party-entertainment',
  'primary',
  true,
  'live',
  true,
  100,
  '{
    "name": "Classic Party Entertainment",
    "businessDescription": "Professional children''s entertainment perfect for any party! Our entertainers bring games, music, dancing, and loads of fun activities that work brilliantly without needing a specific theme. We focus on classic party games, disco dancing, balloon modelling, and interactive entertainment that every child loves.",
    "category": "Entertainment",
    "subcategory": "General Entertainment",
    "location": "London",
    "priceFrom": 180,
    "priceUnit": "per event",
    "rating": 4.9,
    "reviewCount": 156,
    "themes": ["no-theme", "general", "classic"],
    "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460635/edson-junior-YlgnX_ISPLo-unsplash_wlsz60.jpg",
    "coverPhoto": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460635/edson-junior-YlgnX_ISPLo-unsplash_wlsz60.jpg",
    "verified": true,
    "fastResponder": true,
    "responseTime": "Within 2 hours",
    "advanceBookingDays": 3,
    "badges": ["Verified", "Top Rated", "Fast Responder"],
    "serviceDetails": {
      "entertainmentType": "General Party Entertainment",
      "ageRange": {"min": 3, "max": 12},
      "maxChildren": 30,
      "activities": ["Party Games", "Dancing", "Balloon Modelling", "Musical Games", "Parachute Games", "Pass the Parcel"],
      "equipmentProvided": ["Music System", "Props", "Prizes", "Parachute"],
      "themes": ["no-theme", "general", "classic"]
    },
    "packages": [
      {
        "id": "classic-1hr",
        "name": "Classic Party - 1 Hour",
        "price": 180,
        "duration": 60,
        "description": "Perfect for shorter parties - includes games, music and balloon modelling",
        "includes": ["Party Games", "Music & Dancing", "Balloon Modelling", "Small Prizes"]
      },
      {
        "id": "classic-2hr",
        "name": "Classic Party - 2 Hours",
        "price": 280,
        "duration": 120,
        "description": "Our most popular package with a full range of activities",
        "includes": ["Party Games", "Music & Dancing", "Balloon Modelling", "Parachute Games", "Pass the Parcel", "Prizes for Everyone"]
      }
    ]
  }'::jsonb
);

-- ============================================
-- 2. CAKES - Classic Cakes with Colour Options
-- ============================================
INSERT INTO suppliers (
  id,
  business_name,
  business_slug,
  business_type,
  is_active,
  profile_status,
  can_go_live,
  profile_completion_percentage,
  data
) VALUES (
  gen_random_uuid(),
  'Classic Celebration Cakes',
  'classic-celebration-cakes',
  'primary',
  true,
  'live',
  true,
  100,
  '{
    "name": "Classic Celebration Cakes",
    "businessDescription": "Beautiful birthday cakes in your choice of colour scheme! No theme needed - just pick your favourite colours and we''ll create a stunning cake. Choose from blue, pink, rainbow, pastel, or elegant gold & white designs.",
    "category": "Cakes",
    "subcategory": "Birthday Cakes",
    "location": "London",
    "priceFrom": 45,
    "priceUnit": "per cake",
    "rating": 4.9,
    "reviewCount": 203,
    "themes": ["no-theme", "general", "classic"],
    "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753224729/hpvtz7jiktglaxcivftv.jpg",
    "coverPhoto": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753224729/hpvtz7jiktglaxcivftv.jpg",
    "verified": true,
    "fastResponder": true,
    "responseTime": "Within 4 hours",
    "advanceBookingDays": 5,
    "badges": ["Verified", "Top Rated"],
    "serviceDetails": {
      "cakeType": "Classic Birthday Cake",
      "flavours": ["Vanilla", "Chocolate", "Red Velvet", "Lemon", "Strawberry", "Funfetti"],
      "dietaryOptions": ["Gluten-Free Available", "Egg-Free Available", "Vegan Available"],
      "servingSizes": ["10 portions", "20 portions", "30 portions"],
      "colourOptions": ["Blue", "Pink", "Rainbow", "Pastel", "Gold & White"],
      "themes": ["no-theme", "general", "classic"],
      "fulfilment": {
        "offersDelivery": true,
        "deliveryFee": 15,
        "offersCollection": true
      }
    },
    "packages": [
      {
        "id": "blue-cake-small",
        "name": "Blue Dreams - 10 portions",
        "price": 45,
        "servings": 10,
        "colourScheme": "blue",
        "description": "Classic cake with blue buttercream, silver accents and sprinkles",
        "includes": ["Blue buttercream icing", "Silver sprinkles", "Number candle", "Happy Birthday message"]
      },
      {
        "id": "blue-cake-medium",
        "name": "Blue Dreams - 20 portions",
        "price": 65,
        "servings": 20,
        "colourScheme": "blue",
        "description": "Beautiful blue cake perfect for parties",
        "includes": ["Blue buttercream icing", "Silver decorations", "Number candle", "Personalised message"]
      },
      {
        "id": "pink-cake-small",
        "name": "Pretty in Pink - 10 portions",
        "price": 45,
        "servings": 10,
        "colourScheme": "pink",
        "description": "Gorgeous pink cake with rose gold accents and edible flowers",
        "includes": ["Pink buttercream icing", "Edible flowers", "Number candle", "Happy Birthday message"]
      },
      {
        "id": "pink-cake-medium",
        "name": "Pretty in Pink - 20 portions",
        "price": 65,
        "servings": 20,
        "colourScheme": "pink",
        "description": "Stunning pink cake with beautiful rose decorations",
        "includes": ["Pink buttercream icing", "Rose gold decorations", "Number candle", "Personalised message"]
      },
      {
        "id": "rainbow-cake-small",
        "name": "Rainbow Celebration - 10 portions",
        "price": 48,
        "servings": 10,
        "colourScheme": "rainbow",
        "description": "Vibrant rainbow cake with multicolour layers inside",
        "includes": ["Rainbow buttercream", "Colourful sprinkles", "Number candle", "Happy Birthday message"]
      },
      {
        "id": "rainbow-cake-medium",
        "name": "Rainbow Celebration - 20 portions",
        "price": 70,
        "servings": 20,
        "colourScheme": "rainbow",
        "description": "Spectacular rainbow cake with layers of colour",
        "includes": ["Rainbow buttercream layers", "Premium sprinkles", "Number candle", "Personalised message"]
      },
      {
        "id": "pastel-cake-small",
        "name": "Pastel Paradise - 10 portions",
        "price": 48,
        "servings": 10,
        "colourScheme": "pastel",
        "description": "Soft pastel colours for an elegant look",
        "includes": ["Pastel buttercream", "Delicate decorations", "Number candle", "Happy Birthday message"]
      },
      {
        "id": "pastel-cake-medium",
        "name": "Pastel Paradise - 20 portions",
        "price": 70,
        "servings": 20,
        "colourScheme": "pastel",
        "description": "Beautiful pastel cake with soft tones",
        "includes": ["Pastel buttercream layers", "Elegant decorations", "Number candle", "Personalised message"]
      },
      {
        "id": "gold-cake-small",
        "name": "Gold & White Elegance - 10 portions",
        "price": 52,
        "servings": 10,
        "colourScheme": "gold",
        "description": "Sophisticated white cake with gold accents",
        "includes": ["White buttercream", "Gold leaf accents", "Number candle", "Happy Birthday message"]
      },
      {
        "id": "gold-cake-medium",
        "name": "Gold & White Elegance - 20 portions",
        "price": 75,
        "servings": 20,
        "colourScheme": "gold",
        "description": "Elegant white and gold celebration cake",
        "includes": ["White buttercream", "Premium gold decorations", "Number candle", "Personalised message"]
      }
    ]
  }'::jsonb
);

-- ============================================
-- 3. PARTY BAGS - Classic with Colour Options
-- ============================================
INSERT INTO suppliers (
  id,
  business_name,
  business_slug,
  business_type,
  is_active,
  profile_status,
  can_go_live,
  profile_completion_percentage,
  data
) VALUES (
  gen_random_uuid(),
  'Classic Party Bags Co',
  'classic-party-bags-co',
  'primary',
  true,
  'live',
  true,
  100,
  '{
    "name": "Classic Party Bags Co",
    "businessDescription": "Pre-filled party bags in your choice of colours! Pick blue, pink, rainbow, or mixed colours - each bag is packed with age-appropriate toys, sweets, and treats that kids love.",
    "category": "Party Bags",
    "subcategory": "Pre-filled Party Bags",
    "location": "London",
    "priceFrom": 4.50,
    "priceUnit": "per bag",
    "rating": 4.8,
    "reviewCount": 312,
    "themes": ["no-theme", "general", "classic"],
    "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386272/iStock-2212524051_v1njlh.jpg",
    "coverPhoto": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386272/iStock-2212524051_v1njlh.jpg",
    "verified": true,
    "fastResponder": true,
    "responseTime": "Within 24 hours",
    "advanceBookingDays": 5,
    "badges": ["Verified", "Top Rated"],
    "serviceDetails": {
      "bagStyle": "Pre-filled party bags",
      "ageRange": {"min": 3, "max": 10},
      "contentsType": "Mixed toys and sweets",
      "colourOptions": ["Blue", "Pink", "Rainbow", "Mixed"],
      "themes": ["no-theme", "general", "classic"],
      "fulfilment": {
        "offersDelivery": true,
        "deliveryFee": 5,
        "freeDeliveryOver": 30
      }
    },
    "packages": [
      {
        "id": "blue-bag-standard",
        "name": "Blue Party Bag",
        "price": 4.50,
        "colourScheme": "blue",
        "description": "Blue gift bag filled with fun toys and treats",
        "includes": ["Blue gift bag", "3 small toys", "Selection of sweets", "Stickers", "Bubbles"]
      },
      {
        "id": "blue-bag-premium",
        "name": "Blue Party Bag - Premium",
        "price": 6.50,
        "colourScheme": "blue",
        "description": "Extra special blue bag with more goodies",
        "includes": ["Blue gift bag", "5 small toys", "Premium sweets", "Stickers", "Bubbles", "Temporary tattoos", "Mini game"]
      },
      {
        "id": "pink-bag-standard",
        "name": "Pink Party Bag",
        "price": 4.50,
        "colourScheme": "pink",
        "description": "Pink gift bag filled with lovely toys and treats",
        "includes": ["Pink gift bag", "3 small toys", "Selection of sweets", "Stickers", "Bubbles"]
      },
      {
        "id": "pink-bag-premium",
        "name": "Pink Party Bag - Premium",
        "price": 6.50,
        "colourScheme": "pink",
        "description": "Extra special pink bag with more goodies",
        "includes": ["Pink gift bag", "5 small toys", "Premium sweets", "Stickers", "Bubbles", "Hair accessories", "Mini game"]
      },
      {
        "id": "rainbow-bag-standard",
        "name": "Rainbow Party Bag",
        "price": 4.50,
        "colourScheme": "rainbow",
        "description": "Colourful bag with rainbow toys and treats",
        "includes": ["Multicolour gift bag", "3 small toys", "Selection of sweets", "Stickers", "Bubbles"]
      },
      {
        "id": "rainbow-bag-premium",
        "name": "Rainbow Party Bag - Premium",
        "price": 6.50,
        "colourScheme": "rainbow",
        "description": "Extra special rainbow bag with more goodies",
        "includes": ["Multicolour gift bag", "5 small toys", "Premium sweets", "Stickers", "Bubbles", "Temporary tattoos", "Mini game"]
      },
      {
        "id": "mixed-bag-standard",
        "name": "Mixed Colours Party Bag",
        "price": 4.50,
        "colourScheme": "mixed",
        "description": "Assorted colours - great for mixed groups",
        "includes": ["Assorted colour bags", "3 small toys", "Selection of sweets", "Stickers", "Bubbles"]
      },
      {
        "id": "mixed-bag-premium",
        "name": "Mixed Colours Party Bag - Premium",
        "price": 6.50,
        "colourScheme": "mixed",
        "description": "Assorted colours premium bag",
        "includes": ["Assorted colour bags", "5 small toys", "Premium sweets", "Stickers", "Bubbles", "Temporary tattoos", "Mini game"]
      }
    ]
  }'::jsonb
);

-- ============================================
-- 4. BALLOONS - Classic with Colour Options
-- ============================================
INSERT INTO suppliers (
  id,
  business_name,
  business_slug,
  business_type,
  is_active,
  profile_status,
  can_go_live,
  profile_completion_percentage,
  data
) VALUES (
  gen_random_uuid(),
  'Classic Balloon Decorations',
  'classic-balloon-decorations',
  'primary',
  true,
  'live',
  true,
  100,
  '{
    "name": "Classic Balloon Decorations",
    "businessDescription": "Beautiful balloon decorations in your choice of colour scheme! Pick from blue, pink, rainbow, pastel, or gold & white. We offer balloon bunches, arches, and full party setups.",
    "category": "Balloons",
    "subcategory": "Balloon Decorations",
    "location": "London",
    "priceFrom": 25,
    "priceUnit": "per bundle",
    "rating": 4.8,
    "reviewCount": 178,
    "themes": ["no-theme", "general", "classic"],
    "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381160/iStock-1564856102_abqkpd.jpg",
    "coverPhoto": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381160/iStock-1564856102_abqkpd.jpg",
    "verified": true,
    "fastResponder": true,
    "responseTime": "Within 24 hours",
    "advanceBookingDays": 3,
    "badges": ["Verified", "Top Rated"],
    "serviceDetails": {
      "balloonTypes": ["Latex", "Foil", "Number balloons"],
      "services": ["Helium balloons", "Balloon bunches", "Balloon arches", "Table centrepieces"],
      "colourOptions": ["Blue", "Pink", "Rainbow", "Pastel", "Gold & White"],
      "themes": ["no-theme", "general", "classic"],
      "fulfilment": {
        "offersDelivery": true,
        "deliveryFee": 10,
        "offersSetup": true,
        "setupFee": 25
      }
    },
    "packages": [
      {
        "id": "blue-bunch",
        "name": "Blue Balloon Bunch",
        "price": 25,
        "colourScheme": "blue",
        "description": "10 helium balloons in shades of blue with silver accents",
        "includes": ["10 latex helium balloons", "Ribbon ties", "Weight"]
      },
      {
        "id": "blue-party-pack",
        "name": "Blue Party Pack",
        "price": 55,
        "colourScheme": "blue",
        "description": "Complete blue balloon decoration set",
        "includes": ["20 latex balloons", "2 foil number balloons", "Ribbon ties", "Weights", "Door decoration"]
      },
      {
        "id": "blue-arch",
        "name": "Blue Balloon Arch",
        "price": 120,
        "colourScheme": "blue",
        "description": "Stunning balloon arch in blue tones",
        "includes": ["Full balloon arch (approx 3m)", "Mixed blue shades", "Setup included"]
      },
      {
        "id": "pink-bunch",
        "name": "Pink Balloon Bunch",
        "price": 25,
        "colourScheme": "pink",
        "description": "10 helium balloons in beautiful pink shades with rose gold",
        "includes": ["10 latex helium balloons", "Ribbon ties", "Weight"]
      },
      {
        "id": "pink-party-pack",
        "name": "Pink Party Pack",
        "price": 55,
        "colourScheme": "pink",
        "description": "Complete pink balloon decoration set",
        "includes": ["20 latex balloons", "2 foil number balloons", "Ribbon ties", "Weights", "Door decoration"]
      },
      {
        "id": "pink-arch",
        "name": "Pink Balloon Arch",
        "price": 120,
        "colourScheme": "pink",
        "description": "Beautiful balloon arch in pink tones",
        "includes": ["Full balloon arch (approx 3m)", "Mixed pink shades", "Setup included"]
      },
      {
        "id": "rainbow-bunch",
        "name": "Rainbow Balloon Bunch",
        "price": 25,
        "colourScheme": "rainbow",
        "description": "10 helium balloons in vibrant rainbow colours",
        "includes": ["10 latex helium balloons", "Ribbon ties", "Weight"]
      },
      {
        "id": "rainbow-party-pack",
        "name": "Rainbow Party Pack",
        "price": 55,
        "colourScheme": "rainbow",
        "description": "Complete rainbow balloon decoration set",
        "includes": ["20 latex balloons", "2 foil number balloons", "Ribbon ties", "Weights", "Door decoration"]
      },
      {
        "id": "rainbow-arch",
        "name": "Rainbow Balloon Arch",
        "price": 120,
        "colourScheme": "rainbow",
        "description": "Spectacular rainbow balloon arch",
        "includes": ["Full balloon arch (approx 3m)", "All rainbow colours", "Setup included"]
      },
      {
        "id": "pastel-bunch",
        "name": "Pastel Balloon Bunch",
        "price": 25,
        "colourScheme": "pastel",
        "description": "10 helium balloons in soft pastel colours",
        "includes": ["10 latex helium balloons", "Ribbon ties", "Weight"]
      },
      {
        "id": "pastel-party-pack",
        "name": "Pastel Party Pack",
        "price": 55,
        "colourScheme": "pastel",
        "description": "Complete pastel balloon decoration set",
        "includes": ["20 latex balloons", "2 foil number balloons", "Ribbon ties", "Weights", "Door decoration"]
      },
      {
        "id": "pastel-arch",
        "name": "Pastel Balloon Arch",
        "price": 120,
        "colourScheme": "pastel",
        "description": "Elegant pastel balloon arch",
        "includes": ["Full balloon arch (approx 3m)", "Soft pastel colours", "Setup included"]
      },
      {
        "id": "gold-bunch",
        "name": "Gold & White Balloon Bunch",
        "price": 28,
        "colourScheme": "gold",
        "description": "10 helium balloons in elegant gold and white",
        "includes": ["10 latex/foil helium balloons", "Ribbon ties", "Weight"]
      },
      {
        "id": "gold-party-pack",
        "name": "Gold & White Party Pack",
        "price": 60,
        "colourScheme": "gold",
        "description": "Complete gold & white balloon decoration set",
        "includes": ["20 latex/foil balloons", "2 foil number balloons", "Ribbon ties", "Weights", "Door decoration"]
      },
      {
        "id": "gold-arch",
        "name": "Gold & White Balloon Arch",
        "price": 135,
        "colourScheme": "gold",
        "description": "Sophisticated gold and white balloon arch",
        "includes": ["Full balloon arch (approx 3m)", "Gold and white tones", "Setup included"]
      }
    ]
  }'::jsonb
);

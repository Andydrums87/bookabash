-- Update ALL Party Bag Suppliers with Enhanced Package Structure
-- Contents are generic so you're not locked into specific items
-- Each supplier just needs their own themed image

-- ============================================
-- 1. GALAXY PARTY BAGS (Space Theme) - ALREADY DONE
-- ============================================
UPDATE suppliers
SET data = jsonb_set(
  jsonb_set(
    data,
    '{packages}',
    '[
      {
        "id": "partybags-classic",
        "name": "Classic Party Bag",
        "price": 5,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817339/lpgjwkhcuo64xprlttld.png",
        "contents": ["Themed party bag", "Small themed toy", "Puzzle or game", "Sticker sheet", "Pencil or pen", "Sweet treats"],
        "features": ["Themed party bag", "Quality small toy", "Activity item", "Stationery", "Sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our classic bag packed with quality themed toys and treats!"
      },
      {
        "id": "partybags-standard",
        "name": "Standard Party Bag",
        "price": 8,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "popular": true,
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817339/lpgjwkhcuo64xprlttld.png",
        "contents": ["Premium themed bag", "Quality themed toy", "Fidget or sensory item", "Puzzle or game", "Sticker sheet", "Stationery set", "Notebook or pad", "Premium sweets"],
        "features": ["Premium themed bag", "Better quality toy", "Fidget toy", "Stationery set", "Premium sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our most popular bag! More toys, better quality, and premium treats."
      },
      {
        "id": "partybags-deluxe",
        "name": "Deluxe Party Bag",
        "price": 12,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817339/lpgjwkhcuo64xprlttld.png",
        "contents": ["Luxury themed gift bag", "Collectible or premium toy", "Craft kit or activity set", "Light-up or novelty item", "Art supplies", "Journal or activity book", "Gourmet chocolate", "Premium sweet selection", "Special keepsake item"],
        "features": ["Luxury gift bag", "Collectible toy", "Craft or activity kit", "Light-up item", "Art supplies", "Gourmet treats", "Special keepsake"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "The ultimate party bag! Premium toys, gadgets, and gourmet treats for a truly special take-home gift."
      }
    ]'::jsonb
  ),
  '{serviceDetails}',
  '{"themes": ["space", "astronaut", "planets"], "leadTime": 3, "allergenInfo": "Nut-free options available on request. Please let us know about any allergies when booking.", "delivery": "Free delivery included - delivered to your home the evening before your party (5-8pm)", "aboutUs": "We hand-curate every party bag with quality toys, treats, and themed goodies that kids actually love! Each bag is carefully packed to match your party theme."}'::jsonb
)
WHERE business_slug = 'galaxy-party-bags';


-- ============================================
-- 2. SPIDEY PARTY BAGS (Spiderman Theme)
-- ============================================
UPDATE suppliers
SET data = jsonb_set(
  jsonb_set(
    data,
    '{packages}',
    '[
      {
        "id": "partybags-classic",
        "name": "Classic Party Bag",
        "price": 5,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        "contents": ["Themed party bag", "Small themed toy", "Puzzle or game", "Sticker sheet", "Pencil or pen", "Sweet treats"],
        "features": ["Themed party bag", "Quality small toy", "Activity item", "Stationery", "Sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our classic bag packed with quality themed toys and treats!"
      },
      {
        "id": "partybags-standard",
        "name": "Standard Party Bag",
        "price": 8,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "popular": true,
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        "contents": ["Premium themed bag", "Quality themed toy", "Fidget or sensory item", "Puzzle or game", "Sticker sheet", "Stationery set", "Notebook or pad", "Premium sweets"],
        "features": ["Premium themed bag", "Better quality toy", "Fidget toy", "Stationery set", "Premium sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our most popular bag! More toys, better quality, and premium treats."
      },
      {
        "id": "partybags-deluxe",
        "name": "Deluxe Party Bag",
        "price": 12,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        "contents": ["Luxury themed gift bag", "Collectible or premium toy", "Craft kit or activity set", "Light-up or novelty item", "Art supplies", "Journal or activity book", "Gourmet chocolate", "Premium sweet selection", "Special keepsake item"],
        "features": ["Luxury gift bag", "Collectible toy", "Craft or activity kit", "Light-up item", "Art supplies", "Gourmet treats", "Special keepsake"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "The ultimate party bag! Premium toys, gadgets, and gourmet treats for a truly special take-home gift."
      }
    ]'::jsonb
  ),
  '{serviceDetails}',
  '{"themes": ["spiderman", "spider-man", "marvel"], "leadTime": 3, "allergenInfo": "Nut-free options available on request. Please let us know about any allergies when booking.", "delivery": "Free delivery included - delivered to your home the evening before your party (5-8pm)", "aboutUs": "We hand-curate every party bag with quality toys, treats, and themed goodies that kids actually love! Each bag is carefully packed to match your party theme."}'::jsonb
)
WHERE business_slug = 'spidey-party-bags';


-- ============================================
-- 3. SUPERHERO PARTY BAGS
-- ============================================
UPDATE suppliers
SET data = jsonb_set(
  jsonb_set(
    data,
    '{packages}',
    '[
      {
        "id": "partybags-classic",
        "name": "Classic Party Bag",
        "price": 5,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817186/objqvkyqvhobywxzy7ic.png",
        "contents": ["Themed party bag", "Small themed toy", "Puzzle or game", "Sticker sheet", "Pencil or pen", "Sweet treats"],
        "features": ["Themed party bag", "Quality small toy", "Activity item", "Stationery", "Sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our classic bag packed with quality themed toys and treats!"
      },
      {
        "id": "partybags-standard",
        "name": "Standard Party Bag",
        "price": 8,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "popular": true,
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817186/objqvkyqvhobywxzy7ic.png",
        "contents": ["Premium themed bag", "Quality themed toy", "Fidget or sensory item", "Puzzle or game", "Sticker sheet", "Stationery set", "Notebook or pad", "Premium sweets"],
        "features": ["Premium themed bag", "Better quality toy", "Fidget toy", "Stationery set", "Premium sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our most popular bag! More toys, better quality, and premium treats."
      },
      {
        "id": "partybags-deluxe",
        "name": "Deluxe Party Bag",
        "price": 12,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817186/objqvkyqvhobywxzy7ic.png",
        "contents": ["Luxury themed gift bag", "Collectible or premium toy", "Craft kit or activity set", "Light-up or novelty item", "Art supplies", "Journal or activity book", "Gourmet chocolate", "Premium sweet selection", "Special keepsake item"],
        "features": ["Luxury gift bag", "Collectible toy", "Craft or activity kit", "Light-up item", "Art supplies", "Gourmet treats", "Special keepsake"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "The ultimate party bag! Premium toys, gadgets, and gourmet treats for a truly special take-home gift."
      }
    ]'::jsonb
  ),
  '{serviceDetails}',
  '{"themes": ["superhero", "action", "marvel"], "leadTime": 3, "allergenInfo": "Nut-free options available on request. Please let us know about any allergies when booking.", "delivery": "Free delivery included - delivered to your home the evening before your party (5-8pm)", "aboutUs": "We hand-curate every party bag with quality toys, treats, and themed goodies that kids actually love! Each bag is carefully packed to match your party theme."}'::jsonb
)
WHERE business_slug = 'superhero-party-bags';


-- ============================================
-- 4. PRINCESS PARTY BAGS
-- ============================================
UPDATE suppliers
SET data = jsonb_set(
  jsonb_set(
    data,
    '{packages}',
    '[
      {
        "id": "partybags-classic",
        "name": "Classic Party Bag",
        "price": 5,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768816955/jupvjreqwl5ip4feqlio.png",
        "contents": ["Themed party bag", "Small themed toy", "Puzzle or game", "Sticker sheet", "Pencil or pen", "Sweet treats"],
        "features": ["Themed party bag", "Quality small toy", "Activity item", "Stationery", "Sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our classic bag packed with quality themed toys and treats!"
      },
      {
        "id": "partybags-standard",
        "name": "Standard Party Bag",
        "price": 8,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "popular": true,
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768816955/jupvjreqwl5ip4feqlio.png",
        "contents": ["Premium themed bag", "Quality themed toy", "Fidget or sensory item", "Puzzle or game", "Sticker sheet", "Stationery set", "Notebook or pad", "Premium sweets"],
        "features": ["Premium themed bag", "Better quality toy", "Fidget toy", "Stationery set", "Premium sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our most popular bag! More toys, better quality, and premium treats."
      },
      {
        "id": "partybags-deluxe",
        "name": "Deluxe Party Bag",
        "price": 12,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768816955/jupvjreqwl5ip4feqlio.png",
        "contents": ["Luxury themed gift bag", "Collectible or premium toy", "Craft kit or activity set", "Light-up or novelty item", "Art supplies", "Journal or activity book", "Gourmet chocolate", "Premium sweet selection", "Special keepsake item"],
        "features": ["Luxury gift bag", "Collectible toy", "Craft or activity kit", "Light-up item", "Art supplies", "Gourmet treats", "Special keepsake"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "The ultimate party bag! Premium toys, gadgets, and gourmet treats for a truly special take-home gift."
      }
    ]'::jsonb
  ),
  '{serviceDetails}',
  '{"themes": ["princess", "fairy", "royal"], "leadTime": 3, "allergenInfo": "Nut-free options available on request. Please let us know about any allergies when booking.", "delivery": "Free delivery included - delivered to your home the evening before your party (5-8pm)", "aboutUs": "We hand-curate every party bag with quality toys, treats, and themed goodies that kids actually love! Each bag is carefully packed to match your party theme."}'::jsonb
)
WHERE business_slug = 'princess-party-bags';


-- ============================================
-- 5. MAD SCIENTIST PARTY BAGS (Science Theme)
-- ============================================
UPDATE suppliers
SET data = jsonb_set(
  jsonb_set(
    data,
    '{packages}',
    '[
      {
        "id": "partybags-classic",
        "name": "Classic Party Bag",
        "price": 5,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768818661/o7uouqpt7tzquiyyh3vv.png",
        "contents": ["Themed party bag", "Small themed toy", "Puzzle or game", "Sticker sheet", "Pencil or pen", "Sweet treats"],
        "features": ["Themed party bag", "Quality small toy", "Activity item", "Stationery", "Sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our classic bag packed with quality themed toys and treats!"
      },
      {
        "id": "partybags-standard",
        "name": "Standard Party Bag",
        "price": 8,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "popular": true,
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768818661/o7uouqpt7tzquiyyh3vv.png",
        "contents": ["Premium themed bag", "Quality themed toy", "Fidget or sensory item", "Puzzle or game", "Sticker sheet", "Stationery set", "Notebook or pad", "Premium sweets"],
        "features": ["Premium themed bag", "Better quality toy", "Fidget toy", "Stationery set", "Premium sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our most popular bag! More toys, better quality, and premium treats."
      },
      {
        "id": "partybags-deluxe",
        "name": "Deluxe Party Bag",
        "price": 12,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768818661/o7uouqpt7tzquiyyh3vv.png",
        "contents": ["Luxury themed gift bag", "Collectible or premium toy", "Craft kit or activity set", "Light-up or novelty item", "Art supplies", "Journal or activity book", "Gourmet chocolate", "Premium sweet selection", "Special keepsake item"],
        "features": ["Luxury gift bag", "Collectible toy", "Craft or activity kit", "Light-up item", "Art supplies", "Gourmet treats", "Special keepsake"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "The ultimate party bag! Premium toys, gadgets, and gourmet treats for a truly special take-home gift."
      }
    ]'::jsonb
  ),
  '{serviceDetails}',
  '{"themes": ["science", "laboratory", "experiments"], "leadTime": 3, "allergenInfo": "Nut-free options available on request. Please let us know about any allergies when booking.", "delivery": "Free delivery included - delivered to your home the evening before your party (5-8pm)", "aboutUs": "We hand-curate every party bag with quality toys, treats, and themed goodies that kids actually love! Each bag is carefully packed to match your party theme."}'::jsonb
)
WHERE business_slug = 'mad-scientist-party-bags';


-- ============================================
-- 6. PIRATE TREASURE BAGS
-- ============================================
UPDATE suppliers
SET data = jsonb_set(
  jsonb_set(
    data,
    '{packages}',
    '[
      {
        "id": "partybags-classic",
        "name": "Classic Party Bag",
        "price": 5,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817096/nkxirwodypbcx1uibumh.png",
        "contents": ["Themed party bag", "Small themed toy", "Puzzle or game", "Sticker sheet", "Pencil or pen", "Sweet treats"],
        "features": ["Themed party bag", "Quality small toy", "Activity item", "Stationery", "Sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our classic bag packed with quality themed toys and treats!"
      },
      {
        "id": "partybags-standard",
        "name": "Standard Party Bag",
        "price": 8,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "popular": true,
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817096/nkxirwodypbcx1uibumh.png",
        "contents": ["Premium themed bag", "Quality themed toy", "Fidget or sensory item", "Puzzle or game", "Sticker sheet", "Stationery set", "Notebook or pad", "Premium sweets"],
        "features": ["Premium themed bag", "Better quality toy", "Fidget toy", "Stationery set", "Premium sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our most popular bag! More toys, better quality, and premium treats."
      },
      {
        "id": "partybags-deluxe",
        "name": "Deluxe Party Bag",
        "price": 12,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817096/nkxirwodypbcx1uibumh.png",
        "contents": ["Luxury themed gift bag", "Collectible or premium toy", "Craft kit or activity set", "Light-up or novelty item", "Art supplies", "Journal or activity book", "Gourmet chocolate", "Premium sweet selection", "Special keepsake item"],
        "features": ["Luxury gift bag", "Collectible toy", "Craft or activity kit", "Light-up item", "Art supplies", "Gourmet treats", "Special keepsake"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "The ultimate party bag! Premium toys, gadgets, and gourmet treats for a truly special take-home gift."
      }
    ]'::jsonb
  ),
  '{serviceDetails}',
  '{"themes": ["pirate", "adventure", "treasure"], "leadTime": 3, "allergenInfo": "Nut-free options available on request. Please let us know about any allergies when booking.", "delivery": "Free delivery included - delivered to your home the evening before your party (5-8pm)", "aboutUs": "We hand-curate every party bag with quality toys, treats, and themed goodies that kids actually love! Each bag is carefully packed to match your party theme."}'::jsonb
)
WHERE business_slug = 'pirate-treasure-bags';


-- ============================================
-- 7. SAFARI PARTY BAGS (Jungle Theme)
-- ============================================
UPDATE suppliers
SET data = jsonb_set(
  jsonb_set(
    data,
    '{packages}',
    '[
      {
        "id": "partybags-classic",
        "name": "Classic Party Bag",
        "price": 5,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817246/nvevapbdsvo3ulkksj97.png",
        "contents": ["Themed party bag", "Small themed toy", "Puzzle or game", "Sticker sheet", "Pencil or pen", "Sweet treats"],
        "features": ["Themed party bag", "Quality small toy", "Activity item", "Stationery", "Sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our classic bag packed with quality themed toys and treats!"
      },
      {
        "id": "partybags-standard",
        "name": "Standard Party Bag",
        "price": 8,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "popular": true,
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817246/nvevapbdsvo3ulkksj97.png",
        "contents": ["Premium themed bag", "Quality themed toy", "Fidget or sensory item", "Puzzle or game", "Sticker sheet", "Stationery set", "Notebook or pad", "Premium sweets"],
        "features": ["Premium themed bag", "Better quality toy", "Fidget toy", "Stationery set", "Premium sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our most popular bag! More toys, better quality, and premium treats."
      },
      {
        "id": "partybags-deluxe",
        "name": "Deluxe Party Bag",
        "price": 12,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817246/nvevapbdsvo3ulkksj97.png",
        "contents": ["Luxury themed gift bag", "Collectible or premium toy", "Craft kit or activity set", "Light-up or novelty item", "Art supplies", "Journal or activity book", "Gourmet chocolate", "Premium sweet selection", "Special keepsake item"],
        "features": ["Luxury gift bag", "Collectible toy", "Craft or activity kit", "Light-up item", "Art supplies", "Gourmet treats", "Special keepsake"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "The ultimate party bag! Premium toys, gadgets, and gourmet treats for a truly special take-home gift."
      }
    ]'::jsonb
  ),
  '{serviceDetails}',
  '{"themes": ["jungle", "safari", "animals"], "leadTime": 3, "allergenInfo": "Nut-free options available on request. Please let us know about any allergies when booking.", "delivery": "Free delivery included - delivered to your home the evening before your party (5-8pm)", "aboutUs": "We hand-curate every party bag with quality toys, treats, and themed goodies that kids actually love! Each bag is carefully packed to match your party theme."}'::jsonb
)
WHERE business_slug = 'safari-party-bags';


-- ============================================
-- 8. MAGICAL UNICORN PARTY BAGS
-- ============================================
UPDATE suppliers
SET data = jsonb_set(
  jsonb_set(
    data,
    '{packages}',
    '[
      {
        "id": "partybags-classic",
        "name": "Classic Party Bag",
        "price": 5,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1764111187/venue_photos/file_khacgu.jpg",
        "contents": ["Themed party bag", "Small themed toy", "Puzzle or game", "Sticker sheet", "Pencil or pen", "Sweet treats"],
        "features": ["Themed party bag", "Quality small toy", "Activity item", "Stationery", "Sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our classic bag packed with quality themed toys and treats!"
      },
      {
        "id": "partybags-standard",
        "name": "Standard Party Bag",
        "price": 8,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "popular": true,
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1764111187/venue_photos/file_khacgu.jpg",
        "contents": ["Premium themed bag", "Quality themed toy", "Fidget or sensory item", "Puzzle or game", "Sticker sheet", "Stationery set", "Notebook or pad", "Premium sweets"],
        "features": ["Premium themed bag", "Better quality toy", "Fidget toy", "Stationery set", "Premium sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our most popular bag! More toys, better quality, and premium treats."
      },
      {
        "id": "partybags-deluxe",
        "name": "Deluxe Party Bag",
        "price": 12,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1764111187/venue_photos/file_khacgu.jpg",
        "contents": ["Luxury themed gift bag", "Collectible or premium toy", "Craft kit or activity set", "Light-up or novelty item", "Art supplies", "Journal or activity book", "Gourmet chocolate", "Premium sweet selection", "Special keepsake item"],
        "features": ["Luxury gift bag", "Collectible toy", "Craft or activity kit", "Light-up item", "Art supplies", "Gourmet treats", "Special keepsake"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "The ultimate party bag! Premium toys, gadgets, and gourmet treats for a truly special take-home gift."
      }
    ]'::jsonb
  ),
  '{serviceDetails}',
  '{"themes": ["unicorn", "rainbow", "magical"], "leadTime": 3, "allergenInfo": "Nut-free options available on request. Please let us know about any allergies when booking.", "delivery": "Free delivery included - delivered to your home the evening before your party (5-8pm)", "aboutUs": "We hand-curate every party bag with quality toys, treats, and themed goodies that kids actually love! Each bag is carefully packed to match your party theme."}'::jsonb
)
WHERE business_slug = 'magical-unicorn-party-bags';


-- ============================================
-- 9. DINO PARTY BAGS (Dinosaur Theme)
-- ============================================
UPDATE suppliers
SET data = jsonb_set(
  jsonb_set(
    data,
    '{packages}',
    '[
      {
        "id": "partybags-classic",
        "name": "Classic Party Bag",
        "price": 5,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768816855/vsnwz8bra7l5carpej5y.png",
        "contents": ["Themed party bag", "Small themed toy", "Puzzle or game", "Sticker sheet", "Pencil or pen", "Sweet treats"],
        "features": ["Themed party bag", "Quality small toy", "Activity item", "Stationery", "Sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our classic bag packed with quality themed toys and treats!"
      },
      {
        "id": "partybags-standard",
        "name": "Standard Party Bag",
        "price": 8,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "popular": true,
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768816855/vsnwz8bra7l5carpej5y.png",
        "contents": ["Premium themed bag", "Quality themed toy", "Fidget or sensory item", "Puzzle or game", "Sticker sheet", "Stationery set", "Notebook or pad", "Premium sweets"],
        "features": ["Premium themed bag", "Better quality toy", "Fidget toy", "Stationery set", "Premium sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our most popular bag! More toys, better quality, and premium treats."
      },
      {
        "id": "partybags-deluxe",
        "name": "Deluxe Party Bag",
        "price": 12,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768816855/vsnwz8bra7l5carpej5y.png",
        "contents": ["Luxury themed gift bag", "Collectible or premium toy", "Craft kit or activity set", "Light-up or novelty item", "Art supplies", "Journal or activity book", "Gourmet chocolate", "Premium sweet selection", "Special keepsake item"],
        "features": ["Luxury gift bag", "Collectible toy", "Craft or activity kit", "Light-up item", "Art supplies", "Gourmet treats", "Special keepsake"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "The ultimate party bag! Premium toys, gadgets, and gourmet treats for a truly special take-home gift."
      }
    ]'::jsonb
  ),
  '{serviceDetails}',
  '{"themes": ["dinosaur", "prehistoric", "jurassic"], "leadTime": 3, "allergenInfo": "Nut-free options available on request. Please let us know about any allergies when booking.", "delivery": "Free delivery included - delivered to your home the evening before your party (5-8pm)", "aboutUs": "We hand-curate every party bag with quality toys, treats, and themed goodies that kids actually love! Each bag is carefully packed to match your party theme."}'::jsonb
)
WHERE business_slug = 'dino-party-bags';


-- ============================================
-- 10. UNDER THE SEA PARTY BAGS (Mermaid Theme)
-- ============================================
UPDATE suppliers
SET data = jsonb_set(
  jsonb_set(
    data,
    '{packages}',
    '[
      {
        "id": "partybags-classic",
        "name": "Classic Party Bag",
        "price": 5,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817032/lenfxqf54d5vdhy2a2ms.png",
        "contents": ["Themed party bag", "Small themed toy", "Puzzle or game", "Sticker sheet", "Pencil or pen", "Sweet treats"],
        "features": ["Themed party bag", "Quality small toy", "Activity item", "Stationery", "Sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our classic bag packed with quality themed toys and treats!"
      },
      {
        "id": "partybags-standard",
        "name": "Standard Party Bag",
        "price": 8,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "popular": true,
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817032/lenfxqf54d5vdhy2a2ms.png",
        "contents": ["Premium themed bag", "Quality themed toy", "Fidget or sensory item", "Puzzle or game", "Sticker sheet", "Stationery set", "Notebook or pad", "Premium sweets"],
        "features": ["Premium themed bag", "Better quality toy", "Fidget toy", "Stationery set", "Premium sweets"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "Our most popular bag! More toys, better quality, and premium treats."
      },
      {
        "id": "partybags-deluxe",
        "name": "Deluxe Party Bag",
        "price": 12,
        "priceType": "per_bag",
        "pricingModel": "perBag",
        "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768817032/lenfxqf54d5vdhy2a2ms.png",
        "contents": ["Luxury themed gift bag", "Collectible or premium toy", "Craft kit or activity set", "Light-up or novelty item", "Art supplies", "Journal or activity book", "Gourmet chocolate", "Premium sweet selection", "Special keepsake item"],
        "features": ["Luxury gift bag", "Collectible toy", "Craft or activity kit", "Light-up item", "Art supplies", "Gourmet treats", "Special keepsake"],
        "allergenInfo": {"containsNuts": false, "nutFreeOption": true},
        "description": "The ultimate party bag! Premium toys, gadgets, and gourmet treats for a truly special take-home gift."
      }
    ]'::jsonb
  ),
  '{serviceDetails}',
  '{"themes": ["mermaid", "ocean", "underwater"], "leadTime": 3, "allergenInfo": "Nut-free options available on request. Please let us know about any allergies when booking.", "delivery": "Free delivery included - delivered to your home the evening before your party (5-8pm)", "aboutUs": "We hand-curate every party bag with quality toys, treats, and themed goodies that kids actually love! Each bag is carefully packed to match your party theme."}'::jsonb
)
WHERE business_slug = 'under-the-sea-party-bags';


-- ============================================
-- VERIFY ALL UPDATES
-- ============================================
SELECT
  business_name,
  business_slug,
  jsonb_array_length(data->'packages') as package_count,
  data->'packages'->0->>'pricingModel' as pricing_model,
  data->'serviceDetails'->>'delivery' as delivery_info
FROM suppliers
WHERE data->>'category' = 'Party Bags'
ORDER BY business_name;

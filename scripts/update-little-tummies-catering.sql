-- ============================================
-- UPDATE LITTLE TUMMIES PARTY BOXES
-- With simplified Party Food Bags structure
-- Based on the caterer's menu
-- ============================================

UPDATE suppliers
SET data = jsonb_set(
  jsonb_set(
    jsonb_set(
      data,
      '{packages}',
      '[
        {
          "id": "party-food-bags",
          "name": "Party Food Bags",
          "price": 5.75,
          "priceType": "perChild",
          "pricingModel": "perChild",
          "popular": true,
          "image": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768836149/pdfknapandt7wpwklta5.png",
          "description": "Delicious party food for little ones - everything they need in one bag!",
          "contents": [
            "1x Main: Sandwich roll or pasta salad",
            "2x Sides & treats (e.g. crisps, sausage rolls, cheese stars)",
            "1x Naughty pud (e.g. brownie, rocky road, cookies)",
            "1x Googly-eyed fruit",
            "Little wooden fork included"
          ],
          "features": [
            "Sandwich roll or pasta salad",
            "2 sides & treats",
            "Homemade pudding",
            "Fresh fruit",
            "Wooden fork included"
          ],
          "dietaryNote": "Dietary requirements are discussed with you and catered for separately"
        }
      ]'::jsonb
    ),
    '{addOnServices}',
    '[
      {
        "id": "drinks",
        "name": "Add Drinks",
        "price": 0.80,
        "priceType": "perChild",
        "description": "Bottled water, juice cartons, or Fruit Shoot"
      },
      {
        "id": "extra-treats",
        "name": "Extra Treats",
        "price": 0.50,
        "priceType": "perChild",
        "description": "Additional sweet treats per child"
      }
    ]'::jsonb
  ),
  '{serviceDetails}',
  '{
    "cateringType": "Party Food Caterer",
    "serviceStyle": "Delivery Only",
    "aboutUs": "We create delicious, homemade party food that kids absolutely love! Our Party Food Bags are freshly prepared with quality ingredients. Every bag is packed with care - a tasty main, treats, homemade pudding and fresh fruit.",
    "leadTime": 48,
    "minimumOrder": 10,
    "maximumOrder": 50,
    "deliveryInfo": "Free delivery included! Delivered to your venue or home on the day of the party.",
    "allergenInfo": "We handle all common allergens. Dietary requirements are discussed with you personally and catered for separately.",
    "menuHighlights": {
      "mains": ["Soft roll sandwiches (various fillings)", "Homemade pesto pasta salad", "Homemade rainbow pasta salad"],
      "sidesAndTreats": ["Cheddar & parmesan stars", "Popcorn", "Hula Hoops", "Pom Bears", "Sausage rolls", "Crudités", "Grapes", "Pretzels", "Strawberry yogurt"],
      "puddings": ["Chocky rocky roads", "Millionaire shortbread", "Choc chip cookies", "Tiffin squares", "Stripy jellies", "Triple chocolate brownies", "Mars Bar Krispies", "Apple flapjacks"],
      "fruit": ["Apples", "Bananas", "Satsumas"],
      "drinks": ["Bottled water", "Apple juice cartons", "Orange juice cartons", "Fruit Shoots"]
    }
  }'::jsonb
),
updated_at = now()
WHERE id = 'adcb6558-b098-4df1-9028-1080a6e52093';

-- Update the top-level fields too
UPDATE suppliers
SET
  data = data || '{
    "priceFrom": 5.75,
    "pricingModel": "perChild",
    "minimumOrder": 10,
    "description": "Delicious Party Food Bags delivered to your venue. Choose 1 main, 2 sides & treats, 1 pudding, and 1 fruit - all for £5.75 per head. Add drinks or extra treats if you like!"
  }'::jsonb
WHERE id = 'adcb6558-b098-4df1-9028-1080a6e52093';

-- Verify the update
SELECT
  business_name,
  data->'packages'->0->>'name' as package_name,
  data->'packages'->0->>'price' as price,
  data->'packages'->0->>'priceType' as price_type,
  jsonb_array_length(data->'addOnServices') as addon_count,
  data->'addOnServices'->0->>'priceType' as drinks_price_type,
  data->'addOnServices'->1->>'priceType' as treats_price_type,
  data->'serviceDetails'->>'cateringType' as catering_type
FROM suppliers
WHERE id = 'adcb6558-b098-4df1-9028-1080a6e52093';

-- Update Eden Room at Saint & Sinner with separate venue packages and catering add-on
-- Venue ID: 6632e9df-eb58-44bc-b167-c9fbe0d4dc09

UPDATE suppliers
SET data = jsonb_set(
  jsonb_set(
    data,
    '{packages}',
    '[
      {
        "id": "eden-room-hire",
        "name": "Eden Room",
        "description": "Private function room perfect for children''s parties. Comfortable space with dedicated party area.",
        "price": 100,
        "weekendPrice": 200,
        "priceType": "flat",
        "duration": "5 hours",
        "minGuests": 30,
        "maxGuests": 50,
        "features": [
          "Private function room",
          "Dedicated party space",
          "Tables and seating included",
          "1 hour setup time",
          "1 hour cleanup time"
        ],
        "image": ""
      },
      {
        "id": "eden-cocktail-combined",
        "name": "Eden Room + Cocktail Room",
        "description": "Combined space for larger parties. Perfect for bigger celebrations with more guests.",
        "price": 200,
        "weekendPrice": 400,
        "priceType": "flat",
        "duration": "5 hours",
        "minGuests": 50,
        "maxGuests": 80,
        "popular": true,
        "features": [
          "Two combined function rooms",
          "Extra space for activities",
          "Tables and seating included",
          "1 hour setup time",
          "1 hour cleanup time"
        ],
        "image": ""
      }
    ]'::jsonb
  ),
  '{cateringPackages}',
  '[
    {
      "id": "party-buffet",
      "name": "Party Buffet",
      "description": "Delicious sharing platters perfect for celebrations. A fantastic spread for all ages!",
      "pricePerHead": 22.95,
      "minGuests": 10,
      "maxGuests": 80,
      "sections": [
        {
          "title": "Sides",
          "items": ["Cheesy Garlic Bread", "Rosemary Fries"]
        },
        {
          "title": "Small Plates",
          "items": ["Slider Burger Platter", "Chicken Tenders", "Nduja Croquettes", "Tomato & Mozzarella Arancini"]
        },
        {
          "title": "Pizzas",
          "items": ["Margherita (V)", "Pepperoni", "Mushroom Ricotta & Hot Honey (V)", "Carne"]
        }
      ],
      "items": [
        "Cheesy Garlic Bread",
        "Rosemary Fries",
        "Slider Burger Platter",
        "Chicken Tenders",
        "Nduja Croquettes",
        "Tomato & Mozzarella Arancini",
        "Margherita Pizza (V)",
        "Pepperoni Pizza",
        "Mushroom Ricotta & Hot Honey Pizza (V)",
        "Carne Pizza"
      ],
      "dietaryInfo": "Vegetarian options available (V)",
      "image": ""
    }
  ]'::jsonb
)
WHERE id = '6632e9df-eb58-44bc-b167-c9fbe0d4dc09';

-- Verify the update
SELECT
  business_name,
  id,
  jsonb_array_length(data->'packages') as package_count,
  jsonb_array_length(data->'cateringPackages') as catering_count,
  data->'packages'->0->>'name' as first_package,
  data->'cateringPackages'->0->>'name' as catering_name,
  data->'cateringPackages'->0->>'pricePerHead' as catering_price
FROM suppliers
WHERE id = '6632e9df-eb58-44bc-b167-c9fbe0d4dc09';

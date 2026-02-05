-- Update Eden Room at Saint & Sinner with venue packages including weekday/weekend pricing
-- Venue ID: 6632e9df-eb58-44bc-b167-c9fbe0d4dc09

UPDATE suppliers
SET data = jsonb_set(
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
      "features": [
        "Two combined function rooms",
        "Extra space for activities",
        "Tables and seating included",
        "1 hour setup time",
        "1 hour cleanup time"
      ],
      "image": ""
    },
    {
      "id": "eden-room-with-buffet",
      "name": "Eden Room + Party Buffet",
      "description": "Eden Room hire with our popular kids party buffet included. Great value package!",
      "price": 100,
      "weekendPrice": 200,
      "priceType": "flat",
      "pricePerPerson": 22.95,
      "duration": "5 hours",
      "minGuests": 30,
      "maxGuests": 50,
      "popular": true,
      "features": [
        "Private function room",
        "Party buffet included (£22.95/head)",
        "Mini burgers",
        "Pizza slices",
        "Chicken goujons",
        "Chips",
        "Vegetable crudites with dips",
        "Fresh fruit platter"
      ],
      "image": ""
    },
    {
      "id": "eden-cocktail-with-buffet",
      "name": "Eden + Cocktail Room + Party Buffet",
      "description": "Combined rooms with party buffet included. Perfect for larger celebrations.",
      "price": 200,
      "weekendPrice": 400,
      "priceType": "flat",
      "pricePerPerson": 22.95,
      "duration": "5 hours",
      "minGuests": 50,
      "maxGuests": 80,
      "features": [
        "Two combined function rooms",
        "Party buffet included (£22.95/head)",
        "Mini burgers",
        "Pizza slices",
        "Chicken goujons",
        "Chips",
        "Vegetable crudites with dips",
        "Fresh fruit platter"
      ],
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
  data->'packages'->0->>'name' as first_package,
  data->'packages'->0->>'price' as weekday_price,
  data->'packages'->0->>'weekendPrice' as weekend_price
FROM suppliers
WHERE id = '6632e9df-eb58-44bc-b167-c9fbe0d4dc09';

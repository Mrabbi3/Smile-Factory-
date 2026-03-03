-- ============================================================
-- Smile Factory — Seed Data
-- ============================================================

-- Token pricing tiers
insert into public.token_pricing (price, token_count, is_active, is_loyalty_bonus, min_role) values
  (1,   3,  true, false, 'employee'),
  (5,  15,  true, false, 'employee'),
  (10, 30,  true, false, 'employee'),
  (20, 66,  true, false, 'employee');

-- Loyalty bonus tier (manager-only)
insert into public.token_pricing (price, token_count, is_active, is_loyalty_bonus, min_role) values
  (100, 30, true, true, 'manager');

-- Classic birthday party package
insert into public.party_packages (name, description, base_price, max_kids, duration_minutes, includes, add_ons) values
  (
    'Classic Birthday Party',
    'Our most popular birthday party package — perfect for kids who love arcade fun!',
    400,
    12,
    120,
    '[
      "2 hours of unlimited play",
      "Private party room",
      "Pizza and drinks for all kids",
      "Paper plates, napkins, and utensils",
      "Birthday cake table setup",
      "Dedicated party host",
      "Party invitations (digital)",
      "10 tokens per child",
      "Small prize bag per child"
    ]'::jsonb,
    '[
      {"name": "Extra child", "price": 25},
      {"name": "Upgrade to deluxe prize bags", "price": 50},
      {"name": "Extra 30 minutes", "price": 75},
      {"name": "Custom cake (serves 20)", "price": 60},
      {"name": "Balloon arch decoration", "price": 45}
    ]'::jsonb
  );

-- System settings
insert into public.system_settings (key, value, description) values
  ('card_minimum',           '10',  'Minimum dollar amount for card payments'),
  ('party_buffer_minutes',   '60',  'Minutes of buffer time between party bookings'),
  ('max_kids_before_call',   '25',  'Max kids allowed before requiring a phone call to book'),
  ('deposit_amount',         '100', 'Default party deposit amount in dollars');
-- ============================================================
-- PYKLR — Development seed data
-- ============================================================
-- Run via: pnpm supabase db reset
-- These rows seed the local Supabase instance with a few courts
-- so the discover screen has something to show on Day 1.
-- ============================================================

-- A "system" admin profile for seeded content
-- (Real Supabase will skip this if no matching auth.users row exists.)

INSERT INTO courts (name, address, lat, lng, court_count, court_type, surface, fee_type, amenities, status)
VALUES
  (
    'Flowers Park Courts',
    'Flowers Park, New Rochelle, NY 10805',
    40.9059, -73.7843,
    4, 'outdoor', 'asphalt', 'free',
    ARRAY['lights', 'restroom', 'parking', 'water'],
    'verified'
  ),
  (
    'New Roc Pickleball',
    'New Roc City, 33 LeCount Pl, New Rochelle, NY 10801',
    40.9119, -73.7826,
    6, 'indoor', 'wood', 'paid',
    ARRAY['lights', 'restroom', 'parking', 'pro_shop'],
    'verified'
  ),
  (
    'Glen Island Park',
    'Glen Island Park, New Rochelle, NY 10805',
    40.8989, -73.7793,
    2, 'outdoor', 'asphalt', 'free',
    ARRAY['restroom', 'parking', 'shade'],
    'verified'
  ),
  (
    'Saxon Woods Park',
    'Mamaroneck Ave, Scarsdale, NY 10583',
    40.9601, -73.7641,
    8, 'outdoor', 'concrete', 'free',
    ARRAY['lights', 'restroom', 'parking', 'water', 'shade'],
    'verified'
  ),
  (
    'Maplewood Pickle Club',
    'Maplewood, NJ 07040',
    40.7314, -74.2735,
    4, 'indoor', 'wood', 'members_only',
    ARRAY['lights', 'restroom', 'parking', 'pro_shop', 'food'],
    'verified'
  );

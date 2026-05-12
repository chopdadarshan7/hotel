insert into public.rooms (
  name,
  type,
  description,
  price_per_night,
  max_guests,
  bed_type,
  amenities,
  images,
  available
)
values
  (
    '6-Bed Mixed Dorm',
    'dorm',
    'A bright shared dorm with privacy curtains, lockers, AC, and quick access to the lounge.',
    600,
    1,
    'Bunk Bed',
    '{WiFi,Locker,AC,Reading Light}',
    '{"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"}',
    true
  ),
  (
    '4-Bed Female Dorm',
    'dorm',
    'A quieter shared setup with secure storage, soft lighting, and an easy city-stay feel.',
    700,
    1,
    'Bunk Bed',
    '{WiFi,Locker,AC,Vanity Mirror}',
    '{"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"}',
    true
  ),
  (
    'Private Standard Room',
    'private',
    'A warm and cozy private stay with a double bed, attached bathroom, and thoughtful essentials.',
    1800,
    2,
    'Double Bed',
    '{WiFi,AC,Attached Bathroom,Desk}',
    '{"https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80"}',
    true
  ),
  (
    'Deluxe Private Room',
    'deluxe',
    'A premium room with balcony seating, a king bed, and more breathing room for longer stays.',
    2500,
    2,
    'King Bed',
    '{WiFi,AC,TV,Balcony,Attached Bathroom}',
    '{"https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1200&q=80"}',
    true
  );

insert into public.gallery (url, caption, category)
values
  (
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    'Private room with balcony seating',
    'rooms'
  ),
  (
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    'Community event night',
    'events'
  ),
  (
    'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80',
    'Breakfast and coffee corner',
    'food'
  ),
  (
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    'Courtyard common area',
    'common'
  );

-- After creating your first auth user in Supabase Auth,
-- make that user an admin with:
-- update public.profiles set role = 'admin' where id = '<auth-user-uuid>';

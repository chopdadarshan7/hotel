# Us Hostel

A modern hostel website built with React, React Router, and Supabase for database, authentication, storage, and booking workflows.

## What is included

- Public website pages:
  - Home
  - Rooms & Booking
  - Gallery
  - About
  - Contact
- Protected admin area:
  - Admin login with Supabase Auth
  - Room management
  - Booking status management
  - Gallery upload/delete
  - Contact message review
- Supabase deliverables:
  - SQL schema with RLS policies
  - Seed SQL
  - Edge Function for booking confirmation emails
  - `.env.example`

## Tech stack

- React
- React Router
- Vite
- Supabase JavaScript client
- Custom CSS with Google Fonts (`Playfair Display` + `DM Sans`)

## Project structure

```text
src/
  components/
    BookingModal.jsx
    Footer.jsx
    GalleryGrid.jsx
    Navbar.jsx
    RoomCard.jsx
    WhatsAppButton.jsx
  hooks/
    useBooking.js
    useGallery.js
    useRooms.js
  lib/
    admin.js
    siteData.js
    supabase.js
  pages/
    About.jsx
    AdminDashboard.jsx
    AdminLogin.jsx
    Contact.jsx
    Gallery.jsx
    Home.jsx
    Rooms.jsx
  utils/
    calculatePrice.js
    formatDate.js
  App.jsx
  main.jsx

supabase/
  schema.sql
  seed.sql
  functions/
    send-booking-confirmation/
      index.ts
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the env example:

```bash
cp .env.example .env
```

3. Add your values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_ADMIN_EMAILS=admin@example.com
```

4. Start the app:

```bash
npm run dev
```

## Supabase setup

### 1. Create the project

- Create a new Supabase project.
- Copy the project URL and anon key into `.env`.

### 2. Run the SQL schema

- Open the Supabase SQL editor.
- Paste the contents of `supabase/schema.sql`.
- Run it.

This creates:

- `profiles`
- `rooms`
- `bookings`
- `gallery`
- `contacts`
- storage buckets:
  - `room-images`
  - `gallery-images`
- RLS policies
- the `check_room_availability` RPC

### 3. Seed the database

- Run `supabase/seed.sql` in the SQL editor.

### 4. Create an admin user

- Create a user in Supabase Auth.
- Copy the user UUID.
- Promote the user:

```sql
update public.profiles
set role = 'admin'
where id = '<auth-user-uuid>';
```

You can also add the admin email to `VITE_ADMIN_EMAILS` for an additional frontend check.

### 5. Deploy the edge function

The booking flow calls the `send-booking-confirmation` function after a booking is created.

Set secrets:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set BOOKING_FROM_EMAIL="Us Hostel <bookings@yourdomain.com>"
```

Deploy:

```bash
supabase functions deploy send-booking-confirmation
```

### 6. Storage

The schema creates public buckets:

- `room-images`
- `gallery-images`

Only admins can upload, update, or delete objects inside those buckets.

## Notes

- If Supabase environment variables are missing, the public site falls back to sample rooms and gallery items so the UI remains usable.
- Contact form submission, bookings, admin auth, and uploads require Supabase to be configured.
- The current booking confirmation email example uses Resend inside a Supabase Edge Function.

## Useful scripts

```bash
npm run dev
npm run build
npm run lint
```

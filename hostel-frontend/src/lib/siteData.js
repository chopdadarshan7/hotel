export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const roomTypeOptions = [
  { label: "All Rooms", value: "all" },
  { label: "Dorm", value: "dorm" },
  { label: "Private", value: "private" },
  { label: "Deluxe", value: "deluxe" },
];

export const whyUsItems = [
  { title: "Fast WiFi", text: "Stream, work, and stay connected from every room and social corner." },
  { title: "Personal Lockers", text: "Secure storage for your essentials while you explore the city." },
  { title: "24/7 Reception", text: "Our front desk team is always around for late check-ins and local tips." },
  { title: "Social Events", text: "Weekly movie nights, food walks, and community hangouts." },
];

export const testimonials = [
  {
    name: "Aisha Khan",
    location: "Mumbai",
    rating: 5,
    quote: "Beautiful interiors, helpful team, and the easiest booking flow I've used at a hostel.",
  },
  {
    name: "Ryan Cole",
    location: "Manchester",
    rating: 5,
    quote: "The common areas felt alive without being chaotic. I met half my trip crew here.",
  },
  {
    name: "Maya Fernandes",
    location: "Goa",
    rating: 4,
    quote: "Loved the dorm setup, great lockers, and smooth check-in. The vibe is super welcoming.",
  },
];

export const teamMembers = [
  {
    name: "Naina Verma",
    role: "Host Manager",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Aarav Malhotra",
    role: "Community Lead",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sofia Patel",
    role: "Guest Experience",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
  },
];

export const amenities = [
  "Co-working lounge",
  "Sunlit rooftop",
  "Community kitchen",
  "Laundry service",
  "Airport transfer support",
  "Cafe and breakfast corner",
];

export const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "WhatsApp", href: "https://wa.me/919999999999" },
];

export const contactDetails = {
  address: "12 Residency Lane, Civil Lines, Jaipur 302006",
  phone: "+91 98765 43210",
  email: "hello@ushostel.com",
  whatsapp: "919999999999",
};

export const sampleRooms = [
  {
    id: "sample-dorm-mixed",
    name: "6-Bed Mixed Dorm",
    type: "dorm",
    description:
      "A bright dorm with privacy curtains, under-bed lockers, personal lights, and a social vibe.",
    price_per_night: 600,
    max_guests: 1,
    bed_type: "Bunk Bed",
    amenities: ["WiFi", "Locker", "AC", "Reading Light"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
    ],
    available: true,
  },
  {
    id: "sample-dorm-female",
    name: "4-Bed Female Dorm",
    type: "dorm",
    description:
      "A calm, secure dorm with soft lighting, wooden accents, and curated essentials for a restful stay.",
    price_per_night: 700,
    max_guests: 1,
    bed_type: "Bunk Bed",
    amenities: ["WiFi", "Locker", "AC", "Vanity Mirror"],
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
    available: true,
  },
  {
    id: "sample-private-standard",
    name: "Private Standard Room",
    type: "private",
    description:
      "A cozy private room with a double bed, ensuite bathroom, and warm textures throughout.",
    price_per_night: 1800,
    max_guests: 2,
    bed_type: "Double Bed",
    amenities: ["WiFi", "AC", "Attached Bathroom", "Desk"],
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
    available: true,
  },
  {
    id: "sample-private-deluxe",
    name: "Deluxe Private Room",
    type: "deluxe",
    description:
      "A spacious premium room with balcony access, king bed, TV, and elevated comfort details.",
    price_per_night: 2500,
    max_guests: 2,
    bed_type: "King Bed",
    amenities: ["WiFi", "AC", "TV", "Balcony", "Attached Bathroom"],
    images: [
      "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1200&q=80",
    ],
    available: true,
  },
];

export const sampleGallery = [
  {
    id: "gallery-room-1",
    url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    caption: "Private room with balcony seating",
    category: "rooms",
  },
  {
    id: "gallery-room-2",
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    caption: "Dorm room with privacy curtains",
    category: "rooms",
  },
  {
    id: "gallery-common-1",
    url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    caption: "Common lounge corner",
    category: "common",
  },
  {
    id: "gallery-events-1",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    caption: "Community gathering night",
    category: "events",
  },
  {
    id: "gallery-food-1",
    url: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80",
    caption: "Breakfast and coffee bar",
    category: "food",
  },
  {
    id: "gallery-common-2",
    url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    caption: "Evening courtyard setup",
    category: "common",
  },
];

export const bookingStatusOptions = ["pending", "confirmed", "cancelled"];

export const galleryCategoryOptions = [
  { label: "All", value: "all" },
  { label: "Rooms", value: "rooms" },
  { label: "Common Areas", value: "common" },
  { label: "Events", value: "events" },
  { label: "Food & Drink", value: "food" },
];

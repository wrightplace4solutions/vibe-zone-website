export const STRIPE_LINKS = {
  option1: import.meta.env.VITE_STRIPE_LINK_OPTION1 || "https://checkout.vzentertainment.fun/b/test_fZueVd1WI8977At9pu5ZC00",
  option2: import.meta.env.VITE_STRIPE_LINK_OPTION2 || "https://checkout.vzentertainment.fun/b/test_4gMeVdcBm9db6wp0SY5ZC01",
};

export const CASHAPP_LINKS = {
  option1: import.meta.env.VITE_CASHAPP_LINK_OPTION1 || "https://cash.app/$REPLACE/100",
  option2: import.meta.env.VITE_CASHAPP_LINK_OPTION2 || "https://cash.app/$REPLACE/150",
};

export const ZELLE_INFO = {
  email: import.meta.env.VITE_ZELLE_EMAIL || "payments@vzentertainment.fun",
  phone: import.meta.env.VITE_ZELLE_PHONE || "(555) 123-4567",
};

export const TZ = "America/New_York";

export const PACKAGES = {
  option1: {
    name: "Plug-and-Play",
    basePrice: 400,
    deposit: 100,
    description: "Essential DJ setup - bring your vibe, we bring the sound"
  },
  option2: {
    name: "Full Setup + Rentals Fees",
    basePrice: 550,
    deposit: 150,
    description: "Complete setup of DJ area, sound system (PA), including rental equipment"
  }
};

export const ADD_ONS = [
  { name: "Basic Lighting Package", price: 80 },
  { name: "Premium Lighting Package", price: 110 },
  { name: "PA Rental (Small Venue)", description: "People: up to ~25–100 guests\n\nSpace: up to ~1,000–1,500 sq ft (e.g., small banquet room, lounge, bar area, community room)", price: 120 },
  { name: "PA Rental (Large Venue)", description:"Guest count: 300–800+ people (weddings, convention ballrooms, gyms, big halls).\n\nRoom size: ≈8,000–20,000 sq ft (or longer throws of 80–150 ft from DJ to back wall).", price: 160 },
];

export const STRIPE_LINKS = {
  option1: import.meta.env.VITE_STRIPE_LINK_OPTION1 || "https://checkout.vzentertainment.fun/b/test_fZueVd1WI8977At9pu5ZC00",
  option2: import.meta.env.VITE_STRIPE_LINK_OPTION2 || "https://checkout.vzentertainment.fun/b/test_4gMeVdcBm9db6wp0SY5ZC01",
};

export const CASHAPP_LINKS = {
  option1: import.meta.env.VITE_CASHAPP_LINK_OPTION1 || "https://cash.app/$REPLACE/275",
  option2: import.meta.env.VITE_CASHAPP_LINK_OPTION2 || "https://cash.app/$REPLACE/475",
};

export const ZELLE_INFO = {
  email: import.meta.env.VITE_ZELLE_EMAIL || "payments@vzentertainment.fun",
  phone: import.meta.env.VITE_ZELLE_PHONE || "(555) 123-4567",
};

export const TZ = "America/New_York";

export const PACKAGES = {
  essentialVibe: {
    name: "Essential Vibe",
    category: "Plug-and-Play Options",
    basePrice: 495,
    deposit: 250,
    duration: "3 hours",
    description: "Customer provides sound system",
    includes: [
      "1 Wireless microphone",
      "15-minute pre-event music consultation call",
      "Line dance and trail ride music specialty",
      "Vibe Que Interactive DJ App access"
    ],
    bestFor: "Intimate gatherings at venues, small corporate events, church gatherings (up to 50 guests)"
  },
  premiumExperience: {
    name: "Premium Experience",
    category: "Plug-and-Play Options",
    basePrice: 695,
    deposit: 350,
    duration: "5 hours",
    description: "Customer provides sound system",
    includes: [
      "1 Wireless microphone",
      "Dedicated planning session (virtually or in-person)",
      "Line dance and trail ride music specialty",
      "Vibe Que Interactive DJ App access"
    ],
    bestFor: "Medium-sized events at various venues, longer celebrations, church events (50-100 guests)"
  },
  vzPartyStarter: {
    name: "VZ Party Starter",
    category: "Complete Entertainment Setups",
    basePrice: 1095,
    deposit: 550,
    duration: "4 hours",
    description: "DJ provides full equipment",
    includes: [
      "Professional sound system (PA)",
      "DJ equipment",
      "2 Wireless microphones",
      "Dedicated planning session (virtually or in-person)",
      "Line dance and trail ride music specialty",
      "Vibe Que Interactive DJ App access"
    ],
    bestFor: "Weddings, corporate events at larger venues, milestone celebrations, church programs (75-150 guests)"
  },
  ultimateExperience: {
    name: "Ultimate Entertainment Experience",
    category: "Complete Entertainment Setups",
    basePrice: 1495,
    deposit: 750,
    duration: "6 hours",
    description: "DJ provides full equipment",
    includes: [
      "Professional sound system (PA)",
      "DJ equipment",
      "2 Wireless microphones",
      "Dedicated planning session (virtually or in-person)",
      "Line dance and trail ride music specialty",
      "Vibe Que Interactive DJ App access"
    ],
    bestFor: "Large weddings, galas, all-day venue events, major church celebrations (150-200+ guests)"
  }
};

export const ADD_ONS = [
  { name: "Basic Lighting Package", price: 125, description: "Enhance your event with professional lighting" },
  { name: "Premium Lighting Upgrade", price: 275, description: "Advanced lighting effects for a premium atmosphere" },
  { name: "Large Venue (200-300+ guests)", price: 200, description: "Additional fee for larger venues with 200-300+ guests" },
  { name: "Extra Hour", price: 125, description: "Additional hour of DJ services beyond package time" },
];

export const IMPORTANT_NOTES = [
  "All packages include dedicated planning sessions (virtually or in-person)",
  "DJ will request prior access to venue for brief walk-through",
  "DJ requires 1-hour setup access prior to event start time",
  "Pricing subject to change based on client's individual needs",
  "Contact us for customized pricing options"
];

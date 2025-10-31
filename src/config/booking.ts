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
  option1: {
    name: "Plug-and-Play",
    basePrice: 550,
    deposit: 275,
    description: "4 hours - You provide the sound system, we bring the skills and music"
  },
  option2: {
    name: "Full Setup",
    basePrice: 950,
    deposit: 475,
    description: "4-5 hours - Complete DJ setup with our professional sound system (PA) and equipment"
  }
};

export const ADD_ONS = [
  { name: "Basic Lighting Package", price: 125 },
  { name: "Premium Lighting Package", price: 250 },
  { name: "Large Venue (100-300+ guests)", description: "Additional fee for larger venues with 100-300+ guests", price: 200 },
  { name: "Extra Hour", description: "Additional hour of DJ services beyond package time", price: 150 },
];

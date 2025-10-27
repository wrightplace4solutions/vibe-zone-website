export const ZAP_CATCH_HOOK = import.meta.env.VITE_ZAP_CATCH_HOOK || "https://hook.us2.make.com/yb9heqwhecy4vnpnlbauixxf6nxc6nno";

export const STRIPE_LINKS = {
  option1: import.meta.env.VITE_STRIPE_LINK_OPTION1 || "https://buy.stripe.com/REPLACE_OPTION1",
  option2: import.meta.env.VITE_STRIPE_LINK_OPTION2 || "https://buy.stripe.com/REPLACE_OPTION2",
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
    name: "Full Setup + Rentals",
    basePrice: 550,
    deposit: 150,
    description: "Complete setup with lighting and PA rental options"
  }
};

export const ADD_ONS = [
  { name: "Basic Lighting Package", price: 80 },
  { name: "Premium Lighting Package", price: 110 },
  { name: "PA Rental (Small Venue)", price: 120 },
  { name: "PA Rental (Large Venue)", price: 160 },
];

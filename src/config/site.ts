export const siteConfig = {
  name: "Peels",
  description: "Find a home for your food scraps, wherever you are.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://www.peels.app",
  // You can add more site-wide configuration here
  links: {
    about: "/",
    terms: "/terms",
    privacy: "/privacy",
    support: "/support",
    colophon: "/colophon",
  },
} as const;

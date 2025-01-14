export const siteConfig = {
  name: "Peels",
  description: "Find a home for your food scraps, wherever you are.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    about: "/",
    terms: "/terms",
    privacy: "/privacy",
    support: "/support",
    colophon: "/colophon",
  },
} as const;

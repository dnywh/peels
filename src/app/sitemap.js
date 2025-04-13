import { siteConfig } from "@/config/site";
import { createClient } from "@/utils/supabase/server";

export default async function sitemap() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings_public_data")
    .select()
    .in("type", ["community", "business"])
  // Filtering out listings with false visibility is handled at the view level, not here

  // Start with the homepage
  const routes = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Add all listings pages 
  listings.forEach((listing) => {
    routes.push({
      url: `${siteConfig.url}/listings/${listing.slug}`,
      lastModified: new Date(listing.created_at), // TODO: add a updated_at column to the listings table and use that instead
      changeFrequency: "monthly",
      priority: 0.8,
    });
  });


  // Add any static pages here
  const staticPages = [
    {
      url: `${siteConfig.url}/map`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/support`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/colophon`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  return [...routes, ...staticPages];
}

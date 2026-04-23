import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { themeMeta } from "@/styles/tokens";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/map",
    // Colours must be static because the manifest is generated at build time
    background_color: themeMeta.manifestBackground,
    theme_color: themeMeta.manifestBackground, // Often applied to status bar on mobile
    display: "standalone",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}

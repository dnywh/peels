import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/map",
    // Ochre/800
    // theme_color: "#451900", // Seems to take over on iOS, despite me defining a background_color
    // Ochre/Special (Around Ochre/100 but a bit more saturated, from Brown Pages)
    // background_color: "#fff6f0",
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

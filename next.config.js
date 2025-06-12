import createNextIntlPlugin from 'next-intl/plugin';
import { withPigment, extendTheme } from "@pigment-css/nextjs-plugin";
import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Allowed list of image formats, hosts
  images: {
    // Increase expiration (Max Age) of cache
    // https://vercel.com/docs/image-optimization#remote-images-cache-key
    // https://vercel.com/docs/image-optimization/managing-image-optimization-costs
    // https://nextjs.org/docs/app/api-reference/components/image#caching-behavior
    // Can be safetly increased as all user-generated imagery use uniques slugs
    minimumCacheTTL: 2678400, // 31 days (default value is `60`, i.e. one minute)
    // Define where remote images can be pulled from
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mfnaqdyunuafbwukbbyr.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
        search: "",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

const tokens = {
  white: {
    100: "hsla(0, 0%, 100%, 1)",
  },
  black: {
    3: "hsla(0, 0%, 0%, 0.03)",
    6: "hsla(0, 0%, 0%, 0.06)",
    15: "hsla(0, 0%, 0%, 0.15)",
    33: "hsla(0, 0%, 0%, 0.33)",
    100: "hsla(0, 0%, 0%, 1)",
  },
  rock: {
    50: "hsla(0, 4%, 95%, 1)",
    100: "hsla(37, 5%, 83%, 1)",
    300: "hsla(38, 5%, 71%, 1)",
    400: "hsla(37, 5%, 61%, 1)",
    600: "hsla(37, 5%, 54%, 1)",
    700: "hsla(37, 5%, 40%, 1)",
    800: "hsla(37, 5%, 25%, 1)",
    900: "hsla(37, 5%, 12%, 1)",
  },
  forest: {
    400: "hsla(81, 95%, 36%, 1)",
  },
  ocean: {
    200: "hsla(192, 75%, 91%, 1)",
    500: "hsla(193, 77%, 43%, 1)",
  },
  ochre: {
    50: "hsla(36, 26%, 99%, 1)", // Hardcoded in manifest.ts
    80: "hsla(36, 26%, 96%, 1)", // Hardcoded in manifest.ts
    100: "hsla(22, 35%, 96%, 1)",
    150: "hsla(22, 35%, 95%, 1)",
    200: "hsla(22, 35%, 91%, 1)",
    300: "hsla(22, 26%, 85%, 1)",
    500: "hsla(22, 87%, 50%, 1)",
    500_0625: "hsla(22, 87%, 50%, 0.0625)",
    600: "hsla(22, 87%, 44%, 1)",
    700: "hsla(22, 97%, 25%, 1)",
    800: "hsla(22, 100%, 14%, 1)",
  },
  kaki: {
    600: "hsla(48, 97%, 64%, 1)",
    700: "hsla(47, 100%, 50%, 1)",
    800: "hsla(47, 100%, 46%, 1)",
  },
};

export default withPigment(withNextIntl(withMDX(nextConfig)), {
  theme: extendTheme({
    colors: {
      logo: {
        primary: tokens.ochre[800],
        quaternary: tokens.ochre[300],
      },
      focus: {
        outline: tokens.ocean[500],
      },
      background: {
        top: tokens.white[100],
        slight: tokens.ochre[50],
        sunk: tokens.ochre[80],
        between: tokens.ochre[100],
        pit: tokens.ochre[150],
        overlay: tokens.black[33],
        error: tokens.ochre[500_0625],
        map: tokens.ocean[200],
        counter: tokens.black[15],
      },
      border: {
        light: tokens.black[3],
        base: tokens.black[6],
        elevated: tokens.black[6],
        stark: tokens.rock[100],
        collide: tokens.rock[50],
        special: tokens.ochre[200],
      },
      tab: {
        active: tokens.forest[400],
        inactive: tokens.rock[300],
        unread: tokens.ochre[500],
      },
      status: {
        accepted: tokens.forest[400],
        rejected: tokens.ochre[500],
      },
      message: {
        sent: {
          background: tokens.forest[400],
          text: tokens.white[100],
        },
        received: {
          background: tokens.ochre[80],
          text: tokens.rock[800],
        },
      },
      marker: {
        dot: tokens.white[100],
        background: {
          residential: tokens.kaki[700],
          community: tokens.ochre[500],
          business: tokens.ochre[700],
        },
        border: tokens.white[100],
      },
      checkbox: {
        border: tokens.ochre[800],
        checked: {
          background: tokens.ochre[800],
          foreground: tokens.white[100],
        },
        unchecked: {
          background: tokens.ochre[50],
          foreground: tokens.white[100],
        },
      },
      radio: {
        checked: {
          background: tokens.ochre[150],
          border: tokens.ochre[700],
        },
        unchecked: {
          background: tokens.white[100],
          border: tokens.rock[50],
        },
        hover: {
          background: tokens.ochre[100],
          border: tokens.rock[100],
        },
      },
      input: {
        invalid: {
          border: tokens.ochre[500],
          text: tokens.ochre[600],
        },
        disabled: {
          text: tokens.rock[400],
        },
        placeholder: {
          text: tokens.rock[400],
        },
      },
      button: {
        primary: {
          background: tokens.kaki[700],
          hover: {
            tint: tokens.white[100],
            mix: `20%`,
          },
          text: tokens.ochre[800],
        },
        secondary: {
          background: tokens.white[100],
          hover: {
            tint: tokens.white[100],
            mix: `40%`,
          },
          text: tokens.ochre[800],
        },
        send: {
          background: tokens.ochre[800],
          hover: {
            tint: tokens.ochre[800],
            mix: `60%`,
          },
          text: tokens.white[100],
        },
        danger: {
          background: tokens.white[100],
          hover: {
            tint: tokens.white[100],
            mix: `20%`,
          },
          text: tokens.ochre[600],
        },
        disabled: {
          background: tokens.rock[50],
          text: tokens.rock[400],
        },
      },
      text: {
        primary: tokens.ochre[800],
        secondary: tokens.rock[800],
        tertiary: tokens.rock[400],
        link: tokens.ochre[700],
        counter: tokens.rock[100],
        overlay: tokens.white[100],
        // Deprecate above in favour of below
        ui: {
          primary: tokens.rock[900],
          secondary: tokens.rock[800],
          tertiary: tokens.rock[700],
          quaternary: tokens.rock[600],
          quinary: tokens.rock[400],
          emptyState: tokens.rock[300],
          error: tokens.ochre[600],
        },
        brand: {
          primary: tokens.ochre[800],
          quaternary: tokens.ochre[300],
        },
      },
    },
    spacing: {
      unit: "0.5rem", // 8px
      gap: {
        page: {
          md: "5rem",
          lg: "12vh",
        },
        section: {
          md: "2.15rem",
          lg: "2.75rem",
        },
        sectionInner: "0.625rem",
        desktop: "1.5rem",
      },
      container: {
        maxWidth: {
          media: "720px", // Homepage content, newsletter issues
          text: "640px", // Markdown, Profile
          aside: "512px" // NewsletterCallout
        },
        textOpticalWidth: "36ch",
      },
      forms: {
        maxWidth: "36rem",
        gap: {
          field: "0.5rem",
        },
      },
      tabBar: {
        maxWidth: "26rem",
        marginX: "1.5rem",
        marginBottom: "0.75rem",
        spaceFor: "6rem",
      },
      dropdownMenu: {
        gap: "4px",
      },
    },
    rotations: {
      avatar: "-3deg",
    },
    corners: {
      thumbnail: "0.375rem", // 6px
      base: "1rem", // 16px
      avatar: {
        small: "0.375rem",
        large: "0.5rem",
      },
    },
    transitions: {
      textColor: "color 150ms ease-in-out",
      svgColor: "stroke 150ms ease-in-out", // svgs that accompany text, like the parent link in StaticPageHeader
    },
    typography: {
      size: {
        p: {
          sm: "0.875rem", // 14px
          md: "1rem", // 16px 
          lg: "1.125rem", // 18px
        }
      },
      lineHeight: {
        h: "115%",
        p: {
          sm: "145%",
          md: "155%",
          lg: "160%",
        }
      }
    }
  }),
});

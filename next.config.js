import { withPigment, extendTheme } from "@pigment-css/nextjs-plugin";
import createMDX from '@next/mdx'


/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configure `pageExtensions` to include markdown and MDX files
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    // Allowed list of image formats, hosts
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'mfnaqdyunuafbwukbbyr.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
                search: '',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    }
                ],
            },
        ]
    }
};

const withMDX = createMDX({
    // Add markdown plugins here, as desired
})


const tokens = {
    white: {
        100: "hsla(0, 0%, 100%, 1)",
    },
    black: {
        3: 'hsla(0, 0%, 0%, 0.03)',
        6: 'hsla(0, 0%, 0%, 0.06)',
        33: 'hsla(0, 0%, 0%, 0.33)',
        100: 'hsla(0, 0%, 0%, 1)',
    },
    rock: {
        50: 'hsla(0, 4%, 95%, 1)',
        100: 'hsla(37, 5%, 83%, 1)',
        300: 'hsla(38, 5%, 71%, 1)',
        400: 'hsla(37, 5%, 61%, 1)',
        600: 'hsla(37, 5%, 54%, 1)',
        700: 'hsla(37, 5%, 40%, 1)',
        800: 'hsla(37, 5%, 25%, 1)',
        900: 'hsla(37, 5%, 12%, 1)',
    },
    forest: {
        400: 'hsla(81, 95%, 36%, 1)'
    },
    ocean: {
        200: 'hsla(192, 75%, 91%, 1)',
        500: 'hsla(193, 77%, 43%, 1)'
    },
    ochre: {
        50: 'hsla(36, 26%, 99%, 1)',
        80: 'hsla(36, 26%, 96%, 1)',
        100: 'hsla(22, 35%, 96%, 1)',
        150: 'hsla(22, 35%, 95%, 1)',
        200: 'hsla(22, 35%, 91%, 1)',
        500: 'hsla(22, 87%, 50%, 1)',
        500_0625: 'hsla(22, 87%, 50%, 0.0625)',
        600: 'hsla(22, 87%, 44%, 1)',
        700: 'hsla(22, 97%, 25%, 1)',
        800: 'hsla(22, 100%, 14%, 1)',
        800_30: 'hsla(22, 100%, 14%, 0.3)',
    },
    kaki: {
        600: 'hsla(48, 97%, 64%, 1)',
        700: 'hsla(47, 100%, 50%, 1)',
        800: 'hsla(47, 100%, 46%, 1)',
    }
}

export default withPigment(
    withMDX(nextConfig), {
    theme: extendTheme({
        colors: {
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
                unread: tokens.ochre[500]
            },
            status: {
                accepted: tokens.forest[400],
                rejected: tokens.ochre[500],
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
                }
            },
            input: {
                invalid: {
                    border: tokens.ochre[500],
                    text: tokens.ochre[600],
                },
                disabled: {
                    text: tokens.rock[400],
                }
            },
            button: {
                primary: {
                    background: tokens.kaki[700],
                    hover: {
                        tint: tokens.white[100],
                        mix: `20%`,
                    },
                    text: tokens.ochre[800]
                },
                secondary: {
                    background: tokens.white[100],
                    hover: {
                        tint: tokens.white[100],
                        mix: `40%`,
                    },
                    text: tokens.ochre[800],
                },
                danger: {
                    background: tokens.white[100],
                    hover: {
                        tint: tokens.white[100],
                        mix: `20%`,
                    },
                    text: tokens.ochre[600]
                },
                disabled: {
                    background: tokens.rock[50],
                    text: tokens.rock[400]
                }
            },
            text: {
                primary: tokens.ochre[800],
                secondary: tokens.rock[800],
                tertiary: tokens.rock[400],
                quaternity: tokens.rock[300],
                link: tokens.ochre[700],
                counter: tokens.rock[100],
                overlay: tokens.white[100],
                // Deprecate above in favour of below
                ui: {
                    primary: tokens.rock[900],
                    secondary: tokens.rock[800],
                    tertiary: tokens.rock[700],
                    quaternary: tokens.rock[600],
                    error: tokens.ochre[600],
                },
                brand: {
                    primary: tokens.ochre[800],
                    quaternary: tokens.ochre[800_30],
                }
            },
        },
        spacing: {
            unit: "0.5rem", // 8px
            forms: {
                maxWidth: "36rem",
                gap: {
                    field: "0.5rem",
                }
            },
            tabBar: {
                maxWidth: "26rem",
                marginX: "1.5rem",
                marginBottom: "0.75rem",
                spaceFor: "6rem"
            }
        },
        rotations: {
            avatar: "-3deg",
        },
        corners: {
            base: "1rem", // 16px
            avatar: {
                small: "0.375rem",
                large: "0.5rem",
            },
        },
        typography: {
            fontFamily: "Inter, sans-serif",
        },
    }),
});

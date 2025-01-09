import { withPigment } from "@pigment-css/nextjs-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {};

const tokens = {
    rock: {
        0: 'hsla(0, 0%, 100%, 1)',
        300: 'hsla(38, 5%, 71%, 1)',
        400: 'hsla(37, 5%, 61%, 1)',
        800: 'hsla(37, 5%, 40%, 1)'
    },
    forest: {
        400: 'hsla(81, 95%, 36%, 1)'
    },
    ochre: {
        80: 'hsla(22, 35%, 91%, 1)',
        500: 'hsla(22, 87%, 50%, 1)',
        700: 'hsla(22, 97%, 25%, 1)',
        800: 'hsla(22, 100%, 14%, 1),'
    },
    kaki: {
        700: 'hsla(47, 100%, 50%, 1)',
    }
}

export default withPigment(nextConfig, {
    theme: {
        colors: {
            background: {
                sunk: tokens.ochre[80],
                top: tokens.rock[0]
            },
            tab: {
                active: tokens.forest[400],
                inactive: tokens.rock[300],
                unread: tokens.ochre[500]
            },
            button: {
                primary: {
                    background: tokens.kaki[700],
                    text: tokens.rock[0]
                },
                secondary: {
                    background: tokens.rock[400],
                    text: tokens.rock[0]
                }
            },
            text: {
                primary: tokens.ochre[800],
                secondary: tokens.rock[800],
                tertiary: tokens.rock[300],
                link: tokens.ochre[700]
            },
        },

        spacing: {
            unit: 8,
        },
        corners: {
            unit: 8,
        },
        typography: {
            fontFamily: "Inter, sans-serif",
        },
    },
});

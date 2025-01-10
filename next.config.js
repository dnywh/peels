import { withPigment } from "@pigment-css/nextjs-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {};

const tokens = {
    white: {
        100: 'hsla(0, 0%, 100%, 1)',
    },
    black: {
        6: 'hsla(0, 0%, 0%, 0.06)',
        100: 'hsla(0, 0%, 0%, 1)',
    },
    rock: {
        50: 'hsla(0, 4%, 95%, 1)',
        100: 'hsla(37, 5%, 83%, 1)',
        300: 'hsla(38, 5%, 71%, 1)',
        400: 'hsla(37, 5%, 61%, 1)',
        800: 'hsla(37, 5%, 40%, 1)'
    },
    forest: {
        400: 'hsla(81, 95%, 36%, 1)'
    },
    ocean: {
        500: 'hsla(193, 77%, 43%, 1)'
    },
    ochre: {
        50: 'hsla(36, 26%, 99%, 1)',
        80: 'hsla(36, 26%, 96%, 1)',
        150: 'hsla(22, 35%, 95%, 1)',
        500: 'hsla(22, 87%, 50%, 1)',
        600: 'hsla(22, 87%, 44%, 1)',
        700: 'hsla(22, 97%, 25%, 1)',
        800: 'hsla(22, 100%, 14%, 1)'
    },
    kaki: {
        700: 'hsla(47, 100%, 50%, 1)',
    }
}

export default withPigment(nextConfig, {
    theme: {
        colors: {
            focus: {
                outline: tokens.ocean[500],
            },
            background: {
                top: tokens.white[100],
                sunk: tokens.ochre[80],
                pit: tokens.ochre[150],
            },
            border: {
                base: tokens.black[6],
                elevated: tokens.black[6],
            },
            tab: {
                active: tokens.forest[400],
                inactive: tokens.rock[300],
                unread: tokens.ochre[500]
            },
            radio: {
                checked: {
                    background: tokens.ochre[150],
                    border: tokens.ochre[700],
                },
                unchecked: {
                    background: tokens.ochre[50],
                    border: tokens.rock[50],
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
                        mix: `20%`,
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
                tertiary: tokens.rock[300],
                link: tokens.ochre[700],
                counter: tokens.rock[100],
            },
        },
        spacing: {
            unit: 8,
            forms: {
                maxWidth: "28rem",
            },
            controls: {
                maxWidth: "30rem",
            }
        },
        corners: {
            base: 16,
        },
        typography: {
            fontFamily: "Inter, sans-serif",
        },
    },
});
